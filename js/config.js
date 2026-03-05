// ============================================
// config.js — Shared Configuration Module
// ============================================
// PURPOSE: Centralizes all shared constants and the Supabase client
//          initialization. Loaded FIRST via <script> in every HTML page,
//          making these values available globally to all subsequent modules.
//
// DESIGN PATTERN: Centralized Configuration (DRY principle)
//   - Page names, API credentials, and shared utilities are defined once
//     here instead of being duplicated across app.js, dashboard.js, etc.
//   - Any future page additions only require updating this single file.
//
// EXTENSIBILITY: To add a new page to the application, simply declare
//   a new constant (e.g., const SETTINGS_PAGE = "settings.html") and
//   reference it from the relevant script.
// ============================================

// --- Page name constants (string literals) ---
// Used by delayedNavigate() to prevent hardcoded URLs scattered across files.
const LOGIN_PAGE = "index.html";
const DASHBOARD_PAGE = "dashboard.html";
const DASHBOARD2_PAGE = "dashboard2.html";
const MAP_TRACKING_PAGE = "maptrackingsystem.html";

// Navigation delay in milliseconds — gives the user visual feedback
// (e.g., "Login successful") before the browser redirects.
const NAV_DELAY_MS = 300;

// --- Supabase Backend-as-a-Service (BaaS) Configuration ---
// Supabase provides a managed PostgreSQL database, REST API, and file
// storage. The "anon key" is a public, row-level-security (RLS) scoped
// key safe for client-side use. All data access is governed by RLS
// policies defined in supabase_setup.sql.
//
// NOTE: For a production system, credentials should be managed via
//       environment variables or a build step, not hardcoded.
const SUPABASE_URL = "https://odxvkdgcqusclxwgikmu.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_r4fBSkPHj6haPelSPfMbgQ_CnIr7Ucg";

// Optional chaining (?.) guards against the Supabase CDN failing to load.
// If supabase is undefined, supabaseClient will be undefined rather than
// throwing a runtime TypeError — a defensive programming technique.
const supabaseClient = window.supabase?.createClient?.(SUPABASE_URL, SUPABASE_ANON_KEY);

// --- Shared Navigation Utility ---
// Wraps window.setTimeout + window.location.href to provide a consistent
// delayed redirect across the entire application.
//
// PARAMETER: clearUserSession (boolean, default false)
//   When true, removes the localStorage keys that identify the logged-in
//   user, effectively logging them out before redirecting.
//
// DATA STRUCTURE: localStorage (Web Storage API)
//   - Key-value string pairs persisted across browser sessions.
//   - Used here as a lightweight client-side session store.
function delayedNavigate(targetPage, clearUserSession = false) {
  window.setTimeout(() => {
    if (clearUserSession) {
      window.localStorage.removeItem("loggedInUserId");
      window.localStorage.removeItem("loggedInUserName");
    }
    window.location.href = targetPage;
  }, NAV_DELAY_MS);
}

