// ============================================
// mts-sidebar.js — Sidebar Panel (CRUD: Read / Update / Delete)
// ============================================
// Opens a detail/edit form for a single house record. Handles:
//   - Dynamically building the edit form (innerHTML)
//   - Photo upload (client-side compression → Supabase Storage)
//   - Document/link management
//   - Saving (Supabase UPDATE) and deleting (Supabase DELETE)
//   - Dirty-state tracking (warns before discarding unsaved changes)
//
// Depends on: mts-utils.js (state, ui, escapeHtml, resizeImage, etc.),
//             mts-i18n.js (t), mts-map.js (refreshHouses, highlightPin),
//             config.js (supabaseClient).
//
// SECURITY: All user input is escaped via escapeHtml/escapeAttr before
//   being inserted into innerHTML to prevent XSS.
// ============================================

function closeSidebar() {
  state.selectedHouseId = null;
  state.sidebarDirty = false;
  removeHighlight();
  ui.sidebar?.classList.remove("open");
  ui.sidebarTitle && (ui.sidebarTitle.textContent = t("house"));
  ui.sidebarBody && (ui.sidebarBody.innerHTML = "");

  // Give the left panel its full width back.
  if (ui.leftPanel) ui.leftPanel.style.marginRight = "";
}

// Graceful fallback for crypto.randomUUID (requires Secure Context / HTTPS).
const getUUID = () => {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID().split('-')[0];
  }
  return Math.random().toString(36).substring(2, 10);
};

function openSidebar(houseId) {
  const house = state.houses.find((h) => h.id === houseId);
  if (!house || !ui.sidebar || !ui.sidebarBody) return;
  state.selectedHouseId = houseId;
  ui.sidebar.classList.add("open");
  if (ui.sidebarTitle) ui.sidebarTitle.textContent = house.name || t("house");

  // Push the left panel over so it doesn't hide behind the sidebar.
  if (ui.leftPanel) ui.leftPanel.style.marginRight = "300px";

  // Zoom to the pin and highlight it
  if (state.map) {
    const lat = Number(house.lat);
    const lng = Number(house.lng);
    if (Number.isFinite(lat) && Number.isFinite(lng)) {
      state.map.setView([lat, lng], Math.max(state.map.getZoom(), 14));
      highlightPin(lat, lng);
    }
  }

  const caseStatusValue = normalizeCaseStatus(house.status);
  const caseStatusOptionsHtml = getCaseStatusOptions().map(
    (o) => `<option value="${o.value}" ${o.value === caseStatusValue ? "selected" : ""}>${o.label}</option>`
  ).join("");

  const priorityValue = normalizePriority(house.priority);
  const priorityOptionsHtml = getPriorityOptions().map(
    (o) => `<option value="${o.value}" ${o.value === priorityValue ? "selected" : ""}>${o.label}</option>`
  ).join("");

  const typeOptionsHtml = getTypeOptions().map(
    (o) => `<option value="${o.value}" ${o.value === (house.type || "") ? "selected" : ""}>${o.label}</option>`
  ).join("");

  let lastModInfo = '';
  if (house.last_modified_by) {
    let modText = `${t("last_modified_by")}: ${escapeHtml(house.last_modified_by)}`;
    if (house.last_modified_at) {
      const d = new Date(house.last_modified_at);
      modText += ` ${t("on")} ${d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}, ${d.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}`;
    }
    lastModInfo = `<div style="font-size:11px;color:#6b7785;font-style:italic;margin-bottom:8px;">${modText}</div>`;
  }

  ui.sidebarBody.innerHTML = `
    ${lastModInfo}
    <div class="mts-field"><label>${t("name")}</label><input id="sbName" type="text" value="${escapeAttr(house.name || '')}" /></div>
    <div class="mts-field"><label>${t("type")}</label><select id="sbType"><option value="">${t("select_type")}</option>${typeOptionsHtml}</select></div>
    <div class="mts-field"><label>${t("priority")}</label><select id="sbPriority">${priorityOptionsHtml}</select></div>
    <div class="mts-field"><label>${t("case_status")}</label><select id="sbCaseStatus">${caseStatusOptionsHtml}</select></div>
    <div class="mts-field"><label>${t("last_visit_date")}</label><div style="display:flex;gap:6px;align-items:center;"><input id="sbLastVisit" type="date" style="flex:1;" value="${house.last_visit_date ? house.last_visit_date.substring(0, 10) : ''}" /><button id="sbVisitToday" class="mts-btn" type="button" style="white-space:nowrap;height:28px;padding:0 10px;font-size:12px;">${t("today")}</button></div></div>
    <div class="mts-field"><label>${t("coordinates")}</label><input id="sbCoords" type="text" value="${escapeAttr(formatLatLng(house.lat, house.lng) || '')}" placeholder="-6.125000, 106.883000" /></div>
    <div style="margin-bottom:10px;"><button id="sbGoogleMaps" class="mts-btn" type="button">${t("open_gmaps")}</button></div>
    <div class="mts-field"><label>${t("contact")}</label><input id="sbContact" type="text" inputmode="tel" maxlength="15" value="${escapeAttr(house.contact || '')}" placeholder="08xx / +628xx" /></div>
    ${house.contact ? `<div class="mts-contact-actions">
      <a href="https://wa.me/${normalizePhone(house.contact)}" target="_blank" rel="noopener" class="mts-contact-btn mts-wa-btn">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="#fff"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
        ${t("whatsapp")}
      </a>
      <a href="tel:+${normalizePhone(house.contact)}" class="mts-contact-btn mts-call-btn">
        <svg width="15" height="15" viewBox="0 0 24 24" fill="#fff"><path d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z"/></svg>
        ${t("call")}
      </a>
    </div>` : ''}
    <div class="mts-field"><label>${t("notes")}</label><textarea id="sbNotes" placeholder="${t("notes_placeholder")}">${escapeHtml(house.notes || '')}</textarea></div>

    <div class="mts-docs-section">
      <label style="font-weight:700;font-size:13px;">${t("photos")} (<span id="sbPhotoCount">${(Array.isArray(house.photos) ? house.photos : []).length}</span>/10)</label>
      <div id="sbPhotosGrid" class="mts-photos-grid"></div>
      <input type="file" id="sbPhotoInput" accept="image/*" multiple style="display:none" />
      <button id="sbUploadPhotos" class="mts-btn mts-btn-sm" type="button" style="margin-top:8px;">${t("upload_photos")}</button>
    </div>

    <div class="mts-docs-section">
      <label style="font-weight:700;font-size:13px;">${t("documents")}</label>
      <div id="sbDocsContainer"></div>
      <div style="display:flex;gap:6px;margin-top:8px;flex-wrap:wrap;">
        <button id="sbNewDoc" class="mts-btn mts-btn-sm" type="button">+ Google Doc</button>
        <button id="sbNewSheet" class="mts-btn mts-btn-sm" type="button">+ Google Sheet</button>
        <button id="sbAddLink" class="mts-btn mts-btn-sm" type="button">+ ${t("links")}</button>
      </div>
    </div>
  `;

  // Reset scroll position to top for the new house
  ui.sidebarBody.scrollTop = 0;

  // Track unsaved changes (use property assignment to avoid stacking listeners)
  state.sidebarDirty = false;
  ui.sidebarBody.oninput = () => { state.sidebarDirty = true; };
  ui.sidebarBody.onchange = () => { state.sidebarDirty = true; };

  // ── Photos Section ──
  const photosGrid = ui.sidebarBody.querySelector("#sbPhotosGrid");
  const photoInput = ui.sidebarBody.querySelector("#sbPhotoInput");
  const photoCountEl = ui.sidebarBody.querySelector("#sbPhotoCount");
  const uploadBtn = ui.sidebarBody.querySelector("#sbUploadPhotos");
  let rawPhotos = house.photos;
  // Safeguard: Supabase may return JSONB as a string in some edge cases
  if (typeof rawPhotos === "string") {
    try { rawPhotos = JSON.parse(rawPhotos); } catch (_) { rawPhotos = []; }
  }
  let currentPhotos = Array.isArray(rawPhotos) ? [...rawPhotos] : [];
  const MAX_PHOTOS = 10;

  function renderPhotos() {
    photoCountEl.textContent = currentPhotos.length;
    photosGrid.innerHTML = "";
    if (!currentPhotos.length) {
      photosGrid.innerHTML = `<div style="font-size:11px;color:#888;padding:4px 0;">No photos yet</div>`;
      return;
    }
    currentPhotos.forEach((photo, i) => {
      const thumb = document.createElement("div");
      thumb.className = "mts-photo-item";
      thumb.innerHTML = `
        <div class="mts-photo-thumb">
          <img src="${escapeAttr(photo.url)}" alt="${escapeAttr(photo.name || 'Photo')}" loading="lazy" />
          <button class="mts-photo-delete" type="button" data-photo-idx="${i}">&times;</button>
        </div>
        <input type="text" class="mts-photo-label" value="${escapeAttr(photo.name || '')}" placeholder="${t("name")}" data-photo-name="${i}" />
        <input type="text" class="mts-photo-label" value="${escapeAttr(photo.caption || '')}" placeholder="Caption" data-photo-caption="${i}" />
      `;
      thumb.querySelector("img").addEventListener("click", () => {
        window.open(photo.url, "_blank");
      });
      photosGrid.appendChild(thumb);
    });

    // Save name/caption on blur
    photosGrid.querySelectorAll("[data-photo-name]").forEach((el) => {
      el.addEventListener("blur", async () => {
        const idx = Number(el.dataset.photoName);
        const photo = currentPhotos[idx];
        if (!photo) return;
        const newName = el.value.trim();
        if (newName === photo.name) return; // no change

        photo.name = newName;

        // Rename file in storage if name was provided
        if (newName && photo.path) {
          const folder = photo.path.substring(0, photo.path.lastIndexOf("/"));
          const safeName = newName.replace(/[^a-zA-Z0-9_\- ]/g, "").replace(/\s+/g, "_").substring(0, 50) || "photo";
          const newPath = `${folder}/${safeName}_${getUUID()}.jpg`;

          const { error } = await supabaseClient.storage.from("house-photos").move(photo.path, newPath);
          if (!error) {
            const { data: urlData } = supabaseClient.storage.from("house-photos").getPublicUrl(newPath);
            photo.path = newPath;
            photo.url = urlData.publicUrl;
          }
        }

        await savePhotosToDb();
        renderPhotos();
      });
    });
    photosGrid.querySelectorAll("[data-photo-caption]").forEach((el) => {
      el.addEventListener("blur", () => {
        const idx = Number(el.dataset.photoCaption);
        if (currentPhotos[idx]) {
          currentPhotos[idx].caption = el.value.trim();
          savePhotosToDb();
        }
      });
    });
  }

  async function savePhotosToDb() {
    await supabaseClient.from("houses").update({ photos: currentPhotos }).eq("id", house.id);
    // Deep-copy into cache so reopening the sidebar reads fresh data
    const houseIdx = state.houses.findIndex((h) => h.id === house.id);
    if (houseIdx >= 0) state.houses[houseIdx].photos = JSON.parse(JSON.stringify(currentPhotos));
  }

  renderPhotos();

  // Upload button → trigger file input
  uploadBtn.addEventListener("click", () => {
    if (currentPhotos.length >= MAX_PHOTOS) {
      showToast(t("photo_limit"));
      return;
    }
    photoInput.click();
  });

  // Sanitize house name for folder path
  function sanitizeFolderName(name) {
    return (name || "house").replace(/[^a-zA-Z0-9_\- ]/g, "").replace(/\s+/g, "_").substring(0, 40);
  }

  // Handle file selection
  photoInput.addEventListener("change", async () => {
    const files = Array.from(photoInput.files);
    if (!files.length) return;

    const remaining = MAX_PHOTOS - currentPhotos.length;
    const toUpload = files.slice(0, remaining);

    uploadBtn.disabled = true;
    uploadBtn.textContent = t("uploading");

    const folderName = `${sanitizeFolderName(house.name)}_${house.id.slice(0, 8)}`;

    for (const file of toUpload) {
      try {
        const resized = await resizeImage(file);
        const originalName = file.name.replace(/\.[^.]+$/, "");
        const safeName = originalName.replace(/[^a-zA-Z0-9_\-]/g, "_").substring(0, 50) || "photo";
        const storagePath = `${folderName}/${safeName}_${getUUID()}.jpg`;
        const { data, error } = await supabaseClient.storage
          .from("house-photos")
          .upload(storagePath, resized, { contentType: "image/jpeg" });

        if (error) {
          showToast("Upload failed: " + error.message);
          continue;
        }

        const { data: urlData } = supabaseClient.storage
          .from("house-photos")
          .getPublicUrl(storagePath);

        currentPhotos.push({
          url: urlData.publicUrl,
          path: storagePath,
          name: originalName,
          caption: "",
          uploaded_at: new Date().toISOString(),
          uploaded_by: window.localStorage.getItem("loggedInUserName") || "unknown",
        });
      } catch (err) {
        showToast("Upload failed");
      }
    }

    await savePhotosToDb();
    renderPhotos();
    uploadBtn.disabled = false;
    uploadBtn.textContent = t("upload_photos");
    photoInput.value = "";
  });

  // Delete photo (delegated)
  photosGrid.addEventListener("click", async (e) => {
    const idx = e.target.dataset.photoIdx;
    if (idx === undefined) return;

    if (!window.confirm(t("delete_photo"))) return;

    const photo = currentPhotos[Number(idx)];
    if (photo?.path) {
      await supabaseClient.storage.from("house-photos").remove([photo.path]);
    }

    currentPhotos.splice(Number(idx), 1);
    await savePhotosToDb();
    renderPhotos();
  });

  // Merge legacy doc/sheet fields into links array
  const allLinks = [];
  if (house.doc_name || house.doc_link) {
    allLinks.push({ name: house.doc_name || "Google Doc", url: house.doc_link || "" });
  }
  if (house.sheet_name || house.sheet_link) {
    allLinks.push({ name: house.sheet_name || "Google Sheet", url: house.sheet_link || "" });
  }
  if (Array.isArray(house.links)) {
    house.links.forEach((l) => allLinks.push(l));
  }

  const docsContainer = ui.sidebarBody.querySelector("#sbDocsContainer");

  function renderDocLinks(linksArr) {
    docsContainer.innerHTML = "";
    if (!linksArr.length) {
      docsContainer.innerHTML = `<div style="font-size:11px;color:#888;padding:6px 0;">${t("no_documents")}</div>`;
      return;
    }
    linksArr.forEach((link, i) => {
      const row = document.createElement("div");
      row.className = "mts-doc-row";
      row.innerHTML = `
        <input type="text" value="${escapeAttr(link.name || '')}" placeholder="${t("name")}" class="mts-doc-name" data-link-name="${i}" />
        <input type="text" value="${escapeAttr(link.url || '')}" placeholder="URL" class="mts-doc-url" data-link-url="${i}" />
        <button class="mts-btn mts-btn-sm" type="button" data-link-open="${i}">${t("open")}</button>
        <button class="mts-btn mts-btn-sm" type="button" style="color:#c00;" data-link-remove="${i}">&times;</button>
      `;
      docsContainer.appendChild(row);
    });
  }

  renderDocLinks(allLinks);

  function collectLinks() {
    const rows = docsContainer.querySelectorAll("[data-link-name]");
    const arr = [];
    rows.forEach((nameEl) => {
      const idx = nameEl.dataset.linkName;
      const urlEl = docsContainer.querySelector(`[data-link-url="${idx}"]`);
      arr.push({ name: (nameEl.value || "").trim(), url: (urlEl?.value || "").trim() });
    });
    return arr;
  }

  // + Google Doc
  ui.sidebarBody.querySelector("#sbNewDoc").addEventListener("click", () => {
    window.open("https://docs.new", "_blank");
    const current = collectLinks();
    current.push({ name: "Google Doc", url: "" });
    renderDocLinks(current);
    state.sidebarDirty = true;
    window.setTimeout(() => {
      const lastUrl = docsContainer.querySelector(`[data-link-url="${current.length - 1}"]`);
      if (lastUrl) { lastUrl.focus(); lastUrl.placeholder = "Paste doc URL here"; }
    }, 100);
  });

  // + Google Sheet
  ui.sidebarBody.querySelector("#sbNewSheet").addEventListener("click", () => {
    window.open("https://sheets.new", "_blank");
    const current = collectLinks();
    current.push({ name: "Google Sheet", url: "" });
    renderDocLinks(current);
    state.sidebarDirty = true;
    window.setTimeout(() => {
      const lastUrl = docsContainer.querySelector(`[data-link-url="${current.length - 1}"]`);
      if (lastUrl) { lastUrl.focus(); lastUrl.placeholder = "Paste sheet URL here"; }
    }, 100);
  });

  // + Link
  ui.sidebarBody.querySelector("#sbAddLink").addEventListener("click", () => {
    const current = collectLinks();
    current.push({ name: "", url: "" });
    renderDocLinks(current);
    state.sidebarDirty = true;
  });

  // Delegate open / remove
  docsContainer.addEventListener("click", (e) => {
    const openIdx = e.target.dataset.linkOpen;
    const removeIdx = e.target.dataset.linkRemove;
    if (openIdx !== undefined) {
      const url = docsContainer.querySelector(`[data-link-url="${openIdx}"]`)?.value?.trim();
      if (url) window.open(url, "_blank", "noopener,noreferrer");
      else showToast(t("toast_no_url"));
    }
    if (removeIdx !== undefined) {
      const current = collectLinks();
      current.splice(Number(removeIdx), 1);
      renderDocLinks(current);
      state.sidebarDirty = true;
    }
  });

  // "Today" button for last visit date
  ui.sidebarBody.querySelector("#sbVisitToday")?.addEventListener("click", () => {
    const dateInput = ui.sidebarBody.querySelector("#sbLastVisit");
    if (dateInput) {
      // Use local timezone offset to avoid UTC date-shift (e.g. UTC+7 at 6AM → yesterday in UTC)
      const now = new Date();
      const localDate = new Date(now.getTime() - now.getTimezoneOffset() * 60000)
        .toISOString()
        .split('T')[0];
      dateInput.value = localDate;
      state.sidebarDirty = true;
    }
  });

  // Google Maps button
  ui.sidebarBody.querySelector("#sbGoogleMaps").addEventListener("click", () => {
    const coordsVal = (ui.sidebarBody.querySelector("#sbCoords")?.value || "").trim();
    const parts = coordsVal.split(",").map((s) => parseFloat(s.trim()));
    const lat = parts[0] || house.lat;
    const lng = parts[1] || house.lng;
    window.open(`https://www.google.com/maps?q=${lat},${lng}`, "_blank", "noopener,noreferrer");
  });

  // Strip non-digits from contact as user types
  const sbContactInput = ui.sidebarBody.querySelector("#sbContact");
  if (sbContactInput) {
    sbContactInput.addEventListener("input", () => {
      sbContactInput.value = stripNonDigits(sbContactInput.value);
    });
  }
}

async function saveSidebarChanges() {
  const houseId = state.selectedHouseId;
  if (!houseId || !supabaseClient || !ui.sidebarBody) return;

  // Prevent double-clicks
  if (ui.sidebarSaveBtn) { ui.sidebarSaveBtn.disabled = true; ui.sidebarSaveBtn.classList.add("saving"); }

  const name = String(ui.sidebarBody.querySelector("#sbName")?.value || "").trim();
  const type = String(ui.sidebarBody.querySelector("#sbType")?.value || "").trim();
  const status = String(ui.sidebarBody.querySelector("#sbCaseStatus")?.value || "new case");
  const priority = String(ui.sidebarBody.querySelector("#sbPriority")?.value || "normal");
  const last_visit_date = ui.sidebarBody.querySelector("#sbLastVisit")?.value || null;
  const contact = stripNonDigits(ui.sidebarBody.querySelector("#sbContact")?.value || "");
  const notes = String(ui.sidebarBody.querySelector("#sbNotes")?.value || "");

  // Parse coordinates
  const coordsRaw = String(ui.sidebarBody.querySelector("#sbCoords")?.value || "").trim();
  const coordParts = coordsRaw.split(",").map((s) => parseFloat(s.trim()));
  const lat = coordParts[0];
  const lng = coordParts[1];

  if (!name) {
    showToast(t("toast_name_req"));
    return;
  }

  if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
    showToast(t("toast_invalid_coords"));
    return;
  }

  if (!withinJakartaBounds(lat, lng)) {
    showToast(t("toast_outside_jakarta"));
    return;
  }

  const contactErr = validateContact(contact);
  if (contactErr !== true) {
    showToast(contactErr);
    return;
  }

  const last_modified_by = window.localStorage.getItem("loggedInUserName") || "unknown";
  const last_modified_at = new Date().toISOString();

  // Collect all documents/links
  const linksEls = ui.sidebarBody.querySelectorAll("[data-link-name]");
  const links = [];
  linksEls.forEach((nameEl) => {
    const idx = nameEl.dataset.linkName;
    const urlEl = ui.sidebarBody.querySelector(`[data-link-url="${idx}"]`);
    const lName = (nameEl.value || "").trim();
    const url = (urlEl?.value || "").trim();
    if (lName || url) links.push({ name: lName, url });
  });

  // Clear legacy doc/sheet fields — everything now lives in links
  const { data, error } = await supabaseClient
    .from("houses")
    .update({ name, type, status, priority, last_visit_date, lat, lng, contact, notes, doc_name: null, doc_link: null, sheet_name: null, sheet_link: null, links, last_modified_by, last_modified_at })
    .eq("id", houseId)
    .select("id,name,type,status,priority,last_visit_date,lat,lng,contact,notes,doc_link,doc_name,sheet_link,sheet_name,links,last_modified_by,last_modified_at,created_at")
    .maybeSingle();

  if (error || !data) {
    showToast(t("toast_failed_save"));
    if (ui.sidebarSaveBtn) { ui.sidebarSaveBtn.disabled = false; ui.sidebarSaveBtn.classList.remove("saving"); }
    return;
  }

  // Update local cache
  const idx = state.houses.findIndex((h) => h.id === houseId);
  if (idx >= 0) {
    state.houses[idx] = { ...data, status: normalizeCaseStatus(data.status), priority: normalizePriority(data.priority) };
  }

  // Update marker color, tooltip, popup, and position
  const marker = state.markers.get(houseId);
  if (marker) {
    marker.setStyle({ fillColor: priorityToColor(data.priority) });
    marker.bindTooltip(data.name || "(Unnamed)");
    marker.setLatLng([data.lat, data.lng]);
    // Refresh popup content so it doesn't show stale data
    marker.setPopupContent(generatePopupContent(data));
  }
  if (ui.sidebarTitle) ui.sidebarTitle.textContent = data.name || t("house");

  renderCards();
  if (typeof updateMapFilters === "function") updateMapFilters();
  state.sidebarDirty = false;
  if (ui.sidebarSaveBtn) { ui.sidebarSaveBtn.disabled = false; ui.sidebarSaveBtn.classList.remove("saving"); }
  showToast(t("toast_saved"));
}

async function deleteSelectedHouse() {
  const houseId = state.selectedHouseId;
  if (!houseId || !supabaseClient) return;
  const ok = window.confirm(t("confirm_delete"));
  if (!ok) return;

  // Prevent double-clicks
  if (ui.sidebarDeleteBtn) { ui.sidebarDeleteBtn.disabled = true; ui.sidebarDeleteBtn.classList.add("saving"); }

  // Delete photos from storage first to prevent orphans
  const house = state.houses.find((h) => h.id === houseId);
  if (house && Array.isArray(house.photos) && house.photos.length > 0) {
    const paths = house.photos.map((p) => p.path).filter(Boolean);
    if (paths.length) {
      await supabaseClient.storage.from("house-photos").remove(paths);
    }
  }

  const { error } = await supabaseClient.from("houses").delete().eq("id", houseId);
  if (error) {
    showToast(t("toast_failed_delete"));
    if (ui.sidebarDeleteBtn) { ui.sidebarDeleteBtn.disabled = false; ui.sidebarDeleteBtn.classList.remove("saving"); }
    return;
  }

  // Remove from local
  state.houses = state.houses.filter((h) => h.id !== houseId);
  const marker = state.markers.get(houseId);
  if (marker && state.clusterGroup) state.clusterGroup.removeLayer(marker);
  state.markers.delete(houseId);
  closeSidebar();
  renderCards();
  showToast(t("toast_deleted"));
}
