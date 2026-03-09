# Map Tracking System

![HTML5](https://img.shields.io/badge/HTML5-E34F26?style=for-the-badge&logo=html5&logoColor=white)
![CSS3](https://img.shields.io/badge/CSS3-1572B6?style=for-the-badge&logo=css3&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)
![Supabase](https://img.shields.io/badge/Supabase-3ECF8E?style=for-the-badge&logo=supabase&logoColor=white)
![Leaflet](https://img.shields.io/badge/Leaflet-199900?style=for-the-badge&logo=Leaflet&logoColor=white)

A web-based map tracking application built for a volunteer humanitarian organization in Jakarta, Indonesia. Volunteers use this system to track visits to orphanages, nursing homes, and rest houses across the city.

**IB Computer Science IA - Criterion C Product**

**Live:** [https://butunghd0-max.github.io/Comsci-IA-map-tracking-system/](https://butunghd0-max.github.io/Comsci-IA-map-tracking-system/)

> **Note:** The live site depends on a free-tier Supabase project which may be paused due to inactivity. If houses don't load or changes don't save, the backend has likely been deactivated. Clone the repo and set up your own Supabase instance using the instructions below for the full experience.

---

## Table of Contents

- [Screenshots](#screenshots)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Architecture](#architecture)
- [Getting Started](#getting-started)
- [Test Credentials](#test-credentials)
- [File Structure](#file-structure)
- [Database Schema](#database-schema)
- [Security Notes](#security-notes)
- [Known Limitations](#known-limitations)
- [Future Improvements](#future-improvements)
- [License](#license)

---

## Screenshots

### Login Page

![Login page](images/screenshots/log%20in.png)

### Map View with Marker Clusters

![Map view](images/screenshots/map%20view%20tab.png)

### Map with Sidebar Open

![Map with sidebar](images/screenshots/map%20wih%20sidebar.png)

### Profile Cards Tab

![Profile cards](images/screenshots/card%20profile%20tab.png)

### Excel Export (Simplified Chinese)

![Spreadsheet export](images/screenshots/spreadsheet%20export%20in%20simplifed%20chinese.png)

---

## Features

- **Interactive Map** - Leaflet.js with marker clustering and color-coded pins by priority level (green = stable, yellow = normal, red = urgent).
- **House Profiles** - Full CRUD for tracking name, type, priority, case status, contact info, visit dates, and notes.
- **Photo Management** - Upload up to 10 photos per house with client-side compression, naming, and captioning via Supabase Storage.
- **Search and Filter** - Multi-criteria filtering by priority, status, type, name, and contact number with real-time map and card updates.
- **Sorting** - Stable multi-key sorting by name, type, status, priority, or last visit date.
- **4 Languages** - Real-time interface translation for English, Indonesian (Bahasa), Simplified Chinese, and Traditional Chinese, persisted in localStorage.
- **Localized Excel Export** - One-click spreadsheet export via SheetJS. Column headers match the currently selected language.
- **Document Links** - Attach Google Docs, Sheets, and custom URLs with labels to each house record, stored as structured JSON.
- **Unsaved Changes Guard** - Warns before navigating away or closing the sidebar when edits have not been saved.
- **Audit Trail** - Tracks `last_modified_by` and `last_modified_at` on every save using the logged-in volunteer identity.
- **Offline Indicator** - Visual banner when internet connection drops.
- **Loading Spinner** - Feedback overlay during data fetches.
- **Input Validation** - Jakarta bounding-box check, proximity duplicate warning, phone number normalization, and XSS prevention via HTML entity encoding.

---

## Tech Stack

| Component    | Technology                                     |
| :----------- | :--------------------------------------------- |
| Front-end    | Vanilla HTML / CSS / JavaScript (ES6+)         |
| Mapping      | Leaflet.js 1.9.4 + Leaflet.markercluster 1.5.3 |
| Backend / DB | Supabase (PostgreSQL + REST API + Storage)     |
| Export       | SheetJS (xlsx)                                 |
| Hosting      | GitHub Pages (static site)                     |

---

## Architecture

The application follows a modular client-side architecture. All logic runs in the browser - there is no custom server. Supabase provides the database (PostgreSQL), REST API, and file storage.

```
Browser
  ├── index.html          → Login (credential check against Supabase)
  ├── dashboard.html      → Legacy dashboard UI (image overlay pattern)
  ├── dashboard2.html     → Public Activities page
  └── maptrackingsystem.html → Main app shell
        ├── mts-app.js     → Boot sequence, filtering, cards, export
        ├── mts-map.js     → Leaflet map, markers, clustering
        ├── mts-sidebar.js → Sidebar CRUD, photos, documents
        ├── mts-utils.js   → Shared state, DOM refs, validation helpers
        └── mts-i18n.js    → Translation dictionary + t() lookup

Supabase
  ├── houses table        → House records (JSONB for links/photos)
  ├── volunteers table    → Login credentials
  └── house-photos bucket → Uploaded images
```

**Data flow:** On boot, `mts-map.js` fetches all house records from Supabase and caches them in `state.houses`. All filtering, sorting, and marker rendering operate on this local cache. Writes (add, edit, delete) persist to Supabase first, then update the cache and UI in place.

---

## Getting Started

### 1. Database Setup (Supabase)

1. Create a new project on [Supabase](https://supabase.com/).
2. Open the **SQL Editor** in your Supabase dashboard.
3. Paste the contents of `db/supabase_setup.sql` and run it. This script:
   - Creates the `volunteers` and `houses` tables with constraints and defaults.
   - Enables Row Level Security (RLS) and applies access policies.
   - Provisions the `house-photos` storage bucket.
   - Inserts 10 test volunteer accounts and 250+ test house records (including edge-case stress data).
4. Copy your **Project URL** and **anon/public API key** from the Supabase dashboard (Settings → API).
5. Update these values in `js/config.js`.

### 2. Run Locally

1. Clone the repository:
   ```bash
   git clone https://github.com/Haven-of-Hiro/Comsci-IA-map-tracking-system.git
   ```
2. Serve the files with any static server. For example, using VS Code Live Server (port 5501) or:
   ```bash
   npx serve .
   ```
3. Open `index.html` in your browser.
4. Log in with the test credentials below and select **Jakarta** from the city dropdown.

---

## Test Credentials

All 10 accounts share the same password: `HQJakut1TzuChi`

Log in with different accounts to test the "last modified by" audit trail. There is no self-registration - accounts are issued by the organization (Yayasan) only.

| User ID      | Name               | Password         |
| :----------- | :----------------- | :--------------- |
| `2016040195` | Admin Volunteer 1  | `HQJakut1TzuChi` |
| `2016040196` | Admin Volunteer 2  | `HQJakut1TzuChi` |
| `2016040197` | Admin Volunteer 3  | `HQJakut1TzuChi` |
| `2016040198` | Admin Volunteer 4  | `HQJakut1TzuChi` |
| `2016040199` | Admin Volunteer 5  | `HQJakut1TzuChi` |
| `2016040200` | Admin Volunteer 6  | `HQJakut1TzuChi` |
| `2016040201` | Admin Volunteer 7  | `HQJakut1TzuChi` |
| `2016040202` | Admin Volunteer 8  | `HQJakut1TzuChi` |
| `2016040203` | Admin Volunteer 9  | `HQJakut1TzuChi` |
| `2016040204` | Admin Volunteer 10 | `HQJakut1TzuChi` |

---

## File Structure

```
├── index.html                 Login page
├── dashboard.html             Dashboard with legacy UI overlay
├── dashboard2.html            Public Activities page
├── maptrackingsystem.html     Main map application shell
├── css/
│   ├── base.css               Shared layout, overlay scaling, accessibility
│   └── mts.css                Map Tracking System UI styles
├── js/
│   ├── config.js              Supabase client, constants, navigation helper
│   ├── app.js                 Login controller, overlay positioning, session guard
│   ├── dashboard.js           Dashboard overlay and navigation logic
│   ├── dashboard2.js          Public Activities overlay and navigation logic
│   ├── mts-i18n.js            i18n dictionary (4 languages) + translation API
│   ├── mts-utils.js           Shared state, DOM refs, validation, formatting
│   ├── mts-map.js             Leaflet map initialization, markers, clustering
│   ├── mts-sidebar.js         Sidebar CRUD, photo upload, document links
│   └── mts-app.js             App shell, filters, sorting, cards, Excel export
├── db/
│   └── supabase_setup.sql     Schema, RLS policies, storage bucket, seed data
└── images/
    ├── bg-login.png            Login page background
    ├── bg-dashboard.png        Dashboard background
    ├── bg-dashboard2.png       Public Activities background
    └── bg-maptrackingsystem.png  Map page background
```

---

## Database Schema

### `volunteers`

| Column       | Type        | Notes                      |
| :----------- | :---------- | :------------------------- |
| id           | UUID (PK)   | Auto-generated             |
| volunteer_id | TEXT UNIQUE | Login identifier           |
| name         | TEXT        | Display name               |
| password     | TEXT        | Plaintext (prototype only) |

### `houses`

| Column           | Type        | Notes                                    |
| :--------------- | :---------- | :--------------------------------------- |
| id               | UUID (PK)   | Auto-generated                           |
| name             | TEXT        | House name (required)                    |
| type             | TEXT        | Orphanage, Nursing Home, or Rest House   |
| status           | TEXT        | new case, active care, follow-up, closed |
| priority         | TEXT        | urgent, normal, stable                   |
| lat / lng        | FLOAT8      | GPS coordinates                          |
| contact          | TEXT        | Phone number                             |
| notes            | TEXT        | Free-text visit notes                    |
| links            | JSONB       | Array of `{name, url}` document links    |
| photos           | JSONB       | Array of `{url, path, name, caption}`    |
| last_visit_date  | DATE        | Most recent visit                        |
| last_modified_by | TEXT        | Volunteer name (audit trail)             |
| last_modified_at | TIMESTAMPTZ | Modification timestamp (audit trail)     |
| created_at       | TIMESTAMPTZ | Auto-set on insert                       |

---

## Security Notes

This is a prototype built for an IB IA submission. The following trade-offs were made intentionally and are documented in the IA write-up:

- **Passwords** are stored as plaintext. Production systems should use hashed passwords or Supabase Auth.
- **Sessions** use `localStorage` on the client side. Production systems should use server-side sessions or JWTs.
- **RLS policies** are currently set to public (`USING (true)`). Production should restrict writes to authenticated users via `auth.role() = 'authenticated'`.
- **XSS prevention** is handled via `escapeHtml()` and `escapeAttr()` utility functions that encode user input before rendering.

---

## Known Limitations

- **Jakarta only** - the bounding box and city dropdown are hardcoded to Jakarta. Other cities are not supported.
- **No offline mode** - the app requires an internet connection to load and save data. Offline edits are not queued.
- **Single-user editing** - if two volunteers edit the same house at the same time, the last save wins. There is no real-time sync or conflict resolution.
- **No pagination** - all house records are fetched at once. Performance may degrade with thousands of records.
- **Photo storage** - uploaded photos are compressed client-side but there is no server-side size limit enforcement.
- **Browser-only** - no native mobile app. The interface is responsive but not optimized for small screens.

---

## Future Improvements

- **Supabase Auth** - replace plaintext password checks with Supabase's built-in authentication for hashed passwords, JWTs, and secure server-side sessions.
- **Multi-city support** - extend the city dropdown to support other cities with their own bounding boxes and tile layers.
- **Real-time sync** - use Supabase Realtime subscriptions so changes made by one volunteer appear instantly for others.
- **Offline queue** - cache edits in IndexedDB when offline and sync them when connectivity returns.
- **Route planning** - integrate routing APIs to help volunteers plan efficient visit routes across multiple houses.
- **Role-based access** - add admin vs volunteer roles so only admins can delete records or manage accounts.
- **Pagination and virtual scrolling** - load house records in pages to handle larger datasets without performance issues.
- **Mobile app** - wrap the existing web app using a framework like Capacitor for a native mobile experience.

---

## License

This project was developed as an IB Diploma Programme Computer Science SL Internal Assessment. All code is original work by the author.

Plagiarism or unauthorized reproduction of this project is not permitted under IB Academic Integrity Policy.

The client's name has been withheld at their request. All volunteer names and credentials in the test data are fictional.

All source files include developer-focused comments (file headers, JSDoc, and inline explanations) so that the client's IT team can understand, maintain, and extend the codebase if the system is accepted for production use.

The accompanying IA paper may be published in this repository in the future, pending IB guidelines on public sharing of assessment work.

---

## References

The original system this project is based on can be viewed at [https://www.tzuchi.or.id/](https://www.tzuchi.or.id/) (click VIS for the original website).

- Agafonkin, Vladimir. _Leaflet_. Version 1.9.4, 2023, [leafletjs.com](https://leafletjs.com). Accessed 16 June 2025.
- Agafonkin, Vladimir. "Leaflet API Reference." _Leaflet Documentation_, [leafletjs.com/reference](https://leafletjs.com/reference.html). Accessed 16 June 2025.
- Leaflet Contributors. _Leaflet.markercluster_. Version 1.5.3, GitHub, [github.com/Leaflet/Leaflet.markercluster](https://github.com/Leaflet/Leaflet.markercluster). Accessed 16 June 2025.
- Mozilla Contributors. "HTMLCanvasElement: toBlob() Method." _MDN Web Docs_, Mozilla, [developer.mozilla.org](https://developer.mozilla.org/en-US/docs/Web/API/HTMLCanvasElement/toBlob). Accessed 16 June 2025.
- Mozilla Contributors. "Window: localStorage Property." _MDN Web Docs_, Mozilla, [developer.mozilla.org](https://developer.mozilla.org/en-US/docs/Web/API/Window/localStorage). Accessed 16 June 2025.
- Mozilla Contributors. "FileReader API." _MDN Web Docs_, Mozilla, [developer.mozilla.org](https://developer.mozilla.org/en-US/docs/Web/API/FileReader). Accessed 16 June 2025.
- Mozilla Contributors. "Navigator: onLine Property." _MDN Web Docs_, Mozilla, [developer.mozilla.org](https://developer.mozilla.org/en-US/docs/Web/API/Navigator/onLine). Accessed 16 June 2025.
- Mozilla Contributors. "Crypto: randomUUID() Method." _MDN Web Docs_, Mozilla, [developer.mozilla.org](https://developer.mozilla.org/en-US/docs/Web/API/Crypto/randomUUID). Accessed 16 June 2025.
- Mozilla Contributors. "ResizeObserver API." _MDN Web Docs_, Mozilla, [developer.mozilla.org](https://developer.mozilla.org/en-US/docs/Web/API/ResizeObserver). Accessed 16 June 2025.
- Mozilla Contributors. "object-fit." _MDN Web Docs_, Mozilla, [developer.mozilla.org](https://developer.mozilla.org/en-US/docs/Web/CSS/object-fit). Accessed 16 June 2025.
- OpenStreetMap Contributors. _OpenStreetMap_. OpenStreetMap Foundation, [openstreetmap.org](https://openstreetmap.org). Accessed 16 June 2025.
- SheetJS LLC. _SheetJS Community Edition_. SheetJS LLC, [sheetjs.com](https://sheetjs.com). Accessed 16 June 2025.
- Supabase Inc. _Supabase_. Supabase Inc., [supabase.com](https://supabase.com). Accessed 16 June 2025.
- Supabase Inc. "JavaScript Client Library." _Supabase Docs_, [supabase.com/docs/reference/javascript](https://supabase.com/docs/reference/javascript). Accessed 16 June 2025.
- Supabase Inc. "Storage." _Supabase Docs_, [supabase.com/docs/guides/storage](https://supabase.com/docs/guides/storage). Accessed 16 June 2025.
- Supabase Inc. "Row Level Security." _Supabase Docs_, [supabase.com/docs/guides/auth/row-level-security](https://supabase.com/docs/guides/auth/row-level-security). Accessed 16 June 2025.
- Tzu Chi Indonesia. _Volunteer Information System (VIS)_. Internal system interface screenshots provided by client, 18 Apr. 2025.

---

> _I hope dapet 34/34 anjay, izin_ 🙏
