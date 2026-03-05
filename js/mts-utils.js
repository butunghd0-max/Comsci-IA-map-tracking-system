// ============================================
// mts-utils.js - Utilities, State, and UI References
// ============================================
// PURPOSE: Provides shared utility functions, application state,
//   UI element references, and the overlay positioning logic.
//
// OOP CONCEPT: Separation of Concerns (SoC)
//   This module separates UTILITY LOGIC from UI rendering and user
//   interaction. Each function has a single responsibility (SRP).
//   Functions are PURE where possible - given the same input, they
//   always return the same output with no side effects.
//
// OOP CONCEPT: Composition over Inheritance
//   Instead of using class hierarchies, this project composes behavior
//   by combining simple functions. For example, validateContact()
//   uses stripNonDigits() internally - this is FUNCTION COMPOSITION.
//
// FUNCTIONAL PROGRAMMING:
//   - PURE FUNCTIONS: stripNonDigits, normalizePhone, formatLatLng
//     produce outputs solely from their inputs (no side effects).
//   - HIGHER-ORDER FUNCTIONS: Array.find() in findNearbyHouse takes
//     a predicate function as an argument.
//   - IMMUTABILITY: const declarations prevent reassignment.
//
// WEB SCIENCE: Document Object Model (DOM)
//   The DOM is a tree-structured OBJECT REPRESENTATION of the HTML
//   document. JavaScript accesses and manipulates it via the DOM API
//   (getElementById, querySelector, etc.). This module caches DOM
//   references for performance (avoids repeated tree traversal).
// ============================================

// --- Geographic Bounding Box (Data Structure: Object Literal) ---
// Defines the latitude/longitude rectangle for Jakarta.
// Used by withinJakartaBounds() to validate pin placement and by
// the Leaflet map to set initial view bounds.
// Coordinates use WGS 84 (standard GPS coordinate system).
const JAKARTA_BOUNDS = {
  south: -6.230,  // Minimum latitude
  west: 106.720,  // Minimum longitude
  north: -6.020,  // Maximum latitude
  east: 106.980,  // Maximum longitude
};

// --- Overlay Coordinate Maps ---
// Pixel positions for navigation links on the background image.
// Same scaling technique as app.js (see positionMapTrackingOverlay).
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

// App rendering area within the background image (white content zone).
// Computed as: x, y, width = rightEdge - x, height = bottomEdge - y - footer.
const MTS_APP_AREA = {
  x: 332,
  y: 215,
  w: 1553 - 332,
  h: 911 - 215 - 28,
};

// --- Input Sanitization Functions ---
// SECURITY: Strips non-digit characters to prevent injection and
//   ensure clean numeric data before database storage.
//   Uses regex \D (non-digit) with global flag for complete removal.
function stripNonDigits(value) {
  return String(value || "").replace(/\D/g, "");
}

// --- Phone Number Normalization ---
// ALGORITHM: Converts Indonesian phone formats to international E.164-like
//   format with country code 62. Handles three input cases:
//   1. Already has "62" prefix -> return as-is
//   2. Starts with "0" (local format) -> replace leading 0 with "62"
//   3. Other formats -> return digits only
// This normalization ensures WhatsApp API links work correctly.
function normalizePhone(contact) {
  if (!contact) return "";
  let num = contact.replace(/[^0-9]/g, ""); // Strip all non-numeric
  if (num.startsWith("62")) return num;
  if (num.startsWith("0")) return "62" + num.slice(1);
  return num;
}

// --- Contact Validation ---
// TECHNIQUE: Multi-step validation with early returns (guard clauses).
// Returns true if valid, or an error message string if invalid.
// This pattern lets callers check: if (result !== true) showError(result);
//
// VALIDATION RULES (Indonesian phone numbers):
//   - Optional field (empty = valid)
//   - Must contain only digits (optionally prefixed with +)
//   - If starts with 62: min 9 digits, max 15 digits
//   - If starts with 0: min 7 digits, max 13 digits
function validateContact(contact) {
  if (!contact) return true;  // Optional field - empty is valid
  const cleaned = contact.replace(/^\+/, ""); // Strip leading + for validation
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

// --- Client-Side Image Compression ---
// WEB SCIENCE: File API & Canvas API
//   The browser provides Web APIs for file handling:
//   - FileReader API: reads file contents asynchronously
//   - Canvas API: provides 2D pixel manipulation
//   - Blob API: represents raw binary data
//
// ALGORITHM: Read -> Decode -> Scale -> Re-encode
//   1. FileReader converts File to data URL (Base64 encoding)
//   2. Image element decodes the Base64 string into pixels
//   3. Canvas draws at scaled dimensions (aspect-ratio preserving)
//   4. canvas.toBlob() re-encodes as JPEG at 80% quality
//
// OOP CONCEPT: Abstraction
//   This function ABSTRACTS a complex multi-step pipeline into a
//   single async call. Callers simply await resizeImage(file) without
//   knowing about FileReader, Canvas, or Blob internals.
//
// FUNCTIONAL PROGRAMMING: Promise
//   Returns a Promise<Blob>, enabling async/await syntax.
//   Promises represent the eventual completion of an async operation.
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

// --- Proximity Detection (Geospatial) ---
// Uses Leaflet's distanceTo() which implements the Haversine formula
// to compute the great-circle distance between two lat/lng points.
// Returns the first house within 50 meters, or null.
//
// ALGORITHM: Linear search O(n) through all houses.
//   For the expected data volume (~hundreds of houses), this is efficient.
//   For larger datasets, a spatial index (e.g., R-tree) would be needed.
function findNearbyHouse(lat, lng) {
  if (!window.L) return null; // Guard: Leaflet must be loaded
  const newPoint = window.L.latLng(lat, lng);
  return state.houses.find((h) => {
    if (!h.lat || !h.lng) return false;
    const existingPoint = window.L.latLng(h.lat, h.lng);
    return newPoint.distanceTo(existingPoint) < 50; // 50-meter threshold
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

// --- Boundary Validation (Geospatial) ---
// Checks if a coordinate falls within the Jakarta bounding box.
// Uses simple comparison operators (efficient O(1) check).
// This prevents users from placing pins outside the valid area.
function withinJakartaBounds(lat, lng) {
  return (
    lat >= JAKARTA_BOUNDS.south &&
    lat <= JAKARTA_BOUNDS.north &&
    lng >= JAKARTA_BOUNDS.west &&
    lng <= JAKARTA_BOUNDS.east
  );
}

// --- Coordinate Formatting ---
// Converts raw numbers to a display string with fixed 6 decimal places.
// Uses Number.isFinite() to reject NaN, Infinity, and non-numeric values.
function formatLatLng(lat, lng) {
  const a = Number(lat);
  const b = Number(lng);
  if (!Number.isFinite(a) || !Number.isFinite(b)) return "";
  return `${a.toFixed(6)}, ${b.toFixed(6)}`;
}

// --- DOM Element References (Cached) ---
// Querying once at load time avoids repeated DOM traversal.
const mapTrackingImage = document.getElementById("bgMapTrackingSystem");
const mapTrackingOverlay = document.getElementById("mapTrackingOverlay");
const loggedInUserIdMap = document.getElementById("loggedInUserIdMap");
const publicActivitySidebarLinkMap = document.getElementById("publicActivitySidebarLinkMap");
const publicActivitiesLinkMap = document.getElementById("publicActivitiesLinkMap");
const closeLinkMap = document.getElementById("closeLinkMap");
const logoutLinkMap = document.getElementById("logoutLinkMap");
const mtsApp = document.getElementById("mtsApp");

// --- Session Verification (Authorization Guard) ---
// Redirects unauthenticated users back to the login page.
// This is a client-side check (not a security boundary).
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

// --- Overlay Positioning ---
// Same responsive scaling algorithm used in app.js and dashboard.js.
// Scales navigation elements proportionally to the background image.

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

// ============================================
// Centralized Application State
// ============================================
// OOP CONCEPT: Encapsulation (State Object)
//   All mutable application data is ENCAPSULATED in a single `state`
//   object. This acts as the application's "model" in MVC architecture.
//   Rather than scattering variables throughout modules, centralizing
//   state makes the application easier to debug, test, and reason about.
//
// OOP CONCEPT: Composition
//   The state object COMPOSES multiple data types:
//   - Primitive types (string, boolean, null)
//   - Collection types (Array, Map)
//   - Object references (Leaflet map instance)
//   This demonstrates JavaScript's COMPOSITIONAL OBJECT MODEL.
//
// DATA STRUCTURES:
//   houses:  Array (ordered, indexed, iterable)
//   markers: ES6 Map (key-value pairs with O(1) lookup)
//   The choice of Map over a plain object allows any key type
//   and guarantees insertion order.
//
// EXTENSIBILITY (Open/Closed Principle):
//   New features can add properties to state without modifying
//   existing code that reads from it.
const state = {
  territory: "",            // Currently selected city
  addMode: false,           // Whether "add pin" mode is active
  selectedHouseId: null,    // ID of the house open in sidebar
  houses: [],               // Array of all house records from database
  markers: new Map(),       // Map<houseId, L.Marker> for marker management
  highlightMarker: null,    // Temporary highlight circle on selected pin
  map: null,                // Leaflet map instance
  clusterGroup: null,       // MarkerClusterGroup for performance
  boundaryRect: null,       // Jakarta boundary rectangle overlay
};

// --- UI Element References ---
// Populated by renderShell() in mts-app.js after the DOM is built.
// Using null initialization with later assignment follows the
// "lazy initialization" pattern.
const ui = {
  shell: null,              // Main app container
  territorySelect: null,    // City dropdown
  toggleGuideBtn: null,     // Show/hide guide button
  addPinBtn: null,          // "Add pin" toggle button
  addByCoordsBtn: null,     // "Add by coordinates" button
  latInput: null,           // Latitude input field
  lngInput: null,           // Longitude input field
  guide: null,              // Quick guide container
  tabMap: null,             // Map tab button
  tabProfiles: null,        // Profiles tab button
  leftPanel: null,          // Left panel (topbar + content area)
  mapWrap: null,            // Map container div
  profilesWrap: null,       // Profiles panel container
  cardsWrap: null,          // House cards container
  searchInput: null,        // Search input field
  priorityBtn: null,        // Priority filter button
  priorityDropdown: null,   // Priority filter dropdown
  caseStatusBtn: null,      // Case status filter button
  caseStatusDropdown: null, // Case status filter dropdown
  typeBtn: null,            // Type filter button
  typeDropdown: null,       // Type filter dropdown
  sortSelect: null,         // Sort order dropdown
  houseCount: null,         // House count display element
  toast: null,              // Toast notification container
  sidebar: null,            // Sidebar panel for house details
  sidebarTitle: null,       // Sidebar header title
  sidebarCloseBtn: null,    // Sidebar close button
  sidebarBody: null,        // Sidebar scrollable content
  sidebarSaveBtn: null,     // Sidebar save button
  sidebarDeleteBtn: null,   // Sidebar delete button
  modalBackdrop: null,      // Modal overlay background
  modalTitle: null,         // Modal header title
  modalCloseBtn: null,      // Modal close button
  modalBody: null,          // Modal content area
  modalCancelBtn: null,     // Modal cancel button
  modalSaveBtn: null,       // Modal save/confirm button
};

// --- Toast Notification ---
// Displays a temporary message that auto-hides after 3 seconds.
// Uses CSS class toggling for show/hide animation.
function showToast(message) {
  if (!ui.toast) return;
  ui.toast.textContent = message;
  ui.toast.classList.add("show");
  window.setTimeout(() => ui.toast && ui.toast.classList.remove("show"), 3000);
}

// --- Guide Visibility Toggle ---
// Toggles the Quick Guide panel and updates button label text.
function setGuideVisible(isVisible) {
  if (!ui.guide || !ui.toggleGuideBtn) return;
  ui.guide.classList.toggle("hidden", !isVisible);
  ui.toggleGuideBtn.textContent = isVisible ? t("hide_guide") : t("show_guide");
}

// --- Tab Switching (Map / Profiles) ---
// Shows one panel and hides the other. After switching to the map tab,
// invalidateSize() is called with a 60ms delay to let the DOM finish
// rendering before Leaflet recalculates tile positions.
function setActiveTab(tab) {
  const isMap = tab === "map";
  ui.tabMap?.classList.toggle("active", isMap);     // Optional chaining
  ui.tabProfiles?.classList.toggle("active", !isMap);

  if (ui.mapWrap) ui.mapWrap.style.display = isMap ? "block" : "none";
  if (ui.profilesWrap) ui.profilesWrap.style.display = isMap ? "none" : "block";

  if (isMap && state.map) {
    // Leaflet needs a size recalculation after container visibility changes.
    window.setTimeout(() => state.map && state.map.invalidateSize(), 60);
  }
}

// --- XSS Prevention (Security) ---
// WEB SCIENCE: Cross-Site Scripting (XSS)
//   XSS is a security vulnerability where an attacker injects malicious
//   scripts into web pages viewed by other users. This happens when
//   user-supplied data (e.g., house names) is inserted into innerHTML
//   without sanitization.
//
// TECHNIQUE: HTML Entity Encoding
//   Replaces characters that have special meaning in HTML (<, >, &, ", ')
//   with their entity equivalents (&lt;, &gt;, etc.). This ensures the
//   browser renders them as TEXT rather than executing them as HTML.
//
// FUNCTIONAL PROGRAMMING: Method Chaining
//   String.replaceAll() calls are chained together. Each call returns
//   a new string (strings are IMMUTABLE in JavaScript), enabling
//   successive transformations in a single expression.
function escapeHtml(value) {
  return String(value || "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

// Alias for readability — semantically marks values used in HTML attributes.
function escapeAttr(value) {
  return escapeHtml(value);
}
