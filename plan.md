# TC Flow — Total Compensation Take-Home Visualizer

**Repo:** `tc-flow` → hosted at **`tc-flow.github.io`**
**Tagline:** "See where every dollar of your TC actually goes."

---

## 1. Project Overview

A static, client-side SPA that takes a software engineer's total compensation package (base, RSU, bonus, ESPP, benefits) and visualizes how money flows from gross TC → pre-tax deductions → taxes → post-tax deductions → actual take-home pay. Inspired by [levels.fyi/calculator](https://www.levels.fyi/calculator/) for comp modeling, and [SankeyMATIC](https://github.com/nowthis/sankeymatic) for flow visualization.

All computation happens in-browser. No backend. No data leaves the client.

---

## 2. Tech Stack

| Layer | Choice | Rationale |
|---|---|---|
| Framework | **React 18+ with TypeScript** | Component-based, great ecosystem for charting libs |
| Build | **Vite** | Fast dev/build, native TS, easy GH Pages deploy |
| Styling | **Tailwind CSS** | Rapid prototyping, responsive out of the box |
| Sankey Chart | **`d3-sankey`** + **D3.js v7** | The actual engine behind SankeyMATIC-style flows; `d3-sankey` computes node/link layout, D3 renders SVG |
| Other Charts | **Recharts** (bar/pie/line built on D3) | React-native charting, easy to compose with the rest of the UI |
| State | **Zustand** | Lightweight, no boilerplate, persists to localStorage for saved scenarios |
| Deployment | **GitHub Pages** via `gh-pages` npm package or GitHub Actions | Free static hosting |
| Testing | **Vitest** + **React Testing Library** | Fast unit tests for tax math, component smoke tests |

### Why `d3-sankey` instead of embedding SankeyMATIC directly

SankeyMATIC is a standalone app (not a library). Under the hood it uses D3's Sankey layout. Using `d3-sankey` directly gives full control over:

- Interactive hover/tooltip per flow
- Dynamic recomputation as inputs change
- Color theming matching the rest of the UI
- Custom node ordering (Gross → Deductions → Taxes → Take-home)

---

## 3. Feature Set

### 3.1 Input Panel (left sidebar / top section)

**Compensation Inputs** (reference: levels.fyi calculator)

- Base salary (annual)
- RSU/Stock grant: total grant value, vesting schedule (1-4 yr, custom %), stock growth %
- Signing bonus (year 1, optional year 2)
- Annual performance bonus (% of base or flat $)
- ESPP: contribution % (up to 15% of salary, capped at $25,000/yr), discount % (typically 15%), lookback toggle
- Relocation bonus

**Pre-Tax Deductions**

- 401(k): contribution % or flat $, employer match formula (e.g., 50% up to 6%)
  - 2026 limit: $24,500 (under 50), $32,500 (50+), $35,750 (60-63 SECURE 2.0 super catch-up)
  - Toggle: Traditional vs Roth 401(k)
- HSA: contribution amount (2026 limit: $4,400 individual / $8,750 family)
- FSA: contribution amount (2026 limit: $3,400)
- Commuter benefits (pre-tax transit/parking)
- Health/dental/vision premiums (employee portion, pre-tax)

**Tax Configuration**

- Filing status: Single, MFJ, MFS, HoH
- State of residence (dropdown with state income tax rates)
- City/local tax (e.g., NYC, SF payroll tax)
- Number of dependents
- Additional withholdings

**Company Type Toggle** (controls which equity section renders)

- **Public Company** (default): RSU/ESPP inputs (existing)
- **Private Company**: Stock options + dilution modeling (see Section 3.6)

**Post-Tax Deductions**

- Roth IRA contribution (informational, doesn't come from paycheck but useful for net savings view)
- After-tax 401(k) / Mega Backdoor Roth (if employer allows)
- Student loan payments
- Other recurring deductions

**Time Period Toggle**

- View as: Weekly / Bi-weekly / Monthly / Annual

### 3.2 Tax Engine (core logic module — `src/engine/`)

```
src/engine/
├── federalTax.ts        # Bracket math (progressive) — reads from loaded TaxYearData
├── stateTax.ts          # State tax calc — reads state tables from TaxYearData
├── ficaTax.ts           # SS + Medicare — reads rates/caps from TaxYearData
├── espp.ts              # ESPP gain modeling (discount + lookback)
├── stockVesting.ts      # RSU vesting schedule + growth projection
├── deductions.ts        # Deduction logic, limits pulled from TaxYearData.limits
├── benefits.ts          # 401k match calc, HSA employer contribution
├── types.ts             # Shared TypeScript interfaces (incl. TaxYearData schema)
├── taxDataLoader.ts     # Fetches + caches JSON from /tax-data/{year}.json
│                        # Current year is statically imported as fallback
│                        # Prior years are lazy-loaded and cached in memory
└── index.ts             # Orchestrator: inputs + TaxYearData → full breakdown
```

**Key Tax Parameters (2026, baked-in with year selector):**

- Federal brackets: 10% / 12% / 22% / 24% / 32% / 35% / 37%
- Standard deduction: $16,100 (single), $32,200 (MFJ)
- Social Security wage base: ~$176,100 (2026 est.)
- FICA: 6.2% SS + 1.45% Medicare (+0.9% Additional Medicare)
- 401(k) limit: $24,500
- HSA limits: $4,400 (self) / $8,750 (family)
- ESPP: $25,000/yr purchase limit

### 3.3 Visualizations

#### Primary: Sankey Diagram (the hero chart)

```
┌──────────┐
│ Gross TC │──→ Federal Tax
│          │──→ State Tax
│          │──→ FICA (SS + Medicare)
│          │──→ 401(k) Traditional
│          │──→ HSA
│          │──→ Health Premiums
│          │──→ ESPP Contribution
│          │──→ ════════════════════
│          │──→ TAKE-HOME PAY
└──────────┘
```

Multi-level flow:

- **Level 0:** Total Comp (base + RSU + bonus + ESPP gain + employer 401k match)
- **Level 1:** Pre-tax deductions split (401k, HSA, FSA, health premiums)
- **Level 2:** Tax split (federal, state, FICA breakdown)
- **Level 3:** Post-tax deductions
- **Level 4:** Net take-home

Implementation: `d3-sankey` for layout computation, raw D3 + SVG for rendering inside a React component. Interactive tooltips on hover showing exact $ and % of gross.

#### Secondary Charts (Recharts)

| Chart | Type | Purpose |
|---|---|---|
| **TC Breakdown Donut** | Donut/Pie | At-a-glance: what % is take-home vs taxes vs savings vs benefits |
| **Monthly Cash Flow Bar** | Stacked Bar | Month-by-month view accounting for RSU vest cliff months, bonus months, ESPP purchase periods |
| **Multi-Year TC Projection** | Line Chart | 4-year view factoring RSU vesting schedule, refreshers, stock growth, salary raises |
| **Tax Marginal Rate Waterfall** | Waterfall Chart | Shows how each dollar is taxed: stacked blocks from 10%→22%→... to your marginal rate |
| **Effective vs Marginal Rate** | Gauge / KPI Card | Side-by-side effective tax rate vs marginal bracket |
| **Savings Allocation Treemap** | Treemap (Recharts or D3) | Visual breakdown of where your "saved" money goes: 401k, HSA, ESPP, Roth, brokerage |
| **Comp Comparison** | Grouped Bar | Compare two offers side-by-side (like levels.fyi's compare feature) |

#### Bonus Visualization Ideas

- **Paycheck Simulator:** Renders a mock pay stub showing gross → each line-item deduction → net deposit per pay period
- **Tax Bracket Overlay:** Interactive slider showing where your income falls on the bracket scale, highlighting how a raise pushes only marginal dollars into the next bracket
- **ESPP ROI Calculator:** Shows effective return from ESPP discount + lookback over purchase periods

### 3.4 Tax Bracket Display & Year Selector

**Always-visible Tax Reference Panel** (sticky sidebar section or collapsible card in the main view):

- Displays the active tax bracket table for the selected year + filing status
- Highlights the row(s) the user's income falls into (based on current inputs)
- Shows: bracket range, marginal rate, tax owed at that bracket, cumulative tax
- Updates reactively as filing status or year changes

**Year Selector Dropdown:**

- Defaults to current year (auto-detected via `new Date().getFullYear()`)
- Dropdown lists available years (e.g., 2020–2026)
- Selecting a prior year fetches that year's tax data JSON from the repo and recomputes everything
- All limits update together: brackets, standard deduction, FICA wage base, 401k/HSA/FSA caps, ESPP limit

**Dynamic Tax Data Architecture:**

- Tax data lives as static JSON files in the repo under `public/tax-data/{year}.json`
- Current year JSON is bundled at build time for instant load (no network request on first paint)
- Prior year JSONs are lazy-fetched from GitHub Pages (`/tc-flow/tax-data/2024.json`, etc.)
- JSON schema covers: federal brackets (all filing statuses), standard deductions, FICA rates/caps, state tax tables, retirement/benefit contribution limits
- Adding a new tax year = adding one JSON file + a one-line entry in the year manifest — no code changes needed

```
public/tax-data/
├── manifest.json        # { "years": [2020, 2021, ..., 2026], "default": 2026 }
├── 2026.json            # Current year (also imported statically as fallback)
├── 2025.json
├── 2024.json
├── 2023.json
├── 2022.json
├── 2021.json
└── 2020.json
```

**JSON Schema (per year):**

```typescript
interface TaxYearData {
  year: number;
  federal: {
    brackets: Record<FilingStatus, { min: number; max: number; rate: number }[]>;
    standardDeduction: Record<FilingStatus, number>;
    amt: { exemption: Record<FilingStatus, number>; phaseout: Record<FilingStatus, number> };
  };
  fica: {
    socialSecurity: { rate: number; wageBase: number };
    medicare: { rate: number; additionalRate: number; additionalThreshold: Record<FilingStatus, number> };
  };
  state: Record<string, {
    brackets: { min: number; max: number; rate: number }[];
    standardDeduction?: number;
    personalExemption?: number;
  }>;
  limits: {
    traditional401k: number;
    traditional401kCatchup50: number;
    traditional401kCatchup60_63?: number;  // SECURE 2.0, only 2025+
    hsaSelf: number;
    hsaFamily: number;
    fsa: number;
    esppAnnual: number;
    iraContribution: number;
    iraCatchup50: number;
  };
}
```

**Tax Bracket Table Component (`TaxBracketTable.tsx`):**

- Renders the full bracket table for the selected filing status
- Row highlighting: the bracket containing the user's taxable income gets a colored highlight bar showing exactly where their income falls within that range
- Shows per-bracket columns: Income Range | Rate | Tax in Bracket | Cumulative Tax
- A small "Your income" marker/arrow on the highlighted row
- Responsive: horizontal scroll on mobile, or collapses to a simplified card view

### 3.5 Additional Features

- **Scenario Comparison:** Save up to 3 scenarios (e.g., "Current Job" vs "Offer A" vs "Offer B"), persist to localStorage
- **Share Link:** Encode inputs as URL query params for sharing (no server needed)
- **Export:** Download Sankey as SVG/PNG, full breakdown as CSV
- **Dark Mode:** Tailwind dark mode toggle
- **Mobile Responsive:** Collapsible input panel, swipeable chart tabs

---

## 4. Project Structure

```
tc-flow/
├── .github/
│   └── workflows/
│       └── deploy.yml           # GH Actions: build + deploy to gh-pages
├── public/
│   └── favicon.svg
├── src/
│   ├── engine/                  # Pure tax/comp calculation logic (no React)
│   │   ├── federalTax.ts
│   │   ├── stateTax.ts
│   │   ├── ficaTax.ts
│   │   ├── espp.ts
│   │   ├── stockVesting.ts
│   │   ├── deductions.ts
│   │   ├── benefits.ts
│   │   ├── types.ts
│   │   └── index.ts
│   ├── components/
│   ├── components/
│   │   ├── InputPanel/          # All input form sections
│   │   │   ├── CompensationInputs.tsx
│   │   │   ├── DeductionInputs.tsx
│   │   │   ├── TaxConfig.tsx
│   │   │   ├── TaxYearSelector.tsx  # Year dropdown, auto-detects current year
│   │   │   └── TimePeriodToggle.tsx
│   │   ├── Charts/
│   │   │   ├── SankeyFlow.tsx       # D3-sankey hero chart
│   │   │   ├── DonutBreakdown.tsx   # Recharts donut
│   │   │   ├── MonthlyBar.tsx       # Recharts stacked bar
│   │   │   ├── MultiYearLine.tsx    # Recharts line
│   │   │   ├── TaxWaterfall.tsx     # Recharts waterfall
│   │   │   ├── SavingsTreemap.tsx   # D3 treemap
│   │   │   └── CompComparison.tsx   # Grouped bar
│   │   ├── TaxBracketTable.tsx  # Always-visible bracket table w/ income highlight
│   │   ├── PaycheckStub.tsx     # Mock pay stub renderer
│   │   ├── SummaryCards.tsx     # KPI cards (effective rate, take-home, etc.)
│   │   ├── ScenarioManager.tsx  # Save/load/compare scenarios
│   │   └── Layout.tsx
│   ├── store/
│   │   └── useCompStore.ts      # Zustand store
│   ├── data/
│   │   └── currentYear.ts       # Static import of current year's JSON as fallback
│   │   │                        # (ensures instant load even if fetch fails)
│   ├── utils/
│   │   ├── formatCurrency.ts
│   │   ├── sankeyDataBuilder.ts # Transforms engine output → d3-sankey input format
│   │   └── urlParams.ts         # Encode/decode for share links
│   ├── App.tsx
│   ├── main.tsx
│   └── index.css
├── tests/
│   ├── engine/
│   │   ├── federalTax.test.ts
│   │   ├── ficaTax.test.ts
│   │   ├── espp.test.ts
│   │   └── integration.test.ts
│   └── components/
│       └── SankeyFlow.test.tsx
├── index.html
├── tailwind.config.ts
├── tsconfig.json
├── vite.config.ts
├── package.json
└── README.md
```

---

## 5. Implementation Phases

### Phase 1: Engine + Sankey MVP (Week 1-2)

1. `npm create vite@latest tc-flow -- --template react-ts`
2. Install deps: `d3`, `d3-sankey`, `recharts`, `zustand`, `tailwindcss`
3. Build `src/engine/` — all pure functions, fully tested
   - Federal tax bracket calculator (progressive)
   - FICA calculator (SS cap + Medicare + Additional Medicare)
   - State tax (start with CA, NY, WA, TX — cover ~60% of SWE population)
   - 401k/HSA/FSA deduction logic with limit enforcement
4. Build `SankeyFlow.tsx` — the hero visualization
   - `sankeyDataBuilder.ts` transforms engine output to `{nodes, links}` format
   - D3-sankey layout → SVG rendering in a React `useEffect`
   - Hover tooltips showing $ and % per flow
5. Basic input form (base salary, bonus, filing status, state, 401k %)
6. Wire it up: inputs → Zustand store → engine → Sankey rerender

### Phase 2: Full Inputs + Secondary Charts (Week 3-4)

1. Add RSU/stock vesting inputs with schedule editor (like levels.fyi)
2. Add ESPP calculator (contribution %, discount, lookback)
3. Build secondary Recharts visualizations: Donut, Monthly Bar, Multi-Year Line
4. Implement time period toggle (weekly/monthly/annual)
5. Add employer match, HSA employer contribution modeling
6. Tax Waterfall chart

### Phase 3: Polish + Features (Week 5-6)

1. Scenario comparison (save/load, side-by-side)
2. Share via URL params
3. SVG/PNG export for Sankey, CSV export for breakdown
4. Dark mode
5. Mobile responsive layout
6. Paycheck stub simulator
7. Remaining state tax rates

### Phase 4: Deploy + Iterate

1. GitHub Actions CI/CD → gh-pages branch
2. README with screenshots, usage guide
3. SEO meta tags, OpenGraph image (screenshot of Sankey)
4. Collect feedback, iterate

---

## 6. Tax Data Loading Strategy

### Principle: Current year is instant, prior years are lazy

```
User opens tc-flow.github.io
  │
  ├─→ Detect current year (2026)
  ├─→ Load bundled /src/data/currentYear.ts (statically imported, 0ms)
  ├─→ Fetch /tax-data/manifest.json to populate year dropdown
  │     └─→ { "years": [2020,2021,2022,2023,2024,2025,2026], "default": 2026 }
  └─→ Render immediately with current year data

User selects "2024" from dropdown
  │
  ├─→ taxDataLoader.ts checks in-memory cache → miss
  ├─→ Fetch /tax-data/2024.json from GitHub Pages
  ├─→ Cache in memory (Map<number, TaxYearData>)
  ├─→ Update Zustand store with new TaxYearData
  └─→ All charts + bracket table + engine recompute reactively
```

### `taxDataLoader.ts`

```typescript
import currentYearData from '../data/currentYear';  // static fallback

const cache = new Map<number, TaxYearData>();
cache.set(currentYearData.year, currentYearData);

export async function loadTaxYear(year: number): Promise<TaxYearData> {
  if (cache.has(year)) return cache.get(year)!;
  
  const resp = await fetch(`${import.meta.env.BASE_URL}tax-data/${year}.json`);
  if (!resp.ok) throw new Error(`Tax data for ${year} not available`);
  
  const data: TaxYearData = await resp.json();
  cache.set(year, data);
  return data;
}

export function getCurrentYearData(): TaxYearData {
  return currentYearData;
}
```

### Adding a new tax year

When the IRS publishes new year parameters:

1. Create `public/tax-data/2027.json` following the `TaxYearData` schema
2. Update `public/tax-data/manifest.json` to include 2027
3. Copy the JSON into `src/data/currentYear.ts` as the new static fallback
4. Commit + push — GitHub Actions deploys automatically
5. No engine code changes needed

### Example: `public/tax-data/2026.json` (abbreviated)

```json
{
  "year": 2026,
  "federal": {
    "brackets": {
      "single": [
        { "min": 0,       "max": 12150,   "rate": 0.10 },
        { "min": 12150,   "max": 49475,   "rate": 0.12 },
        { "min": 49475,   "max": 106000,  "rate": 0.22 },
        { "min": 106000,  "max": 199900,  "rate": 0.24 },
        { "min": 199900,  "max": 252950,  "rate": 0.32 },
        { "min": 252950,  "max": 640600,  "rate": 0.35 },
        { "min": 640600,  "max": null,     "rate": 0.37 }
      ],
      "marriedFilingJointly": [ ... ],
      "marriedFilingSeparately": [ ... ],
      "headOfHousehold": [ ... ]
    },
    "standardDeduction": {
      "single": 16100,
      "marriedFilingJointly": 32200,
      "marriedFilingSeparately": 16100,
      "headOfHousehold": 23500
    }
  },
  "fica": {
    "socialSecurity": { "rate": 0.062, "wageBase": 176100 },
    "medicare": {
      "rate": 0.0145,
      "additionalRate": 0.009,
      "additionalThreshold": {
        "single": 200000,
        "marriedFilingJointly": 250000,
        "marriedFilingSeparately": 125000,
        "headOfHousehold": 200000
      }
    }
  },
  "limits": {
    "traditional401k": 24500,
    "traditional401kCatchup50": 8000,
    "traditional401kCatchup60_63": 11250,
    "hsaSelf": 4400,
    "hsaFamily": 8750,
    "fsa": 3400,
    "esppAnnual": 25000,
    "iraContribution": 7500,
    "iraCatchup50": 1100
  },
  "state": {
    "CA": {
      "brackets": [
        { "min": 0,      "max": 10412,  "rate": 0.01 },
        { "min": 10412,  "max": 24684,  "rate": 0.02 },
        ...
      ],
      "mentalHealthSurcharge": { "threshold": 1000000, "rate": 0.01 },
      "sdiRate": 0.012
    },
    "WA": { "brackets": [], "noIncomeTax": true },
    ...
  }
}
```

> **Note:** Exact 2026 bracket thresholds sourced from IRS Revenue Procedure 2025-32 and Tax Foundation analysis. State brackets should be verified against each state's revenue department for the applicable year.

---

## 7. Sankey Data Structure Example

```typescript
// Output from sankeyDataBuilder.ts
const sankeyData = {
  nodes: [
    { id: "gross",         name: "Gross TC ($280,000)" },
    { id: "pretax",        name: "Pre-Tax Income" },
    { id: "federal",       name: "Federal Tax ($38,200)" },
    { id: "state",         name: "CA State Tax ($14,800)" },
    { id: "ss",            name: "Social Security ($10,918)" },
    { id: "medicare",      name: "Medicare ($4,060)" },
    { id: "401k",          name: "401(k) ($24,500)" },
    { id: "hsa",           name: "HSA ($4,400)" },
    { id: "health",        name: "Health Premiums ($3,600)" },
    { id: "espp",          name: "ESPP ($7,500)" },
    { id: "takehome",      name: "Take-Home ($172,022)" },
  ],
  links: [
    { source: "gross",   target: "401k",     value: 24500 },
    { source: "gross",   target: "hsa",      value: 4400 },
    { source: "gross",   target: "health",   value: 3600 },
    { source: "gross",   target: "pretax",   value: 247500 },
    { source: "pretax",  target: "federal",  value: 38200 },
    { source: "pretax",  target: "state",    value: 14800 },
    { source: "pretax",  target: "ss",       value: 10918 },
    { source: "pretax",  target: "medicare", value: 4060 },
    { source: "pretax",  target: "espp",     value: 7500 },
    { source: "pretax",  target: "takehome", value: 172022 },
  ],
};
```

---

## 8. GitHub Actions Deploy Config

```yaml
# .github/workflows/deploy.yml
name: Deploy to GitHub Pages
on:
  push:
    branches: [main]
jobs:
  build-and-deploy:
    runs-on: ubuntu-latest
    permissions:
      contents: write
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
      - run: npm ci
      - run: npm run build
      - uses: peaceiris/actions-gh-pages@v4
        with:
          github_token: ${{ secrets.GITHUB_TOKEN }}
          publish_dir: ./dist
```

`vite.config.ts` needs `base: '/tc-flow/'` if using `username.github.io/tc-flow`, or `base: '/'` if using a custom domain or org page.

---

## 9. Library Versions (pin these)

```json
{
  "dependencies": {
    "react": "^18.3.0",
    "react-dom": "^18.3.0",
    "d3": "^7.9.0",
    "d3-sankey": "^0.12.3",
    "recharts": "^2.15.0",
    "zustand": "^5.0.0"
  },
  "devDependencies": {
    "typescript": "^5.6.0",
    "vite": "^6.0.0",
    "tailwindcss": "^4.0.0",
    "@types/d3": "^7.4.0",
    "@types/d3-sankey": "^0.12.0",
    "vitest": "^3.0.0",
    "@testing-library/react": "^16.0.0"
  }
}
```

---

## 10. Prompt for Claude Code

Copy this into Claude Code to kick off the project:

```
Create a new Vite + React + TypeScript project called "tc-flow" for a total compensation take-home pay visualizer. Follow the plan in the README.

Start with Phase 1:
1. Set up the project with Vite, React 18, TypeScript, Tailwind CSS v4, Zustand, D3 + d3-sankey, and Recharts
2. Create the tax data JSON infrastructure:
   - public/tax-data/manifest.json listing available years (2020-2026), default: 2026
   - public/tax-data/2026.json (and other years) following the TaxYearData schema from the plan
   - src/data/currentYear.ts statically importing 2026 data as a fallback
   - src/engine/taxDataLoader.ts that fetches + caches year JSONs, with static fallback for current year
3. Build the tax engine in src/engine/ as pure functions that accept TaxYearData as a parameter (NO hardcoded tax values anywhere in the engine):
   - federalTax.ts: Progressive bracket calc reading from taxData.federal.brackets
   - ficaTax.ts: SS + Medicare reading rates/caps from taxData.fica
   - stateTax.ts: State bracket calc reading from taxData.state
   - deductions.ts: 401k, HSA, FSA with limits from taxData.limits
   - types.ts: TypeScript interfaces including TaxYearData schema
4. Write Vitest tests for the engine — inject mock TaxYearData objects, test against known expected values
5. Build TaxYearSelector.tsx: dropdown populated from manifest.json, defaults to new Date().getFullYear()
6. Build TaxBracketTable.tsx: always-visible table showing current brackets for selected year + filing status. Highlight the bracket row the user's taxable income falls into. Columns: Income Range | Rate | Tax in Bracket | Cumulative Tax
7. Build the Sankey diagram component using d3-sankey:
   - sankeyDataBuilder.ts converts engine output to {nodes, links}
   - SankeyFlow.tsx renders interactive SVG with hover tooltips
8. Build a basic input form with: base salary, bonus %, filing status, state, 401k contribution %, HSA
9. Wire everything through Zustand: inputs + selected tax year → taxDataLoader → engine → charts + bracket table
10. Add a donut chart (Recharts) showing the TC breakdown percentages
11. Make it look good with Tailwind — dark sidebar for inputs, light main area for charts, bracket table always visible below or beside the Sankey

The Sankey should flow left-to-right: Gross TC → splits into pre-tax deductions (401k, HSA, health premiums) → remaining flows through tax splits (federal, state, SS, Medicare) → net take-home.

Key architectural rule: The engine NEVER contains hardcoded tax numbers. All tax parameters come from TaxYearData JSON. Changing tax years = loading a different JSON. Adding a new year = adding one JSON file + updating the manifest.
```
