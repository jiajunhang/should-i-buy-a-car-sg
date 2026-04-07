# Should I Buy a Car? — Singapore

A data-driven tool that helps you decide whether owning a car in Singapore actually makes sense for *you* — against your commute, your income, and your public-transport alternative.

> Live demo: [should-i-buy-a-car-sg](https://should-i-buy-a-car-sg.vercel.app/)

Most people evaluating a car purchase end up in a spreadsheet, lining up depreciation, road tax, insurance, parking, fuel, ERP, maintenance, and loan interest, then comparing the total against public transport. 

Two things usually go wrong: costs get missed or guessed (ERP, maintenance, the opportunity cost of capital tied up in a depreciating asset), and **time never gets priced in** — even though a car often saves 30–60 minutes a day, and for a higher-income professional those minutes are worth real money.

This tool collects your inputs once (the car — with sgCarMart URL auto-fetch, your commute and running costs, your income and financing), then shows a live dashboard that prices your time using `annual comp ÷ work hours`, folds it into the car-vs-PT (public transport) comparison, and delivers a verdict in one of three zones: **sensible**, **borderline**, or **hard to justify**. 

Even when the car isn't financially sensible, the dashboard quantifies the exact monthly premium you'd be paying — reframing the decision as *"is $X/month a fair price for on-demand travel, no waiting, and driving enjoyment?"* Interactive sliders let you stress-test every assumption (salary, commute time, loan rate, down payment…) and watch the verdict shift in real time. Multi-scenario tabs let you compare several cars side-by-side.

![Dashboard](docs/screenshots/dashboard.png)
![Verdict panel](docs/screenshots/verdict.png)
![Sliders](docs/screenshots/sliders.png)

## Run locally

```bash
npm install
npm run dev      # http://localhost:5173
npm test         # computation unit tests
npm run build
```

No API keys or backend required — everything except the optional sgCarMart fetch runs client-side, and your inputs live only in your own browser.

## Disclosure

This project is almost exclusively written by Claude Code.

It is a personal hobby project, not a product. Accurate enough to inform a real decision, but won't replace your own due diligence on financing terms, insurance quotes, or running costs specific to your car.
