// ============================================
// app.js — Login Page Controller
// ============================================
// PURPOSE: Authenticates volunteers against the Supabase "volunteers"
//          table and redirects to the Dashboard on success.
//
// ARCHITECTURE: "Smoke and Mirrors" Overlay Pattern
//   The login page displays a background image (bg-login.png) that looks
//   like the organization's legacy system. Transparent HTML <input> fields
//   and buttons are positioned ON TOP of the image using absolute pixel
//   coordinates, dynamically scaled to match the rendered image size.
//   This creates the illusion of interacting with the original system.
//
// DESIGN PATTERNS USED:
//   - Observer Pattern (event listeners for user interactions)
//   - Defensive Programming (null checks, disabled states, guard clauses)
//   - Asynchronous Control Flow (async/await for Supabase queries)
//   - Session Management (localStorage for client-side session state)
//
// SECURITY NOTE: Passwords are compared in plaintext via Supabase query.
//   In a production system, passwords should be hashed server-side using
//   bcrypt or Supabase Auth. This is noted as a limitation in the IA.
// ============================================

// Dependencies: config.js provides SUPABASE_URL, SUPABASE_ANON_KEY,
// supabaseClient, DASHBOARD_PAGE, and NAV_DELAY_MS.
const REDIRECT_DELAY_MS = NAV_DELAY_MS;

// --- Overlay Coordinate Map (Data Structure: Object Literal) ---
// Pixel positions of each UI element relative to the source image
// (1885x912 pixels). These are scaled proportionally at runtime by
// positionOverlay() to maintain alignment at any viewport size.
// This approach decouples layout data from rendering logic.
const OVERLAY = {
  inputX: 1361,
  userY: 183,
  passY: 216,
  userInputW: 185,
  passInputW: 151,
  inputH: 25,
  showX: 1505,
  showY: 218,
  showW: 39,
  showH: 21,
  buttonX: 1517,
  buttonY: 250,
  buttonW: 35,
  buttonH: 20,
  statusX: 1310,
  statusY: 250,
};

// --- DOM Element References (cached for performance) ---
// Querying the DOM once and caching references avoids repeated
// getElementById calls, following the principle of memoization.
const bgImage = document.getElementById("bgLogin");
const form = document.getElementById("loginForm");
const userIdInput = document.getElementById("userId");
const passwordInput = document.getElementById("password");
const showPasswordButton = document.getElementById("showPasswordButton");
const loginButton = document.getElementById("loginButton");
const loginStatus = document.getElementById("loginStatus");
let redirectTimerId = null; // Tracks pending redirect (for cancellation on failure)

// --- Responsive Overlay Positioning Algorithm ---
// ALGORITHM: Computes the scale factor between the natural image
//   dimensions and the rendered size on screen. All overlay coordinates
//   are then multiplied by this factor to maintain pixel-perfect
//   alignment at any viewport size.
//
// TECHNIQUE: Aspect-ratio-aware scaling
//   Uses Math.min(scaleX, scaleY) to determine how the browser
//   letterboxes or pillarboxes the image (object-fit: contain behavior),
//   then calculates the actual rendered offset for accurate positioning.
function positionOverlay() {
  if (!bgImage || !form || !showPasswordButton) return; // Guard clause
  const rect = bgImage.getBoundingClientRect();
  const naturalWidth = bgImage.naturalWidth;
  const naturalHeight = bgImage.naturalHeight;
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

  form.style.left = `${renderedLeft}px`;
  form.style.top = `${renderedTop}px`;
  form.style.width = `${renderedWidth}px`;
  form.style.height = `${renderedHeight}px`;

  userIdInput.style.left = `${OVERLAY.inputX * scaleX}px`;
  userIdInput.style.top = `${OVERLAY.userY * scaleY}px`;
  userIdInput.style.width = `${OVERLAY.userInputW * scaleX}px`;
  userIdInput.style.height = `${OVERLAY.inputH * scaleY}px`;
  userIdInput.style.lineHeight = `${OVERLAY.inputH * scaleY}px`;

  passwordInput.style.left = `${OVERLAY.inputX * scaleX}px`;
  passwordInput.style.top = `${OVERLAY.passY * scaleY}px`;
  passwordInput.style.width = `${OVERLAY.passInputW * scaleX}px`;
  passwordInput.style.height = `${OVERLAY.inputH * scaleY}px`;
  passwordInput.style.lineHeight = `${OVERLAY.inputH * scaleY}px`;

  showPasswordButton.style.left = `${OVERLAY.showX * scaleX}px`;
  showPasswordButton.style.top = `${OVERLAY.showY * scaleY}px`;
  showPasswordButton.style.width = `${OVERLAY.showW * scaleX}px`;
  showPasswordButton.style.height = `${OVERLAY.showH * scaleY}px`;
  showPasswordButton.style.fontSize = `${Math.max(9, 11 * scaleY)}px`;

  loginButton.style.left = `${OVERLAY.buttonX * scaleX}px`;
  loginButton.style.top = `${OVERLAY.buttonY * scaleY}px`;
  loginButton.style.width = `${OVERLAY.buttonW * scaleX}px`;
  loginButton.style.height = `${OVERLAY.buttonH * scaleY}px`;
  loginButton.style.fontSize = `${Math.max(10, 12 * scaleY)}px`;

  loginStatus.style.left = `${OVERLAY.statusX * scaleX}px`;
  loginStatus.style.top = `${OVERLAY.statusY * scaleY}px`;
  loginStatus.style.fontSize = `${Math.max(10, 12 * scaleY)}px`;
}

// --- Status Message Display ---
// Single Responsibility: handles both message text and CSS class toggling.
// Type parameter controls visual styling ("error" = red, "success" = green).
function showStatus(message, type) {
  loginStatus.textContent = message;
  loginStatus.classList.remove("error", "success");
  if (type) loginStatus.classList.add(type);
}

// --- Password Visibility Toggle ---
// ACCESSIBILITY: Uses press-and-hold pattern — password is visible only
// while the button is actively pressed, then automatically hidden on
// release. This prevents shoulder-surfing in shared environments.
// Events covered: pointerdown/up, keyboard space/enter, blur, and
// pointer capture loss — ensuring no edge case leaves the password exposed.
function revealPassword() {
  passwordInput.type = "text";
}

function maskPassword() {
  passwordInput.type = "password";
}

// --- Pointer Event Listeners (Observer Pattern) ---
// Uses pointer events (not mouse events) for cross-device compatibility
// (mouse, touch, stylus). setPointerCapture ensures the "pointerup" fires
// on the original button even if the cursor leaves the element.
showPasswordButton.addEventListener("pointerdown", (event) => {
  event.preventDefault();
  revealPassword();
  if (showPasswordButton.setPointerCapture) {
    showPasswordButton.setPointerCapture(event.pointerId);
  }
});

// Batch-attach the same handler to multiple events (DRY principle).
// Array.forEach replaces four separate addEventListener calls.
["pointerup", "pointercancel", "lostpointercapture", "blur"].forEach((eventName) => {
  showPasswordButton.addEventListener(eventName, maskPassword);
});

// Keyboard accessibility (WCAG compliance) — Space and Enter keys
// trigger the same behavior as pointer press/release.
showPasswordButton.addEventListener("keydown", (event) => {
  if (event.key === " " || event.key === "Enter") {
    event.preventDefault();
    revealPassword();
  }
});

showPasswordButton.addEventListener("keyup", (event) => {
  if (event.key === " " || event.key === "Enter") {
    event.preventDefault();
    maskPassword();
  }
});

window.addEventListener("blur", maskPassword);

// --- Login Form Submission Handler ---
// ASYNC/AWAIT: The handler is declared async to use await for the
// Supabase network request, simplifying promise-based control flow.
//
// FLOW: Validate inputs → Query database → Handle success/failure
//   Success: Store session in localStorage, disable form, redirect.
//   Failure: Show error, re-enable form, clear any pending redirect.
form.addEventListener("submit", async (event) => {
  event.preventDefault(); // Prevent default HTML form submission (page reload)

  const userId = userIdInput.value.trim();
  const password = passwordInput.value;

  if (!userId || !password) {
    showStatus("Please enter User ID and Password", "error");
    return;
  }

  if (!supabaseClient) {
    showStatus("Supabase client failed to load", "error");
    return;
  }

  showStatus("Checking credentials...", "");
  loginButton.disabled = true;

  // --- Supabase Query (REST API under the hood) ---
  // .from("volunteers") targets the volunteers table.
  // .select("user_id,name") limits returned columns (optimization).
  // .eq() filters by exact match — equivalent to SQL WHERE clause.
  // .maybeSingle() returns null instead of error if no row matches.
  const { data, error } = await supabaseClient
    .from("volunteers")
    .select("user_id,name")
    .eq("user_id", userId)
    .eq("password", password)
    .maybeSingle();

  if (!error && data?.user_id) {
    // Nullish coalescing + trim: safely handle missing name field.
    const displayName = (data.name || "").trim() || data.user_id;

    showStatus("Login successful. Redirecting...", "success");
    maskPassword();

    // Persist session to localStorage (client-side session management).
    // This survives page reloads and allows other pages to verify login.
    window.localStorage.setItem("loggedInUserId", data.user_id);
    window.localStorage.setItem("loggedInUserName", displayName);

    // Disable all inputs to prevent double-submission during redirect.
    userIdInput.disabled = true;
    passwordInput.disabled = true;
    showPasswordButton.disabled = true;
    loginButton.disabled = true;

    redirectTimerId = window.setTimeout(() => {
      window.location.href = DASHBOARD_PAGE;
    }, REDIRECT_DELAY_MS);
    return;
  }

  if (redirectTimerId !== null) {
    window.clearTimeout(redirectTimerId);
    redirectTimerId = null;
  }

  showStatus("Invalid User ID or Password", "error");
  maskPassword();
  userIdInput.disabled = false;
  passwordInput.disabled = false;
  showPasswordButton.disabled = false;
  loginButton.disabled = false;
});

// --- Responsive Event Binding ---
// Reposition overlay when image loads and on window resize,
// ensuring the login form stays aligned at all viewport sizes.
bgImage.addEventListener("load", positionOverlay);
window.addEventListener("resize", positionOverlay);
positionOverlay(); // Initial positioning on script load
