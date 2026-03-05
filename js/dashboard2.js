// ============================================
// dashboard2.js — Public Activities Dashboard Controller
// ============================================
// Navigation hub for the Map Tracking System page. Also provides
// a "Close" (back to dashboard) button and Logout.
//
// Depends on: config.js (LOGIN_PAGE, DASHBOARD_PAGE, MAP_TRACKING_PAGE,
//             delayedNavigate).
// Same overlay pattern and session guard as dashboard.js.
// ============================================

// Pixel positions relative to bg-dashboard2.png (1885×911).
const DASHBOARD2_OVERLAY = {
  userIdX: 473,
  userIdY: 148,
  publicActivitySidebarX: 329,
  publicActivitySidebarY: 501,
  publicActivitySidebarW: 184,
  publicActivitySidebarH: 28,
  publicActivitiesTopX: 685,
  publicActivitiesTopY: 186,
  publicActivitiesTopW: 110,
  publicActivitiesTopH: 26,
  mapTrackX: 966,
  mapTrackY: 226,
  mapTrackW: 206,
  mapTrackH: 30,
  closeX: 1516,
  closeY: 190,
  closeW: 40,
  closeH: 18,
  logoutX: 1098,
  logoutY: 142,
  logoutW: 58,
  logoutH: 23
};

const dashboard2Image = document.getElementById("bgDashboard2");
const dashboard2Overlay = document.getElementById("dashboard2Overlay");
const loggedInUserId2 = document.getElementById("loggedInUserId2");
const publicActivitySidebarLink2 = document.getElementById("publicActivitySidebarLink2");
const publicActivitiesTopLink2 = document.getElementById("publicActivitiesTopLink2");
const mapTrackingButton = document.getElementById("mapTrackingButton");
const closeLink2 = document.getElementById("closeLink2");
const logoutLink2 = document.getElementById("logoutLink2");

// Redirect to login if no session exists.
const activeUserId = window.localStorage.getItem("loggedInUserId");
const activeUserName = window.localStorage.getItem("loggedInUserName");
if (!activeUserId) {
  window.location.href = LOGIN_PAGE;
}
loggedInUserId2.textContent = (activeUserName || "").trim() || activeUserId || "";

/**
 * Scale overlay elements to match the rendered background image.
 * Same algorithm as dashboard.js and app.js.
 */
function positionDashboard2Overlay() {
  if (
    !dashboard2Image ||
    !dashboard2Overlay ||
    !loggedInUserId2 ||
    !publicActivitySidebarLink2 ||
    !publicActivitiesTopLink2 ||
    !mapTrackingButton ||
    !closeLink2 ||
    !logoutLink2
  ) {
    return;
  }
  const rect = dashboard2Image.getBoundingClientRect();
  const naturalWidth = dashboard2Image.naturalWidth;
  const naturalHeight = dashboard2Image.naturalHeight;
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

  dashboard2Overlay.style.left = `${renderedLeft}px`;
  dashboard2Overlay.style.top = `${renderedTop}px`;
  dashboard2Overlay.style.width = `${renderedWidth}px`;
  dashboard2Overlay.style.height = `${renderedHeight}px`;

  loggedInUserId2.style.left = `${DASHBOARD2_OVERLAY.userIdX * scaleX}px`;
  loggedInUserId2.style.top = `${DASHBOARD2_OVERLAY.userIdY * scaleY}px`;
  loggedInUserId2.style.fontSize = `${Math.max(10, 13 * scaleY)}px`;

  publicActivitySidebarLink2.style.left = `${DASHBOARD2_OVERLAY.publicActivitySidebarX * scaleX}px`;
  publicActivitySidebarLink2.style.top = `${DASHBOARD2_OVERLAY.publicActivitySidebarY * scaleY}px`;
  publicActivitySidebarLink2.style.width = `${DASHBOARD2_OVERLAY.publicActivitySidebarW * scaleX}px`;
  publicActivitySidebarLink2.style.height = `${DASHBOARD2_OVERLAY.publicActivitySidebarH * scaleY}px`;

  publicActivitiesTopLink2.style.left = `${DASHBOARD2_OVERLAY.publicActivitiesTopX * scaleX}px`;
  publicActivitiesTopLink2.style.top = `${DASHBOARD2_OVERLAY.publicActivitiesTopY * scaleY}px`;
  publicActivitiesTopLink2.style.width = `${DASHBOARD2_OVERLAY.publicActivitiesTopW * scaleX}px`;
  publicActivitiesTopLink2.style.height = `${DASHBOARD2_OVERLAY.publicActivitiesTopH * scaleY}px`;

  mapTrackingButton.style.left = `${DASHBOARD2_OVERLAY.mapTrackX * scaleX}px`;
  mapTrackingButton.style.top = `${DASHBOARD2_OVERLAY.mapTrackY * scaleY}px`;
  mapTrackingButton.style.width = `${DASHBOARD2_OVERLAY.mapTrackW * scaleX}px`;
  mapTrackingButton.style.height = `${DASHBOARD2_OVERLAY.mapTrackH * scaleY}px`;
  mapTrackingButton.style.fontSize = `${Math.max(10, 12 * scaleY)}px`;

  closeLink2.style.left = `${DASHBOARD2_OVERLAY.closeX * scaleX}px`;
  closeLink2.style.top = `${DASHBOARD2_OVERLAY.closeY * scaleY}px`;
  closeLink2.style.width = `${DASHBOARD2_OVERLAY.closeW * scaleX}px`;
  closeLink2.style.height = `${DASHBOARD2_OVERLAY.closeH * scaleY}px`;

  logoutLink2.style.left = `${DASHBOARD2_OVERLAY.logoutX * scaleX}px`;
  logoutLink2.style.top = `${DASHBOARD2_OVERLAY.logoutY * scaleY}px`;
  logoutLink2.style.width = `${DASHBOARD2_OVERLAY.logoutW * scaleX}px`;
  logoutLink2.style.height = `${DASHBOARD2_OVERLAY.logoutH * scaleY}px`;
}

closeLink2.addEventListener("click", (event) => {
  event.preventDefault();
  delayedNavigate(DASHBOARD_PAGE);
});

publicActivitySidebarLink2.addEventListener("click", (event) => {
  event.preventDefault();
  delayedNavigate("dashboard2.html");
});

publicActivitiesTopLink2.addEventListener("click", (event) => {
  event.preventDefault();
  delayedNavigate("dashboard2.html");
});

mapTrackingButton.addEventListener("click", () => {
  delayedNavigate(MAP_TRACKING_PAGE);
});

logoutLink2.addEventListener("click", (event) => {
  event.preventDefault();
  delayedNavigate(LOGIN_PAGE, true);
});

dashboard2Image.addEventListener("load", positionDashboard2Overlay);
window.addEventListener("resize", positionDashboard2Overlay);
positionDashboard2Overlay();
