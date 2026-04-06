// Vercel Edge function: fetch a SGCarMart used-car listing page and extract
// fields for auto-filling the wizard. No scraping library — we parse the
// Next.js RSC JSON payload embedded in the page, which is more stable than
// scraping the rendered DOM.
//
// Philosophy (per design doc): if a field is not present in the live page,
// we return it as `null` and include its key in `missing`. We do NOT invent
// fallback values. The client surfaces missing fields so the user can fill
// them in manually.
//
// Failure modes handled explicitly:
//   - Non-sgcarmart URL               -> 400
//   - Listing marked SOLD              -> 410 with error
//   - Fetch / parse totally failed     -> 502 with error
//
// Runtime: Edge (no Node APIs, just fetch + string work).

export const config = { runtime: 'edge' }

interface ParsedListing {
  name: string | null
  purchasePrice: number | null
  annualDepreciation: number | null
  coeYears: number | null
  coeMonths: number | null
  annualRoadTax: number | null
  fuelType: 'petrol' | 'ev' | null
  // Informational — shown to user for sanity check, not used in wizard
  regDate: string | null
  mileageKm: number | null
  omv: number | null
  arf: number | null
  enginecc: number | null
  rawFuelType: string | null
}

type ParsedKey = keyof ParsedListing

// Must be a full listing URL with a trailing numeric listing id.
// e.g. https://www.sgcarmart.com/used-cars/info/tesla-model-3-electric-1482969
const URL_RE = /^https:\/\/www\.sgcarmart\.com\/used-cars\/info\/[^/?#]*-\d{5,}(\/|\?|$)/

function toNumber(raw: string | null): number | null {
  if (!raw) return null
  const m = raw.match(/[\d,]+(\.\d+)?/)
  if (!m) return null
  const n = parseFloat(m[0].replace(/,/g, ''))
  return Number.isFinite(n) ? n : null
}

/** Find a labeled field in the unescaped RSC payload. */
function findLabel(haystack: string, label: string): string | null {
  const pat = new RegExp(
    '"text":"' + label.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') +
    '"[^{}]{0,300}?"desc":"([^"]{0,120})"'
  )
  const m = haystack.match(pat)
  return m ? m[1] : null
}

function parseCoeLeft(s: string | null): { years: number; months: number } | null {
  if (!s) return null
  // e.g. "6yrs 3mths 22days COE left"
  const y = s.match(/(\d+)\s*yrs?/)
  const mo = s.match(/(\d+)\s*mths?/)
  if (!y && !mo) return null
  return {
    years: y ? parseInt(y[1]) : 0,
    months: mo ? parseInt(mo[1]) : 0,
  }
}

function mapFuelType(raw: string | null): 'petrol' | 'ev' | null {
  if (!raw) return null
  const s = raw.toLowerCase()
  if (s === 'electric') return 'ev'
  if (s.includes('petrol') || s.includes('diesel')) return 'petrol'
  return null
}

function parseHtml(rawHtml: string): {
  data: ParsedListing
  missing: ParsedKey[]
  sold: boolean
} {
  // Unescape JS string literals: \" -> " and \\ -> \
  const h = rawHtml.replace(/\\"/g, '"').replace(/\\\\/g, '\\')

  // Check SOLD first — server nulls out price/depreciation for sold listings
  const sold = /"status_text":"SOLD"/i.test(h)

  // Top-level car block (present on all listings)
  const carBlock = h.match(
    /"car_model":"([^"]+)"[^}]*?"price":"(\$\$[0-9,]+|N\.A\.)"[^}]*?"depreciation":"(\$\$[0-9,]+[^"]*|N\.A\.)"[^}]*?"coe_left":"([^"]+)"/
  )

  const name = carBlock ? carBlock[1] : null
  const price = carBlock ? toNumber(carBlock[2]) : null
  const depreciation = carBlock ? toNumber(carBlock[3]) : null
  const coeParsed = parseCoeLeft(carBlock ? carBlock[4] : null)

  const roadTaxRaw = findLabel(h, 'Road Tax')
  const fuelTypeRaw = findLabel(h, 'Fuel Type')
  const omvRaw = findLabel(h, 'OMV')
  const arfRaw = findLabel(h, 'ARF')
  const engineRaw = findLabel(h, 'Engine Cap')
  const mileageRaw = findLabel(h, 'Mileage')
  const regDateRaw = findLabel(h, 'Reg Date')

  const data: ParsedListing = {
    name,
    purchasePrice: price,
    annualDepreciation: depreciation,
    coeYears: coeParsed ? coeParsed.years : null,
    coeMonths: coeParsed ? coeParsed.months : null,
    annualRoadTax: toNumber(roadTaxRaw),
    fuelType: mapFuelType(fuelTypeRaw),
    regDate: regDateRaw,
    mileageKm: toNumber(mileageRaw),
    omv: toNumber(omvRaw),
    arf: toNumber(arfRaw),
    enginecc: toNumber(engineRaw),
    rawFuelType: fuelTypeRaw,
  }

  // Fields the wizard actually consumes — if any are null, they're "missing"
  const wizardFields: ParsedKey[] = [
    'name',
    'purchasePrice',
    'annualDepreciation',
    'coeYears',
    'annualRoadTax',
    'fuelType',
  ]
  const missing = wizardFields.filter(k => data[k] == null)

  return { data, missing, sold }
}

export default async function handler(req: Request): Promise<Response> {
  const { searchParams } = new URL(req.url)
  const target = searchParams.get('url')

  if (!target || !URL_RE.test(target)) {
    return Response.json(
      { error: 'Invalid URL. Paste a full SGCarMart used-car listing URL (e.g. https://www.sgcarmart.com/used-cars/info/tesla-model-3-electric-1482969).' },
      { status: 400 }
    )
  }

  let html: string
  try {
    const upstream = await fetch(target, {
      redirect: 'manual',
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml',
        'Accept-Language': 'en-SG,en;q=0.9',
      },
    })
    // A redirect typically means the listing id was invalid and SGCarMart
    // is sending us to the listings index — treat as not-found.
    if (upstream.status >= 300 && upstream.status < 400) {
      return Response.json(
        { error: 'That listing could not be found on SGCarMart. Please check the URL, or enter details manually.' },
        { status: 404 }
      )
    }
    if (!upstream.ok) {
      return Response.json(
        { error: `SGCarMart returned ${upstream.status}. The listing may have been removed.` },
        { status: 502 }
      )
    }
    html = await upstream.text()
  } catch (e) {
    return Response.json(
      { error: 'Could not reach SGCarMart. Please try again or enter details manually.' },
      { status: 502 }
    )
  }

  const { data, missing, sold } = parseHtml(html)

  // If nothing recognisable parsed, treat as failure rather than returning
  // an all-null payload (e.g. SGCarMart responded with a different page).
  if (!data.name && data.annualRoadTax == null && data.fuelType == null) {
    return Response.json(
      { error: 'Could not read that listing. Please check the URL, or enter details manually.' },
      { status: 422 }
    )
  }

  if (sold) {
    return Response.json(
      {
        error: 'This listing is marked SOLD. Please choose a different listing, or enter details manually.',
        sold: true,
      },
      { status: 410 }
    )
  }

  return Response.json({ data, missing })
}
