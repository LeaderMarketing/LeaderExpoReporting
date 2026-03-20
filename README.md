# Leader Expo Attendance Dashboard

An interactive analytics dashboard that tracks and visualises attendee and company metrics from the Leader Expo conference series (2023–2025). Get Quick insight into attendance trends, venue performance, customer retention, and account manager effectiveness.

**Live site:** [leadermarketing.github.io/LeaderExpoReporting](https://leadermarketing.github.io/LeaderExpoReporting/)

---

## What It Does

The dashboard aggregates registration data from multiple years of Leader Expo events across Australian cities (Perth, Sydney, Melbourne, Brisbane, Adelaide) and presents it through four tabs:

### Overview
- KPI cards — Total Attendees, Unique Companies, Returning Rate, New Companies, 3-Year Total
- Year-over-Year attendance and company counts
- New vs Returning companies breakdown
- Venue comparison with top venues highlighted

### Venues
- Venue breakdown with percentages (horizontal bar chart)
- Venue distribution (donut chart)
- Year-over-year venue table with growth badges
- Registration type breakdown (Reseller, Vendor, Staff)

### Retention
- Repeat attendance cohort analysis (1-year, 2-year, 3-year companies)
- Retention funnel visualisation
- Returning vs new company trend line
- Key loyalty metrics and insights

### AM Performance
- Top account managers ranked by registrations
- 2024 vs 2025 comparison chart
- Sortable/filterable leaderboard table with state filters, growth badges, and progress bars

---

## How to Use

Open the [live dashboard](https://leadermarketing.github.io/LeaderExpoReporting/) and navigate between tabs. Charts are interactive — hover for tooltips. The AM Performance tab supports sorting by Total, 2025 count, Growth %, or Companies, and filtering by state.

### Updating the Data

1. Place new Excel files in the appropriate year folder (`2023/`, `2024/`, `2025/`).
2. Run the data processing script:
   ```bash
   python process_data.py
   ```
   This reads the Excel files, aggregates the analytics, and writes `public/expo-data.json`.
3. Push to `main` — GitHub Actions will automatically build and deploy.

---

## Running Locally

```bash
# Install dependencies
npm install

# Start dev server (localhost:5173)
npm run dev

# Build for production
npm run build

# Preview the production build
npm run preview
```

---

## Tech Stack

| Layer            | Technology                                              |
| ---------------- | ------------------------------------------------------- |
| UI Framework     | React 19                                                |
| Charts           | Recharts 3                                              |
| Excel Parsing    | SheetJS (xlsx)                                          |
| Build Tool       | Vite 8                                                  |
| Styling          | CSS3 (custom properties, flexbox, grid), Google Fonts (DM Sans, Space Mono) |
| Data Processing  | Python 3 + openpyxl                                     |
| Linting          | ESLint 9                                                |
| Deployment       | GitHub Pages via GitHub Actions                         |

---

## Project Structure

```
├── public/
│   └── expo-data.json        # Aggregated analytics data (generated)
├── src/
│   ├── App.jsx               # All dashboard components and logic
│   ├── App.css               # Styles (dark theme, responsive)
│   ├── main.jsx              # React entry point
│   └── index.css             # Base styles
├── process_data.py           # ETL script: Excel → JSON
├── .github/workflows/
│   └── deploy.yml            # GitHub Pages CI/CD
├── vite.config.js
└── package.json
```
