// ============================================
// Shared configuration — loaded before all other scripts
// ============================================

const LOGIN_PAGE = "index.html";
const DASHBOARD_PAGE = "dashboard.html";
const DASHBOARD2_PAGE = "dashboard2.html";
const MAP_TRACKING_PAGE = "maptrackingsystem.html";
const NAV_DELAY_MS = 300;

// Supabase (public) project config.
// NOTE: For a real production system, do NOT store plaintext passwords in a table.
// This demo follows the client's current workflow (authorized volunteers only).
const SUPABASE_URL = "https://odxvkdgcqusclxwgikmu.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_r4fBSkPHj6haPelSPfMbgQ_CnIr7Ucg";
const supabaseClient = window.supabase?.createClient?.(SUPABASE_URL, SUPABASE_ANON_KEY);

function delayedNavigate(targetPage, clearUserSession = false) {
  window.setTimeout(() => {
    if (clearUserSession) {
      window.localStorage.removeItem("loggedInUserId");
      window.localStorage.removeItem("loggedInUserName");
    }
    window.location.href = targetPage;
  }, NAV_DELAY_MS);
}
