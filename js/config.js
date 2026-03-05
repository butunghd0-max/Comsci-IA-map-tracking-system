// ============================================
// config.js - Shared Configuration Module
// ============================================
// PURPOSE: Centralizes all shared constants and the Supabase client
//          initialization. Loaded FIRST via <script> in every HTML page,
//          making these values available globally to all subsequent modules.
//
// WEB SCIENCE: Script Loading Order
//   HTML pages load scripts sequentially via <script src="...">.
//   config.js is loaded first, establishing global constants that
//   subsequent scripts depend on. This is a form of DEPENDENCY
//   MANAGEMENT in client-side web development.
//
// OOP CONCEPT: Encapsulation (Module-Level)
//   Although JavaScript does not enforce private/public access modifiers
//   like Java or Python, this file acts as a module that ENCAPSULATES
//   shared configuration. Other scripts access these values but do not
//   modify them (they are declared with `const` - immutable bindings).
//
// DESIGN PATTERN: Centralized Configuration (DRY - Don't Repeat Yourself)
//   Page names, API credentials, and shared utilities are defined once
//   here instead of being duplicated across app.js, dashboard.js, etc.
//
// EXTENSIBILITY: To add a new page, declare a new constant here and
//   reference it from the relevant script. No other files need changes.
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

// WEB SCIENCE: Client-Server Architecture
//   This application follows the CLIENT-SERVER MODEL. The browser
//   (client) sends HTTP/HTTPS requests to Supabase (server), which
//   responds with JSON data. The Supabase JS library ABSTRACTS the
//   raw HTTP requests (fetch/XMLHttpRequest) behind a clean API.
//
// WEB SCIENCE: Content Delivery Network (CDN)
//   The Supabase JS library is loaded from a CDN (unpkg.com), which
//   serves static files from geographically distributed servers to
//   minimize latency. If the CDN fails, optional chaining prevents errors.
//
// TECHNIQUE: Optional Chaining Operator (?.)
//   A defensive programming technique that short-circuits to `undefined`
//   if any part of the chain is null/undefined, preventing TypeError.
const supabaseClient = window.supabase?.createClient?.(SUPABASE_URL, SUPABASE_ANON_KEY);

// --- Shared Navigation Utility ---
// OOP CONCEPT: Abstraction
//   This function ABSTRACTS the complexity of delayed navigation into
//   a single reusable interface. Callers don't need to know about
//   setTimeout, localStorage cleanup, or URL assignment.
//
// FUNCTIONAL PROGRAMMING: Higher-Order Function / Callback
//   setTimeout takes a CALLBACK FUNCTION (arrow function) as its first
//   argument. The callback is executed asynchronously after NAV_DELAY_MS.
//   Arrow functions (=>) provide concise syntax and lexical `this` binding.
//
// PARAMETER: clearUserSession (boolean, default false)
//   DEFAULT PARAMETER: ES6 feature that provides a fallback value
//   when the argument is not supplied (avoids undefined checks).
//
// WEB SCIENCE: Stateless HTTP & Client-Side Sessions
//   HTTP is a STATELESS PROTOCOL - the server doesn't remember previous
//   requests. To maintain user sessions, this app stores credentials
//   in localStorage (Web Storage API), a client-side key-value store
//   that persists across page reloads and browser sessions.
function delayedNavigate(targetPage, clearUserSession = false) {
  window.setTimeout(() => {
    if (clearUserSession) {
      // Remove session data (CRUD: Delete operation on localStorage)
      window.localStorage.removeItem("loggedInUserId");
      window.localStorage.removeItem("loggedInUserName");
    }
    // WEB SCIENCE: URL Navigation via the Location API (BOM)
    // window.location.href triggers a full HTTP GET request to load
    // the target page, following the standard request-response cycle.
    window.location.href = targetPage;
  }, NAV_DELAY_MS);
}

