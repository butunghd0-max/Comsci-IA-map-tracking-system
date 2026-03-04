# 🗺️ Map Tracking System

A web-based map tracking application built for a volunteer humanitarian organization in Jakarta, Indonesia. Volunteers use this system to track visits to orphanages, nursing homes, and rest houses across the city.

**IB Computer Science IA — Criterion C Product**

## Features

- 📍 **Interactive Map** — Leaflet.js with marker clustering, color-coded pins by priority
- 📝 **House Profiles** — Full CRUD with name, type, priority, case status, contact, notes
- 📷 **Photo Management** — Upload, compress, and manage up to 10 photos per house
- 🔍 **Search & Filter** — Multi-criteria filtering by priority, status, type, name, and contact number
- 🌐 **4 Languages** — English, Indonesian, Simplified Chinese, Traditional Chinese
- 📊 **Excel Export** — One-click spreadsheet export via SheetJS
- 📄 **Document Links** — Attach Google Docs, Sheets, and custom URLs to each house
- ⚠️ **Unsaved Changes Guard** — Prevents accidental data loss across all navigation
- 📶 **Offline Indicator** — Visual warning when internet connection drops
- ⏳ **Loading Spinner** — Feedback during data fetches

## Tech Stack

| Component | Technology                                     |
| --------- | ---------------------------------------------- |
| Front-end | Vanilla HTML / CSS / JavaScript                |
| Mapping   | Leaflet.js 1.9.4 + Leaflet.markercluster 1.5.3 |
| Backend   | Supabase (PostgreSQL + REST API + Storage)     |
| Export    | SheetJS (xlsx)                                 |

## Getting Started

1. Clone the repo
2. Open `index.html` in a browser (or serve via any static file server)
3. Log in with a volunteer ID (see `db/supabase_setup.sql` for test credentials)
4. Select **Jakarta** from the city dropdown

## File Structure

```
├── index.html              Login page
├── dashboard.html          Dashboard (legacy UI)
├── dashboard2.html         Public Activity page
├── maptrackingsystem.html  Main application
├── css/
│   ├── base.css            Shared styles
│   └── mts.css             MTS-specific styles
├── js/
│   ├── config.js           Shared constants & Supabase client
│   ├── app.js              Login logic
│   ├── dashboard.js        Dashboard logic
│   ├── dashboard2.js       Public Activity logic
│   ├── mts-i18n.js         Internationalization (4 languages)
│   ├── mts-utils.js        Utilities, state, UI refs
│   ├── mts-map.js          Leaflet map engine
│   ├── mts-sidebar.js      Sidebar CRUD & photo management
│   └── mts-app.js          Shell, filtering, cards, boot
├── db/
│   └── supabase_setup.sql  Database schema & seed data
└── images/                 Background images
```

## License

This project was developed as an IB Computer Science Internal Assessment.
