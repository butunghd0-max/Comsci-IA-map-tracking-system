// ============================================
// dashboard.js - Main Dashboard Controller
// ============================================
// PURPOSE: Manages the main dashboard page after login.
//   Displays the logged-in user's name and provides navigation.
//
// OOP CONCEPT: Separation of Concerns
//   Each page has its own controller script (app.js for login,
//   dashboard.js for this page). This separates page-specific logic
//   into independent modules, following the MODULAR DESIGN principle.
//
// OOP CONCEPT: Event-Driven Programming
//   Navigation links use click event listeners rather than <a href>.
//   This gives JavaScript full control over the navigation flow,
//   allowing for delayed transitions and session cleanup.
//
// WEB SCIENCE: Responsive Design (Algorithmic Scaling)
//   positionDashboardOverlay() implements a SCALING ALGORITHM that
//   maps pixel coordinates from the source image to the rendered size.
//   This is a form of COORDINATE TRANSFORMATION using ratio-based math.
//
// WEB SCIENCE: Session Verification
//   Checks localStorage for session tokens before allowing access.
//   This is a CLIENT-SIDE AUTHORIZATION GUARD - it prevents unauthorized
//   UI access but is NOT a security boundary (server-side RLS provides that).
// ============================================

// Dependencies: config.js provides LOGIN_PAGE, DASHBOARD2_PAGE,
// NAV_DELAY_MS, and delayedNavigate().
const DASHBOARD_OVERLAY = {
  userIdX: 473,
  userIdY: 148,
  publicActivityX: 329,
  publicActivityY: 501,
  publicActivityW: 184,
  publicActivityH: 28,
  logoutX: 1098,
  logoutY: 142,
  logoutW: 58,
  logoutH: 23,
};

const dashboardImage = document.getElementById("bgDashboard");
const dashboardOverlay = document.getElementById("dashboardOverlay");
const loggedInUserId = document.getElementById("loggedInUserId");
const publicActivityLink = document.getElementById("publicActivityLink");
const logoutLink = document.getElementById("logoutLink");

const activeUserId = window.localStorage.getItem("loggedInUserId");
const activeUserName = window.localStorage.getItem("loggedInUserName");
if (!activeUserId) {
  window.location.href = LOGIN_PAGE;
}

// The background image contains the text "You are logged in as".
// We display the volunteer's name beside it.
loggedInUserId.textContent = (activeUserName || "").trim() || activeUserId || "";



function positionDashboardOverlay() {
  if (!dashboardImage || !dashboardOverlay || !loggedInUserId || !logoutLink || !publicActivityLink) return;
  const rect = dashboardImage.getBoundingClientRect();
  const naturalWidth = dashboardImage.naturalWidth;
  const naturalHeight = dashboardImage.naturalHeight;
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

  dashboardOverlay.style.left = `${renderedLeft}px`;
  dashboardOverlay.style.top = `${renderedTop}px`;
  dashboardOverlay.style.width = `${renderedWidth}px`;
  dashboardOverlay.style.height = `${renderedHeight}px`;

  loggedInUserId.style.left = `${DASHBOARD_OVERLAY.userIdX * scaleX}px`;
  loggedInUserId.style.top = `${DASHBOARD_OVERLAY.userIdY * scaleY}px`;
  loggedInUserId.style.fontSize = `${Math.max(10, 13 * scaleY)}px`;

  publicActivityLink.style.left = `${DASHBOARD_OVERLAY.publicActivityX * scaleX}px`;
  publicActivityLink.style.top = `${DASHBOARD_OVERLAY.publicActivityY * scaleY}px`;
  publicActivityLink.style.width = `${DASHBOARD_OVERLAY.publicActivityW * scaleX}px`;
  publicActivityLink.style.height = `${DASHBOARD_OVERLAY.publicActivityH * scaleY}px`;

  logoutLink.style.left = `${DASHBOARD_OVERLAY.logoutX * scaleX}px`;
  logoutLink.style.top = `${DASHBOARD_OVERLAY.logoutY * scaleY}px`;
  logoutLink.style.width = `${DASHBOARD_OVERLAY.logoutW * scaleX}px`;
  logoutLink.style.height = `${DASHBOARD_OVERLAY.logoutH * scaleY}px`;
}

publicActivityLink.addEventListener("click", (event) => {
  event.preventDefault();
  delayedNavigate(DASHBOARD2_PAGE);
});

logoutLink.addEventListener("click", (event) => {
  event.preventDefault();
  delayedNavigate(LOGIN_PAGE, true);
});

dashboardImage.addEventListener("load", positionDashboardOverlay);
window.addEventListener("resize", positionDashboardOverlay);
positionDashboardOverlay();
