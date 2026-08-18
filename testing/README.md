# SUGI Dashboard — Automated QA & AI Review System

Automated Playwright-based Quality Assurance and AI visual review system for both the Farmer and Government food security dashboards.

## Directory Structure

```
/testing
├── playwright/
│   ├── config.py              # Base URL, credentials, viewports, paths
│   ├── helpers.py              # Shared QA helper functions
│   ├── farmer_dashboard_test.py   # Farmer dashboard Playwright tests
│   ├── government_dashboard_test.py # Government dashboard Playwright tests
│   ├── report_generator.py     # AI review report generator (Markdown)
│   └── run_all.py              # Orchestrator — runs all tests + reports
├── screenshots/
│   ├── farmer/                 # Farmer dashboard screenshots
│   └── government/             # Government dashboard screenshots
├── reports/
│   ├── farmer_qa_raw.json      # Raw QA test results (JSON)
│   ├── government_qa_raw.json  # Raw QA test results (JSON)
│   ├── farmer_dashboard_review.md   # Final review report (Markdown)
│   └── government_dashboard_review.md # Final review report (Markdown)
└── README.md
```

## Prerequisites

- Python 3.10+
- Playwright (`pip install playwright`)
- Playwright browsers (`playwright install chromium`)
- Node.js / npm (to run the app frontend)
- The SUGI Dashboard app running locally

## Setup

```bash
cd testing/playwright
pip install playwright
playwright install chromium
```

## Configuration

Edit `playwright/config.py` to set:

| Variable | Default | Description |
|----------|---------|-------------|
| `BASE_URL` | `http://localhost:5173` | App URL |
| `CREDENTIALS` | `superadmin@sugi.id` / `superadmin123` | Login |
| `TIMEOUT` | `30000` | Per-action timeout (ms) |
| `VIEWPORT` | `1440x900` | Desktop viewport |

## Running

### Run everything (tests + reports):

```bash
cd testing/playwright
python run_all.py
```

### Run individual dashboard test:

```bash
python farmer_dashboard_test.py
python government_dashboard_test.py
```

### Generate reports only (from cached JSON):

```bash
python report_generator.py
```

## What Gets Tested

| Category | Checks |
|----------|--------|
| **Data Validation** | KPI values, labels, formats (Rp, %, Ton, Kg), missing values |
| **Chart Validation** | Title presence, rendering, canvas detection, count verification |
| **Table Validation** | Row count, pagination, column headers |
| **Map Validation** | Section presence, mode selector, layer options |
| **UI/UX** | Header, insights panel, filter bar, responsive breakpoints |
| **Layout** | Horizontal overflow, section detection, spacing |
| **Interaction** | Login flow, filter change, export button, refresh button |
| **Performance** | Page load time, filter response time, JS errors |

## Reports

Each dashboard gets a comprehensive Markdown report with:

- Executive summary
- Category scores (1-10) with visual bars
- Strengths list
- Issues categorized by severity (Critical / Major / Minor)
- Individual chart reviews with appropriateness assessment
- KPI relevance and readability scoring
- UI/UX component-by-component evaluation
- Performance metrics
- Prioritized improvement recommendations (High / Medium / Low)
- Final verdict with readiness percentage

## Report Scores

Scores are calculated based on:

- **Check pass rate** — proportion of automated checks that pass
- **Severity deductions** — critical failures reduce score more than minor warnings
- **Performance metrics** — load time under 5s contributes positively
- **Code quality analysis** — based on dashboard component structure

**Interpretation:**
- 8.5-10 → Production ready
- 7.0-8.4 → Minor improvements needed
- 5.0-6.9 → Major issues to address
- Below 5.0 → Not production ready
