// ============================================
// mts-utils.js — Shared Utilities & Application State
// ============================================
// Pure utility functions (validation, formatting, image resize),
// the centralized application state object, cached DOM references,
// and the overlay positioning logic for the legacy-system background.
//
// Depends on: config.js, mts-i18n.js (must load before this file).
//
// Key data structures:
//   state.houses  — Array of house records from Supabase
//   state.markers — ES6 Map (houseId → Leaflet marker) for O(1) lookup
//   ui            — Cached DOM references, populated by renderShell()
// ============================================

// Jakarta bounding box (WGS 84). Used to validate pin placement.
const JAKARTA_BOUNDS = {
  south: -6.230,
  west: 106.720,
  north: -6.020,
  east: 106.980,
};

// Pixel positions for overlay links on bg-maptrackingsystem.png.
const MAP_TRACKING_OVERLAY = {
  userIdX: 473,
  userIdY: 148,
  publicActivitySidebarX: 329,
  publicActivitySidebarY: 501,
  publicActivitySidebarW: 184,
  publicActivitySidebarH: 28,
  publicActivitiesX: 520,
  publicActivitiesY: 186,
  publicActivitiesW: 125,
  publicActivitiesH: 26,
  closeX: 1502,
  closeY: 187,
  closeW: 50,
  closeH: 25,
  logoutX: 1098,
  logoutY: 142,
  logoutW: 58,
  logoutH: 23,
};

// MTS app rendering area inside the background image white zone.
const MTS_APP_AREA = {
  x: 332,
  y: 215,
  w: 1553 - 332,
  h: 911 - 215 - 28,
};

/** Strip all non-digit characters from a value. */
function stripNonDigits(value) {
  return String(value || "").replace(/\D/g, "");
}

/**
 * Normalize an Indonesian phone number to 62xxxxxxxx format.
 * @param {string} contact - Raw input (may contain +, spaces, dashes).
 * @returns {string} Digits-only, starting with 62, or "" if empty.
 */
function normalizePhone(contact) {
  if (!contact) return "";
  let num = contact.replace(/[^0-9]/g, "");
  if (num.startsWith("62")) return num;
  if (num.startsWith("0")) return "62" + num.slice(1); // local → intl
  return num;
}

/**
 * Validate an Indonesian phone number.
 * @param {string} contact
 * @returns {true|string} true if valid, or an error message string.
 */
function validateContact(contact) {
  if (!contact) return true; // optional field
  const cleaned = contact.replace(/^\+/, "");
  if (!/^\d+$/.test(cleaned)) return "Contact must contain only numbers (optionally starting with +)";
  if (cleaned.startsWith("62")) {
    if (cleaned.length < 9) return "Contact must be at least 9 digits with country code";
    if (cleaned.length > 15) return "Contact number is too long";
    return true;
  }
  if (cleaned.startsWith("0")) {
    if (cleaned.length < 7) return "Contact must be at least 7 digits";
    if (cleaned.length > 13) return "Contact must be at most 13 digits";
    return true;
  }
  return "Contact must start with 0 or +62 (e.g. 08xx or +628xx)";
}

/**
 * Compress an image client-side using the Canvas API.
 * Downscales to maxDim (preserving aspect ratio) and re-encodes as JPEG.
 * @param {File}   file   - Image file from <input type="file">.
 * @param {number} maxDim - Maximum width or height in pixels.
 * @returns {Promise<Blob>} JPEG blob at 80% quality.
 */
function resizeImage(file, maxDim = 1200) {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        let w = img.width, h = img.height;
        // Only downscale if either dimension exceeds the threshold
        if (w > maxDim || h > maxDim) {
          const ratio = Math.min(maxDim / w, maxDim / h);
          w = Math.round(w * ratio);
          h = Math.round(h * ratio);
        }
        // HTML5 Canvas API for pixel manipulation
        const canvas = document.createElement("canvas");
        canvas.width = w;
        canvas.height = h;
        canvas.getContext("2d").drawImage(img, 0, 0, w, h);
        canvas.toBlob((blob) => resolve(blob), "image/jpeg", 0.8);
      };
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
  });
}

/**
 * Find an existing house within ~50 m of the given coordinates.
 * Uses Leaflet's distanceTo() (Haversine formula).
 * @param {number} lat
 * @param {number} lng
 * @returns {object|null} The nearby house, or null.
 */
function findNearbyHouse(lat, lng) {
  if (!window.L) return null;
  const newPoint = window.L.latLng(lat, lng);
  return state.houses.find((h) => {
    if (!h.lat || !h.lng) return false;
    const existingPoint = window.L.latLng(h.lat, h.lng);
    return newPoint.distanceTo(existingPoint) < 50;
  }) || null;
}

function delayedNavigate(targetPage, clearUserSession = false) {
  window.setTimeout(() => {
    if (clearUserSession) {
      window.localStorage.removeItem("loggedInUserId");
      window.localStorage.removeItem("loggedInUserName");
    }
    window.location.href = targetPage;
  }, NAV_DELAY_MS);
}

/** @returns {boolean} true if (lat, lng) falls inside the Jakarta bounding box. */
function withinJakartaBounds(lat, lng) {
  return (
    lat >= JAKARTA_BOUNDS.south &&
    lat <= JAKARTA_BOUNDS.north &&
    lng >= JAKARTA_BOUNDS.west &&
    lng <= JAKARTA_BOUNDS.east
  );
}

/** Format lat/lng as a fixed-6-decimal display string. */
function formatLatLng(lat, lng) {
  const a = Number(lat);
  const b = Number(lng);
  if (!Number.isFinite(a) || !Number.isFinite(b)) return "";
  return `${a.toFixed(6)}, ${b.toFixed(6)}`;
}

// Cached DOM references.
const mapTrackingImage = document.getElementById("bgMapTrackingSystem");
const mapTrackingOverlay = document.getElementById("mapTrackingOverlay");
const loggedInUserIdMap = document.getElementById("loggedInUserIdMap");
const publicActivitySidebarLinkMap = document.getElementById("publicActivitySidebarLinkMap");
const publicActivitiesLinkMap = document.getElementById("publicActivitiesLinkMap");
const closeLinkMap = document.getElementById("closeLinkMap");
const logoutLinkMap = document.getElementById("logoutLinkMap");
const mtsApp = document.getElementById("mtsApp");

// Redirect to login if no session found (client-side guard only).
const activeUserId = window.localStorage.getItem("loggedInUserId");
const activeUserName = window.localStorage.getItem("loggedInUserName");
if (!activeUserId) {
  window.location.href = LOGIN_PAGE;
}
if (loggedInUserIdMap) {
  loggedInUserIdMap.textContent = (activeUserName || "").trim() || activeUserId || "";
}

if (!window.L) {
  // Leaflet failed to load.
  // We still render the page, but the app will show an error.
}

/**
 * Scale overlay elements to match the rendered background image.
 * Same aspect-ratio-aware algorithm as positionOverlay() in app.js.
 */

function positionMapTrackingOverlay() {
  if (
    !mapTrackingImage ||
    !mapTrackingOverlay ||
    !loggedInUserIdMap ||
    !publicActivitySidebarLinkMap ||
    !publicActivitiesLinkMap ||
    !closeLinkMap ||
    !logoutLinkMap ||
    !mtsApp
  ) {
    return;
  }

  const rect = mapTrackingImage.getBoundingClientRect();
  const naturalWidth = mapTrackingImage.naturalWidth;
  const naturalHeight = mapTrackingImage.naturalHeight;
  if (!rect.width || !rect.height || !naturalWidth || !naturalHeight) return;

  const scale = Math.min(rect.width / naturalWidth, rect.height / naturalHeight);
  const renderedWidth = naturalWidth * scale;
  const renderedHeight = naturalHeight * scale;
  const offsetX = (rect.width - renderedWidth) / 2;
  const offsetY = (rect.height - renderedHeight) / 2;

  const renderedLeft = rect.left + offsetX;
  const renderedTop = rect.top + offsetY;

  const scaleX = renderedWidth / naturalWidth;
  const scaleY = renderedHeight / naturalHeight;

  mapTrackingOverlay.style.left = `${renderedLeft}px`;
  mapTrackingOverlay.style.top = `${renderedTop}px`;
  mapTrackingOverlay.style.width = `${renderedWidth}px`;
  mapTrackingOverlay.style.height = `${renderedHeight}px`;

  loggedInUserIdMap.style.left = `${MAP_TRACKING_OVERLAY.userIdX * scaleX}px`;
  loggedInUserIdMap.style.top = `${MAP_TRACKING_OVERLAY.userIdY * scaleY}px`;
  loggedInUserIdMap.style.fontSize = `${Math.max(10, 13 * scaleY)}px`;

  publicActivitySidebarLinkMap.style.left = `${MAP_TRACKING_OVERLAY.publicActivitySidebarX * scaleX}px`;
  publicActivitySidebarLinkMap.style.top = `${MAP_TRACKING_OVERLAY.publicActivitySidebarY * scaleY}px`;
  publicActivitySidebarLinkMap.style.width = `${MAP_TRACKING_OVERLAY.publicActivitySidebarW * scaleX}px`;
  publicActivitySidebarLinkMap.style.height = `${MAP_TRACKING_OVERLAY.publicActivitySidebarH * scaleY}px`;

  publicActivitiesLinkMap.style.left = `${MAP_TRACKING_OVERLAY.publicActivitiesX * scaleX}px`;
  publicActivitiesLinkMap.style.top = `${MAP_TRACKING_OVERLAY.publicActivitiesY * scaleY}px`;
  publicActivitiesLinkMap.style.width = `${MAP_TRACKING_OVERLAY.publicActivitiesW * scaleX}px`;
  publicActivitiesLinkMap.style.height = `${MAP_TRACKING_OVERLAY.publicActivitiesH * scaleY}px`;

  closeLinkMap.style.left = `${MAP_TRACKING_OVERLAY.closeX * scaleX}px`;
  closeLinkMap.style.top = `${MAP_TRACKING_OVERLAY.closeY * scaleY}px`;
  closeLinkMap.style.width = `${MAP_TRACKING_OVERLAY.closeW * scaleX}px`;
  closeLinkMap.style.height = `${MAP_TRACKING_OVERLAY.closeH * scaleY}px`;

  logoutLinkMap.style.left = `${MAP_TRACKING_OVERLAY.logoutX * scaleX}px`;
  logoutLinkMap.style.top = `${MAP_TRACKING_OVERLAY.logoutY * scaleY}px`;
  logoutLinkMap.style.width = `${MAP_TRACKING_OVERLAY.logoutW * scaleX}px`;
  logoutLinkMap.style.height = `${MAP_TRACKING_OVERLAY.logoutH * scaleY}px`;

  // Position the app inside the large white area.
  mtsApp.style.left = `${MTS_APP_AREA.x * scaleX}px`;
  mtsApp.style.top = `${MTS_APP_AREA.y * scaleY}px`;
  mtsApp.style.width = `${MTS_APP_AREA.w * scaleX}px`;
  mtsApp.style.height = `${MTS_APP_AREA.h * scaleY}px`;
}

// ---- Centralized Application State ----
// Single source of truth for all mutable data.
// Extensibility: add new properties here without touching existing consumers.
const state = {
  territory: "",
  addMode: false,
  selectedHouseId: null,
  houses: [],               // Array of house records from Supabase
  markers: new Map(),       // houseId → Leaflet marker (O(1) lookup)
  highlightMarker: null,
  map: null,
  clusterGroup: null,
  boundaryRect: null,
};

// UI element refs — populated by renderShell() in mts-app.js.
const ui = {
  shell: null,
  territorySelect: null,
  toggleGuideBtn: null,
  addPinBtn: null,
  addByCoordsBtn: null,
  latInput: null,
  lngInput: null,
  guide: null,
  tabMap: null,
  tabProfiles: null,
  leftPanel: null,
  mapWrap: null,
  profilesWrap: null,
  cardsWrap: null,
  searchInput: null,
  priorityBtn: null,
  priorityDropdown: null,
  caseStatusBtn: null,
  caseStatusDropdown: null,
  typeBtn: null,
  typeDropdown: null,
  sortSelect: null,
  houseCount: null,
  toast: null,
  sidebar: null,
  sidebarTitle: null,
  sidebarCloseBtn: null,
  sidebarBody: null,
  sidebarSaveBtn: null,
  sidebarDeleteBtn: null,
  modalBackdrop: null,
  modalTitle: null,
  modalCloseBtn: null,
  modalBody: null,
  modalCancelBtn: null,
  modalSaveBtn: null,
};

/** Show a toast notification that auto-hides after 3 s. */
function showToast(message) {
  if (!ui.toast) return;
  ui.toast.textContent = message;
  ui.toast.classList.add("show");
  window.setTimeout(() => ui.toast && ui.toast.classList.remove("show"), 3000);
}

/** Toggle the Quick Guide panel visibility. */
function setGuideVisible(isVisible) {
  if (!ui.guide || !ui.toggleGuideBtn) return;
  ui.guide.classList.toggle("hidden", !isVisible);
  ui.toggleGuideBtn.textContent = isVisible ? t("hide_guide") : t("show_guide");
}

/** Switch between the Map and Profiles tabs. */
function setActiveTab(tab) {
  const isMap = tab === "map";
  ui.tabMap?.classList.toggle("active", isMap);
  ui.tabProfiles?.classList.toggle("active", !isMap);

  if (ui.mapWrap) ui.mapWrap.style.display = isMap ? "block" : "none";
  if (ui.profilesWrap) ui.profilesWrap.style.display = isMap ? "none" : "block";

  if (isMap && state.map) {
    // Leaflet needs a size recalculation after the container becomes visible.
    window.setTimeout(() => state.map && state.map.invalidateSize(), 60);
  }
}

/**
 * Escape HTML special characters to prevent XSS when using innerHTML.
 * @param {string} value
 * @returns {string} Safe string with &, <, >, ", ' escaped.
 */
function escapeHtml(value) {
  return String(value || "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

/** Alias of escapeHtml — semantically marks values used inside HTML attributes. */
function escapeAttr(value) {
  return escapeHtml(value);
}
