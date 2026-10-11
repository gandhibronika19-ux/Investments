# Rupee Ledger

A personal wealth, investment and Indian income-tax tracker that installs on your phone like an app. It runs entirely in the browser: no server to maintain, no build step, and nothing leaves your device unless you turn on sync with your own Supabase account.

It answers five questions in one place:

1. How much money do I have today?
2. How much am I earning each month and year?
3. How much of my wealth is growing, and where am I losing?
4. How much income tax do I owe under each regime, and how can I plan it?
5. Am I on track for my goals?

## What it tracks

| Area | Covered |
|---|---|
| Income | Salary with revisions, bonus, PF, PT and TDS; recurring salary that never double-counts a month; savings interest, dividends and other income |
| Equity awards | ESOPs and RSUs: vesting schedules, exercise, sell-to-cover, perquisite tax kept separate from capital gains, foreign-currency grants |
| Deposits | Fixed deposits (cumulative or payout, premature closure), recurring deposits (missed instalments), PPF (5th-of-month rule, 31 March credit, rate history) |
| Market investments | Mutual funds, ETFs and stocks with FIFO tax lots, SIP schedules, NAV history, XIRR |
| Trading | Futures and options: FIFO matching, every charge (STT, exchange, GST, SEBI, stamp), open positions at mark, win rate, drawdown |
| Balance sheet | Bank, cash and broker accounts, property, gold, vehicles, loans with EMI schedules, card dues |
| Tax | FY 2024-25 to 2026-27 rules, old vs new regime, capital-gains buckets, F&O as business income, rebate, surcharge and cess, TDS reconciliation, advance-tax schedule, what-if planner |
| Planning | Goals linked to real holdings, inflation-adjusted projections, scenario lab (salary rise, extra SIP, lower returns, ESOP fall, F&O losses, FI date) |
| Data | CSV import with column mapping, validation and duplicate skipping; CSV exports for Excel; JSON backup and restore; audit log |

## Put it online (GitHub Pages, about 5 minutes)

1. Create a new **empty** repository on GitHub, for example `rupee-ledger`. A private repository works if your plan includes Pages for private repos; otherwise make it public. No financial data is stored in the repository.
2. Upload this folder's contents, either by dragging the files into **Add file → Upload files** or with git:
   ```bash
   git init && git add . && git commit -m "Rupee Ledger"
   git branch -M main
   git remote add origin https://github.com/<you>/rupee-ledger.git
   git push -u origin main
   ```
3. In the repository, go to **Settings → Pages → Build and deployment** and set **Source** to **GitHub Actions**.
4. The included workflow runs the test suite and deploys. After a minute your app is at `https://<you>.github.io/rupee-ledger/` (shown in the **Actions** tab).

## Install it on your phone

Open your Pages link on the phone, then:

- **Android (Chrome):** tap **Install app** in Settings → Data inside the app, or ⋮ → **Install app / Add to Home screen**.
- **iPhone (Safari):** tap **Share → Add to Home Screen**.

It opens full-screen from its own icon and works offline after the first visit.

## Where your data lives

**Default: this device only.** Records are kept in the browser's storage on that phone or computer. Nothing is sent anywhere. Clearing site data or uninstalling removes them, so use **Settings → Data → Export backup** regularly; the app reminds you every 30 days. To move to another device, export a backup and restore it there.

**Optional: sync across devices with your own Supabase project (free tier is enough).**

1. Create a project at supabase.com.
2. Open **SQL Editor**, paste `supabase/schema.sql` and run it. This creates one table protected by row-level security, so each login can read only its own rows.
3. In **Authentication → URL Configuration**, set **Site URL** to your Pages link.
4. From **Project Settings → API**, copy the **Project URL** and the **anon public** key into `js/config.js`, then commit.
5. Open the app, enter your email, and tap the sign-in link you receive. Export a backup from your device-only copy first and restore it after signing in.

The anon key is meant to be public; security comes from row-level security. Never put the `service_role` key in the app. A copy is also kept on the device so the app works offline, and changes sync when you reconnect. If you edit on two devices while both are offline, the last one to sync wins.

## Customising

Everything is plain HTML, CSS and JavaScript. Edit a file, commit, and GitHub Pages redeploys.

| To change | Edit |
|---|---|
| Colours, fonts, spacing, dark mode | Tokens at the top of `css/app.css` (`--accent`, `--bg`, `--f-display`…) |
| Tax slabs, rebates, capital-gains rates, caps | `TAX_RULES` in `js/engine.js` — one block per financial year. Add a new year by copying the last block. |
| F&O charge rates used for estimates | `FO_CHARGES` in `js/engine.js` |
| PPF interest rates | In the app: Investments → PPF → Add rate |
| Menu sections and their order | `NAV` at the top of `js/app-views.js` |
| Dashboard tiles | `V.overview` in `js/app-views.js` |
| Form fields for any record type | The `edit…()` functions in `js/app-forms.js` |
| Dropdown choices (account types, goal types, categories) | `OPT` at the top of `js/app-forms.js` |
| Insights and alert wording | `insights()` in `js/engine.js`; thresholds in the app under Settings |
| Reports and their columns | `buildReport()` in `js/app-views3.js` |
| CSV import formats | `IMPORT` in `js/app-views3.js` (field names and header-matching patterns) |
| Sample data shown on first launch | `js/sample.js` |
| App name and icon | `manifest.webmanifest`, `<title>` in `index.html`, PNGs in `icons/` |

**After changing any file**, commit and wait for the deploy. Installed apps load the newest files whenever they're online and fall back to the cached copy offline. If you rename or add files, add them to the `SHELL` list in `sw.js` so they're available offline too.

**After changing a calculation**, run the tests:

```bash
npm test          # 60 checks: balances, FD/RD/PPF, FIFO lots, ESOP, F&O, both tax regimes, FY boundaries
npm start         # serves the app at http://localhost:8080
```

### Project layout

```
index.html               app shell, loads everything below
css/app.css              all styling (design tokens at the top)
js/config.js             optional Supabase keys
js/engine.js             calculation engine — pure functions, no UI; tax rules live here
js/sample.js             fictional sample profile
js/app-core.js           state, storage (device / Supabase), forms, tables, charts, exports
js/app-forms.js          add/edit forms for every record type
js/app-views*.js         the ten screens, CSV import, backup, install, sign-in
js/vendor/               Chart.js and supabase-js (bundled so the app works offline)
sw.js                    offline cache
manifest.webmanifest     install metadata
tests/engine.test.js     automated tests (run in CI before every deploy)
supabase/schema.sql      optional sync table with row-level security
samples/*.csv            import templates
```

### How the numbers work

- Money is stored as whole paise; nothing is rounded twice.
- Every module derives its own cash movements into one ledger (salary credit, FD deposit and maturity, MF buys and sells, EMIs, F&O premium and charges, tax payments). Nothing is copied, so nothing is counted twice, and transfers between your own accounts never change net worth.
- Net worth on any date uses the prices and valuations dated on or before it, so adding today's NAV never rewrites the past.
- Income counts salary, accrued interest, dividends, perquisites, realised gains and net F&O. Purchases, transfers, redemptions and market appreciation are not income.
- Capital gains use FIFO lots: listed equity is long-term after 12 months, other assets after 24, and specified debt funds are always short-term.

## Limitations

- No live market prices or bank and broker connections. Enter NAVs and prices, or import CSVs.
- Tax is an estimate for planning. Not modelled: interest under sections 234A/B/C, grandfathering of equity bought before February 2018, let-out property, intraday (speculative) equity, foreign tax credit, AMT, and startup ESOP tax deferral. Have a qualified professional review your return.
- Expired F&O positions need a closing trade to be settled.
- Loan EMIs are assumed paid on schedule; record prepayments.
- Device-only storage depends on the browser keeping site data. Back up.

## Licence

MIT — see `LICENSE`. Third-party components are listed in `THIRD_PARTY_NOTICES.md`.
