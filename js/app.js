// Constants (SUPABASE_URL, SUPABASE_ANON_KEY, supabaseClient, DASHBOARD_PAGE, NAV_DELAY_MS)
// are provided by config.js which is loaded before this script.
const REDIRECT_DELAY_MS = NAV_DELAY_MS;

// Coordinates are based on the current bg-login.png source image (1885x912).
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

const bgImage = document.getElementById("bgLogin");
const form = document.getElementById("loginForm");
const userIdInput = document.getElementById("userId");
const passwordInput = document.getElementById("password");
const showPasswordButton = document.getElementById("showPasswordButton");
const loginButton = document.getElementById("loginButton");
const loginStatus = document.getElementById("loginStatus");
let redirectTimerId = null;

function positionOverlay() {
  if (!bgImage || !form || !showPasswordButton) return;
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

function showStatus(message, type) {
  loginStatus.textContent = message;
  loginStatus.classList.remove("error", "success");
  if (type) loginStatus.classList.add(type);
}

function revealPassword() {
  passwordInput.type = "text";
}

function maskPassword() {
  passwordInput.type = "password";
}

showPasswordButton.addEventListener("pointerdown", (event) => {
  event.preventDefault();
  revealPassword();
  if (showPasswordButton.setPointerCapture) {
    showPasswordButton.setPointerCapture(event.pointerId);
  }
});

["pointerup", "pointercancel", "lostpointercapture", "blur"].forEach((eventName) => {
  showPasswordButton.addEventListener(eventName, maskPassword);
});

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

form.addEventListener("submit", async (event) => {
  event.preventDefault();

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

  const { data, error } = await supabaseClient
    .from("volunteers")
    .select("user_id,name")
    .eq("user_id", userId)
    .eq("password", password)
    .maybeSingle();

  if (!error && data?.user_id) {
    const displayName = (data.name || "").trim() || data.user_id;

    showStatus("Login successful. Redirecting...", "success");
    maskPassword();

    window.localStorage.setItem("loggedInUserId", data.user_id);
    window.localStorage.setItem("loggedInUserName", displayName);

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

bgImage.addEventListener("load", positionOverlay);
window.addEventListener("resize", positionOverlay);
positionOverlay();
