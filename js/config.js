// ============================================
// config.js — Shared Configuration
// ============================================
// Centralizes page URLs, Supabase credentials, and the shared
// delayedNavigate() utility. Loaded first by every HTML page via
// <script> so these globals are available to all subsequent scripts.
//
// Dependencies: Supabase JS client (loaded from CDN before this file).
//
// SECURITY: The anon key is RLS-scoped (safe for client-side use).
//   For a production system, credentials should live in env vars.
//
// Extensibility: add a new page constant here; no other file changes.
// ============================================

const LOGIN_PAGE = "index.html";
const DASHBOARD_PAGE = "dashboard.html";
const DASHBOARD2_PAGE = "dashboard2.html";
const MAP_TRACKING_PAGE = "maptrackingsystem.html";

// Brief delay so the user sees feedback ("Login successful") before redirect.
const NAV_DELAY_MS = 300;

// Supabase (BaaS) — provides PostgreSQL + REST API + file storage.
// Data access is governed by Row-Level Security policies.
const SUPABASE_URL = "https://odxvkdgcqusclxwgikmu.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_r4fBSkPHj6haPelSPfMbgQ_CnIr7Ucg";

// Optional chaining prevents a TypeError if the CDN failed to load.
const supabaseClient = window.supabase?.createClient?.(SUPABASE_URL, SUPABASE_ANON_KEY);

/**
 * Navigate to another page after a short delay, optionally clearing
 * the client-side session (localStorage tokens).
 * @param {string}  targetPage       - Relative URL to navigate to.
 * @param {boolean} clearUserSession - If true, remove login tokens first.
 */
function delayedNavigate(targetPage, clearUserSession = false) {
  window.setTimeout(() => {
    if (clearUserSession) {
      window.localStorage.removeItem("loggedInUserId");
      window.localStorage.removeItem("loggedInUserName");
    }
    window.location.href = targetPage;
  }, NAV_DELAY_MS);
}
