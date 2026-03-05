// ============================================
// mts-map.js - Map Engine (Leaflet Integration)
// ============================================
// PURPOSE: Initializes and manages the Leaflet.js map, including tile
//   layers, marker rendering, clustering, and map interactions.
//
// OOP CONCEPT: Inheritance & Class Extension
//   Leaflet.js uses PROTOTYPAL INHERITANCE extensively. For example:
//   - L.CircleMarker inherits from L.Path -> L.Layer -> L.Evented
//   - L.Control.extend() creates a new class that INHERITS from L.Control
//   - The custom refresh button (L.Control.extend) demonstrates
//     SUBCLASSING - overriding the onAdd() method (METHOD OVERRIDING).
//
// OOP CONCEPT: Event-Driven Architecture
//   Leaflet's event system follows the OBSERVER PATTERN (also called
//   Publish-Subscribe). The map object is a SUBJECT that NOTIFIES
//   registered OBSERVERS (event handlers) when events occur:
//   - map.on("click", handler) registers an observer
//   - User clicking the map triggers the notification
//   This DECOUPLES the event source from the response logic.
//
// WEB SCIENCE: Tile-Based Map Rendering
//   Web maps use TILE SERVERS that serve 256x256px image tiles.
//   The browser requests tiles via HTTP GET based on the current
//   zoom level and viewport bounds (lazy loading by geographic area).
//   OpenStreetMap tiles use the URL pattern: /{z}/{x}/{y}.png
//   where z=zoom, x=column, y=row in a global tile grid.
//
// WEB SCIENCE: Asynchronous Data Fetching
//   refreshHouses() uses async/await to fetch data from Supabase.
//   Under the hood, Supabase's JS client sends HTTP REST requests.
//   The JavaScript EVENT LOOP ensures the UI stays responsive during
//   network I/O - the browser can still respond to clicks while
//   waiting for the server response.
//
// KEY DATA FLOW:
//   setTerritory() -> initMap() -> refreshHouses() -> renderMarkers()
// ============================================

// --- Territory Selection Controller ---
// ASYNC: Fetches house data from Supabase when a city is selected.
// Acts as the main controller for the map module, coordinating:
// 1. UI state (enable/disable buttons and tabs)
// 2. Map initialization (lazy - only on first selection)
// 3. Data loading (refreshHouses from Supabase)
async function setTerritory(value) {
  state.territory = value;

  const enabled = value === "jakarta";

  // Use opacity instead of disabled so click handlers can still fire the toast
  const actionBtns = [ui.addPinBtn, ui.addByCoordsBtn, ui.clearCoordsBtn, ui.useLocationBtn];
  for (const btn of actionBtns) {
    btn.style.opacity = enabled ? "1" : "0.5";
    btn.style.cursor = enabled ? "pointer" : "default";
  }
  ui.latInput.style.opacity = enabled ? "1" : "0.6";
  ui.lngInput.style.opacity = enabled ? "1" : "0.6";
  ui.latInput.readOnly = !enabled;
  ui.lngInput.readOnly = !enabled;

  // Enable/disable tabs
  ui.tabMap.style.opacity = enabled ? "1" : "0.5";
  ui.tabMap.style.cursor = enabled ? "pointer" : "default";
  ui.tabProfiles.style.opacity = enabled ? "1" : "0.5";
  ui.tabProfiles.style.cursor = enabled ? "pointer" : "default";

  if (!enabled) {
    if (value) showToast(t("toast_only_jakarta"));
    // Clear houses when no city or non-jakarta
    state.houses = [];
    renderCards();
    clearMarkers();
    return;
  }

  if (!supabaseClient) {
    showToast("Supabase: " + t("toast_failed_load"));
    return;
  }

  if (!window.L) {
    showToast("Leaflet: " + t("toast_failed_load"));
    return;
  }

  if (!state.map) {
    initMap();
  }

  await refreshHouses();
}

// --- Leaflet Map Initialization ---
// PATTERN: Lazy Initialization - map is created once and reused.
// This avoids DOM manipulation until the user actually selects a city.
//
// LAYER ARCHITECTURE (bottom to top):
//   1. TileLayer (OpenStreetMap raster tiles)
//   2. Rectangle (Jakarta boundary overlay)
//   3. MarkerClusterGroup (performance-optimized marker container)
//   4. Individual CircleMarkers (house pins)
//
// PERFORMANCE: MarkerClusterGroup groups nearby markers at low zoom
//   levels, preventing thousands of DOM elements from being rendered
//   simultaneously. This is critical for scalability.
function initMap() {
  const bounds = window.L.latLngBounds(
    window.L.latLng(JAKARTA_BOUNDS.south, JAKARTA_BOUNDS.west),
    window.L.latLng(JAKARTA_BOUNDS.north, JAKARTA_BOUNDS.east)
  );

  state.map = window.L.map(ui.mapWrap, {
    zoomControl: true,
    maxBounds: bounds,
    maxBoundsViscosity: 1.0,
  });

  // Centre on Jakarta at a tight zoom — avoids fitBounds zooming out too
  // much when the container is a wide letterbox.
  const center = [
    (JAKARTA_BOUNDS.south + JAKARTA_BOUNDS.north) / 2,
    (JAKARTA_BOUNDS.west + JAKARTA_BOUNDS.east) / 2,
  ];
  state.map.setView(center, 13);
  state.map.setMinZoom(13);

  window.L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution: "&copy; OpenStreetMap contributors",
    maxZoom: 19,
  }).addTo(state.map);

  // Draw boundary
  state.boundaryRect = window.L.rectangle(bounds, { color: "#2c5f90", weight: 1, fill: false });
  state.boundaryRect.addTo(state.map);

  // ResizeObserver auto-fixes map tiles when container size changes (sidebar open/close)
  if (window.ResizeObserver && ui.mapWrap) {
    new ResizeObserver(() => {
      if (state.map) state.map.invalidateSize();
    }).observe(ui.mapWrap);
  }

  // Refresh button on map
  const RefreshControl = window.L.Control.extend({
    options: { position: "topright" },
    onAdd: function () {
      const btn = window.L.DomUtil.create("button", "mts-map-refresh-btn");
      btn.innerHTML = "↻";
      btn.title = t("refresh_houses");
      btn.type = "button";
      window.L.DomEvent.disableClickPropagation(btn);
      btn.addEventListener("click", async () => {
        // Fix map tiles not fully rendering
        if (state.map) {
          state.map.invalidateSize();
          await new Promise((r) => setTimeout(r, 150));
        }
        await refreshHouses();
        showToast(t("toast_refreshed"));
      });
      return btn;
    },
  });
  state.map.addControl(new RefreshControl());

  // Initialize marker cluster group
  state.clusterGroup = window.L.markerClusterGroup({
    maxClusterRadius: 40,
    spiderfyOnMaxZoom: true,
    showCoverageOnHover: false,
    zoomToBoundsOnClick: true,
    disableClusteringAtZoom: 16,
  });
  state.map.addLayer(state.clusterGroup);

  // Cluster hover tooltip — shows house names with status dots
  let clusterTooltip = null;
  state.clusterGroup.on("clustermouseover", function (e) {
    const cluster = e.layer;
    const childMarkers = cluster.getAllChildMarkers();
    const MAX_SHOW = 8;

    // Build list of house info from markers
    const items = childMarkers.map((m) => {
      const ll = m.getLatLng();
      const house = state.houses.find(
        (h) => Math.abs(Number(h.lat) - ll.lat) < 0.0001 && Math.abs(Number(h.lng) - ll.lng) < 0.0001
      );
      if (!house) return null;
      return { name: house.name || "(Unnamed)", color: priorityToColor(house.priority) };
    }).filter(Boolean);

    // Sort: red first, yellow second, green last
    const colorOrder = { "#d64545": 0, "#caa52a": 1, "#2f9e44": 2 };
    items.sort((a, b) => (colorOrder[a.color] ?? 1) - (colorOrder[b.color] ?? 1));

    const shown = items.slice(0, MAX_SHOW);
    const remaining = items.length - shown.length;

    let html = '<div class="mts-cluster-tooltip">';
    html += `<div class="mts-cluster-tooltip-header">${items.length} ${t("houses")}</div>`;
    for (const item of shown) {
      html += `<div class="mts-cluster-tooltip-row">` +
        `<span class="mts-cluster-dot" style="background:${item.color}"></span>` +
        `<span class="mts-cluster-name">${escapeHtml(item.name)}</span></div>`;
    }
    if (remaining > 0) {
      html += `<div class="mts-cluster-tooltip-more">+${remaining} more…</div>`;
    }
    html += "</div>";

    clusterTooltip = window.L.popup({
      closeButton: false,
      autoClose: false,
      closeOnClick: false,
      className: "mts-cluster-popup",
      offset: [0, -10],
    })
      .setLatLng(cluster.getLatLng())
      .setContent(html)
      .openOn(state.map);
  });

  state.clusterGroup.on("clustermouseout", function () {
    if (clusterTooltip) {
      state.map.closePopup(clusterTooltip);
      clusterTooltip = null;
    }
  });

  state.clusterGroup.on("clusterclick", function () {
    if (clusterTooltip) {
      state.map.closePopup(clusterTooltip);
      clusterTooltip = null;
    }
  });

  // Click to add OR close sidebar
  state.map.on("click", (e) => {
    if (!state.addMode) {
      // Clicking empty map area closes the sidebar (standard UX)
      if (ui.sidebar && ui.sidebar.classList.contains("open")) {
        if (state.sidebarDirty && !window.confirm(t("confirm_unsaved"))) return;
        closeSidebar();
      }
      return;
    }
    const lat = e.latlng.lat;
    const lng = e.latlng.lng;
    if (!withinJakartaBounds(lat, lng)) {
      showToast(t("toast_outside_jakarta"));
      return;
    }
    const nearby = findNearbyHouse(lat, lng);
    if (nearby) {
      const ok = window.confirm(`${t("confirm_nearby")}: "${nearby.name || '(Unnamed)'}"\n${t("confirm_proceed")}`);
      if (!ok) return;
    }
    state.addMode = false;
    ui.addPinBtn.textContent = t("add_pin");
    openHouseModal({ mode: "create", lat, lng });
  });
}

// --- Data Refresh (CRUD: Read Operation) ---
// WEB SCIENCE: REST API & HTTP
//   Supabase exposes a RESTful API. This query translates to:
//   GET /rest/v1/houses?select=id,name,...&order=created_at.desc
//   The response is JSON (JavaScript Object Notation), which is
//   natively parsed into JavaScript objects.
//
// FUNCTIONAL PROGRAMMING: Destructuring Assignment
//   const { data, error } = await ... extracts specific properties
//   from the response object into separate variables.
//
// FUNCTIONAL PROGRAMMING: Array.map() with Spread Operator
//   state.houses = data.map(h => ({ ...h, status: normalize(h.status) }))
//   - Array.map() is a HIGHER-ORDER FUNCTION that transforms each element
//   - The SPREAD OPERATOR (...h) creates a SHALLOW COPY of each object
//   - Overwritten properties (status, priority) are normalized in-place
async function refreshHouses() {
  if (!supabaseClient) return;

  // Show loading spinner
  if (ui.loadingOverlay) ui.loadingOverlay.classList.add("show");

  const { data, error } = await supabaseClient
    .from("houses")
    .select("id,name,type,status,priority,last_visit_date,lat,lng,contact,notes,doc_link,doc_name,sheet_link,sheet_name,links,photos,last_modified_by,last_modified_at,created_at")
    .order("created_at", { ascending: false });

  // Hide loading spinner
  if (ui.loadingOverlay) ui.loadingOverlay.classList.remove("show");

  if (error) {
    showToast(t("toast_failed_load"));
    return;
  }

  state.houses = (data || []).map((h) => ({
    ...h,
    status: normalizeCaseStatus(h.status),
    priority: normalizePriority(h.priority),
  }));

  renderMarkers();
  renderCards();
}

// --- Marker Lifecycle Management ---
// clearMarkers: Removes all markers from the cluster group and the
//   tracking Map. Called before re-rendering to avoid duplicates.
function clearMarkers() {
  if (state.clusterGroup) {
    state.clusterGroup.clearLayers(); // Leaflet API: remove all child layers
  }
  state.markers.clear(); // ES6 Map.clear() - O(1)
}

// removeHighlight: Removes the pulsing highlight circle from a pin.
function removeHighlight() {
  if (state.highlightMarker && state.map) {
    state.map.removeLayer(state.highlightMarker);
    state.highlightMarker = null;
  }
}

// highlightPin: Places a pulsing CSS-animated circle beneath a pin
// to draw the user's attention. Uses L.divIcon with custom HTML/CSS.
function highlightPin(lat, lng) {
  removeHighlight();
  if (!state.map || !window.L) return;
  const icon = window.L.divIcon({
    className: "",
    html: '<div class="mts-marker-highlight"></div>',
    iconSize: [24, 24],
    iconAnchor: [12, 12],
  });
  state.highlightMarker = window.L.marker([lat, lng], { icon, interactive: false, zIndexOffset: -100 });
  state.highlightMarker.addTo(state.map);
}

// --- Marker Rendering ---
// Creates a CircleMarker for each house, colored by priority.
// Each marker gets:
//   - A tooltip (hover label showing house name)
//   - A popup (click to see details + "View Details" button)
//
// DATA STRUCTURE: state.markers (ES6 Map)
//   Stores houseId -> L.CircleMarker for O(1) lookup when opening
//   sidebar, applying filters, or updating after save.
function renderMarkers() {
  if (!state.map) return;
  clearMarkers(); // Remove old markers before rebuilding

  for (const house of state.houses) {
    const lat = Number(house.lat);
    const lng = Number(house.lng);
    if (!Number.isFinite(lat) || !Number.isFinite(lng)) continue; // Skip invalid coords

    const color = priorityToColor(house.priority);
    const marker = window.L.circleMarker([lat, lng], {
      radius: 10,
      color: "#1f2a33",
      weight: 1.5,
      fillColor: color,
      fillOpacity: 0.95,
    });

    marker.bindTooltip(house.name || "(Unnamed)", {
      direction: "top",
      opacity: 0.9,
      offset: [0, -8],
    });

    marker.bindPopup(generatePopupContent(house), { closeButton: true, maxWidth: 220 });

    state.markers.set(house.id, marker);
  }

  // Respect active filters — only show matching markers
  if (typeof updateMapFilters === "function") {
    updateMapFilters();
  } else if (state.clusterGroup) {
    state.clusterGroup.addLayers(Array.from(state.markers.values()));
  }
}
