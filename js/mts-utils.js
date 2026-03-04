// ============================================
// Utilities, state, UI references, overlay
// ============================================

const JAKARTA_BOUNDS = {
  south: -6.230,
  west: 106.720,
  north: -6.020,
  east: 106.980,
};

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

const MTS_APP_AREA = {
  x: 332,
  y: 215,
  w: 1553 - 332,
  h: 911 - 215 - 28,
};

function stripNonDigits(value) {
  return String(value || "").replace(/\D/g, "");
}

function normalizePhone(contact) {
  if (!contact) return "";
  let num = contact.replace(/[^0-9]/g, "");
  if (num.startsWith("62")) return num;
  if (num.startsWith("0")) return "62" + num.slice(1);
  return num;
}

function validateContact(contact) {
  if (!contact) return true;  // optional field
  // Strip + for validation
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

// Resize image to max dimension, returns a Blob (JPEG)
function resizeImage(file, maxDim = 1200) {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        let w = img.width, h = img.height;
        if (w > maxDim || h > maxDim) {
          const ratio = Math.min(maxDim / w, maxDim / h);
          w = Math.round(w * ratio);
          h = Math.round(h * ratio);
        }
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

// Check for nearby existing houses (~50m threshold).
// Returns the nearby house object or null.
function findNearbyHouse(lat, lng) {
  if (!window.L) return null;
  const newPoint = window.L.latLng(lat, lng);
  return state.houses.find((h) => {
    if (!h.lat || !h.lng) return false;
    const existingPoint = window.L.latLng(h.lat, h.lng);
    return newPoint.distanceTo(existingPoint) < 50; // meters
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

function withinJakartaBounds(lat, lng) {
  return (
    lat >= JAKARTA_BOUNDS.south &&
    lat <= JAKARTA_BOUNDS.north &&
    lng >= JAKARTA_BOUNDS.west &&
    lng <= JAKARTA_BOUNDS.east
  );
}

function formatLatLng(lat, lng) {
  const a = Number(lat);
  const b = Number(lng);
  if (!Number.isFinite(a) || !Number.isFinite(b)) return "";
  return `${a.toFixed(6)}, ${b.toFixed(6)}`;
}

const mapTrackingImage = document.getElementById("bgMapTrackingSystem");
const mapTrackingOverlay = document.getElementById("mapTrackingOverlay");
const loggedInUserIdMap = document.getElementById("loggedInUserIdMap");
const publicActivitySidebarLinkMap = document.getElementById("publicActivitySidebarLinkMap");
const publicActivitiesLinkMap = document.getElementById("publicActivitiesLinkMap");
const closeLinkMap = document.getElementById("closeLinkMap");
const logoutLinkMap = document.getElementById("logoutLinkMap");
const mtsApp = document.getElementById("mtsApp");

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

// ------------------------
// Overlay positioning
// ------------------------

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

// ------------------------
// Map Tracking System App
// ------------------------

const state = {
  territory: "",
  addMode: false,
  selectedHouseId: null,
  houses: [],
  markers: new Map(),
  highlightMarker: null,
  map: null,
  clusterGroup: null,
  boundaryRect: null,
};

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

function showToast(message) {
  if (!ui.toast) return;
  ui.toast.textContent = message;
  ui.toast.classList.add("show");
  window.setTimeout(() => ui.toast && ui.toast.classList.remove("show"), 3000);
}

function setGuideVisible(isVisible) {
  if (!ui.guide || !ui.toggleGuideBtn) return;
  ui.guide.classList.toggle("hidden", !isVisible);
  ui.toggleGuideBtn.textContent = isVisible ? t("hide_guide") : t("show_guide");
}

function setActiveTab(tab) {
  const isMap = tab === "map";
  ui.tabMap?.classList.toggle("active", isMap);
  ui.tabProfiles?.classList.toggle("active", !isMap);

  if (ui.mapWrap) ui.mapWrap.style.display = isMap ? "block" : "none";
  if (ui.profilesWrap) ui.profilesWrap.style.display = isMap ? "none" : "block";

  if (isMap && state.map) {
    // ResizeObserver handles invalidateSize automatically,
    // but we still need a manual trigger for tab switches.
    window.setTimeout(() => state.map && state.map.invalidateSize(), 60);
  }
}

function escapeHtml(value) {
  return String(value || "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function escapeAttr(value) {
  // Same as escapeHtml, but kept separate for readability.
  return escapeHtml(value);
}
