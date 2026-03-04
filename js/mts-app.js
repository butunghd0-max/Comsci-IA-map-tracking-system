// ============================================
// App - Shell, tabs, cards, filters, export, boot
// ============================================

function renderShell() {
  if (!mtsApp) return;
  mtsApp.innerHTML = "";

  const shell = document.createElement("div");
  shell.className = "mts-shell";

  const langOptions = Object.entries(LANGS).map(([code, label]) =>
    `<option value="${code}" ${code === currentLang ? "selected" : ""}>${label}</option>`
  ).join("");

  shell.innerHTML = `
    <div id="mtsOfflineBanner" class="mts-offline-banner">⚠️ No internet connection — changes may not save</div>
    <div class="mts-topbar">
      <div class="mts-topbar-row">
        <div class="mts-title" data-i18n="title">${t("title")}</div>
        <span class="mts-topbar-sep"></span>
        <label for="mtsTerritory" data-i18n="city">${t("city")}</label>
        <select id="mtsTerritory" aria-label="City">
          <option value="" data-i18n="select_city">${t("select_city")}</option>
          <option value="jakarta">Jakarta</option>
          <option value="surabaya" disabled>Surabaya (demo)</option>
          <option value="bandung" disabled>Bandung (demo)</option>
          <option value="medan" disabled>Medan (demo)</option>
        </select>
        <span class="mts-topbar-sep"></span>
        <select id="mtsLangSelect" style="height:26px;font-size:12px;border:1px solid #999;">${langOptions}</select>
        <button id="mtsToggleGuide" class="mts-btn mts-btn-sm" type="button" data-i18n="hide_guide">${t("hide_guide")}</button>
      </div>
      <div class="mts-topbar-row">
        <button id="mtsAddPin" class="mts-btn primary mts-btn-sm" type="button" data-i18n="add_pin">${t("add_pin")}</button>
        <input id="mtsLat" type="text" inputmode="decimal" placeholder="${t("latitude")}" />
        <input id="mtsLng" type="text" inputmode="decimal" placeholder="${t("longitude")}" />
        <button id="mtsAddByCoords" class="mts-btn mts-btn-sm" type="button" data-i18n="add">${t("add")}</button>
        <button id="mtsClearCoords" class="mts-btn mts-btn-sm" type="button" data-i18n="clear">${t("clear")}</button>
        <button id="mtsUseLocation" class="mts-btn mts-btn-sm" type="button" data-i18n="use_my_location">${t("use_my_location")}</button>
      </div>
    </div>

    <div id="mtsGuide" class="mts-guide">
      <div><b data-i18n="quick_guide">${t("quick_guide")}</b></div>
      <div id="mtsGuideContent"></div>
    </div>

    <div class="mts-tabs">
      <button id="mtsTabMap" class="mts-tab active" type="button" data-i18n="map">${t("map")}</button>
      <button id="mtsTabProfiles" class="mts-tab" type="button" data-i18n="profiles">${t("profiles")}</button>
    </div>

    <div class="mts-main">
      <div class="mts-left">
        <div id="mtsLoadingOverlay" class="mts-loading-overlay">
          <div class="mts-loading-spinner"></div>
          <div class="mts-loading-text">Loading houses…</div>
        </div>
        <div id="mtsMapWrap" class="mts-map"></div>

        <div id="mtsProfilesWrap" class="mts-profiles" style="display:none">
          <div class="mts-sticky-toolbar">
          <div class="mts-profiles-toolbar">
            <span class="mts-toolbar-label" data-i18n="search_by">${t("search_by")}</span>

            <div class="mts-multiselect">
              <button class="mts-multiselect-btn" id="mtsPriorityBtn" type="button" data-i18n="all_priorities">${t("all_priorities")}</button>
              <div class="mts-multiselect-dropdown" id="mtsPriorityDropdown">
                <label><input type="checkbox" value="urgent" /> <span data-i18n="urgent">${t("urgent")} 🔴</span></label>
                <label><input type="checkbox" value="normal" /> <span data-i18n="normal">${t("normal")} 🟡</span></label>
                <label><input type="checkbox" value="stable" /> <span data-i18n="stable">${t("stable")} 🟢</span></label>
              </div>
            </div>

            <div class="mts-multiselect">
              <button class="mts-multiselect-btn" id="mtsCaseStatusBtn" type="button" data-i18n="all_case_statuses">${t("all_case_statuses")}</button>
              <div class="mts-multiselect-dropdown" id="mtsCaseStatusDropdown">
                <label><input type="checkbox" value="new case" /> <span data-i18n="new_case">${t("new_case")}</span></label>
                <label><input type="checkbox" value="active care" /> <span data-i18n="active_care">${t("active_care")}</span></label>
                <label><input type="checkbox" value="follow-up" /> <span data-i18n="follow_up">${t("follow_up")}</span></label>
                <label><input type="checkbox" value="closed" /> <span data-i18n="case_closed">${t("case_closed")}</span></label>
              </div>
            </div>

            <div class="mts-multiselect">
              <button class="mts-multiselect-btn" id="mtsTypeBtn" type="button" data-i18n="all_types">${t("all_types")}</button>
              <div class="mts-multiselect-dropdown" id="mtsTypeDropdown">
                <label><input type="checkbox" value="orphanage" /> <span data-i18n="orphanage">${t("orphanage")}</span></label>
                <label><input type="checkbox" value="nursing home" /> <span data-i18n="nursing_home">${t("nursing_home")}</span></label>
                <label><input type="checkbox" value="rest house" /> <span data-i18n="rest_house">${t("rest_house")}</span></label>
              </div>
            </div>

            <span class="mts-toolbar-label" data-i18n="containing">${t("containing")}</span>
            <input id="mtsSearch" type="text" />

            <button id="mtsRefresh" class="mts-toolbar-filter-btn" type="button" data-i18n="filter">${t("filter")}</button>
            <button id="mtsReset" class="mts-toolbar-filter-btn mts-reset-btn" type="button" data-i18n="reset">${t("reset")}</button>
          </div>
          <div style="display:flex;align-items:center;gap:10px;padding:6px 0;">
            <div id="mtsHouseCount" style="font-size:13px;color:#2e3a45;"></div>
            <select id="mtsSort" style="height:30px;font-size:13px;border:1px solid #aaa;margin-left:auto;">
              <option value="newest" data-i18n="newest_first">${t("newest_first")}</option>
              <option value="oldest" data-i18n="oldest_first">${t("oldest_first")}</option>
              <option value="name_az" data-i18n="name_az">${t("name_az")}</option>
              <option value="name_za" data-i18n="name_za">${t("name_za")}</option>
              <option value="modified_newest" data-i18n="modified_newest">${t("modified_newest")}</option>
              <option value="modified_oldest" data-i18n="modified_oldest">${t("modified_oldest")}</option>
              <option value="priority_urgent" data-i18n="priority_urgent_first">${t("priority_urgent_first")}</option>
            </select>
            <button id="mtsExportCsv" class="mts-btn" type="button" style="height:30px;font-size:13px;padding:0 12px;" data-i18n="export_sheet">${t("export_sheet")}</button>
          </div>
          </div>
          <div id="mtsCards" class="mts-cards"></div>
        </div>

        <div id="mtsToast" class="mts-toast"></div>

        <div id="mtsModalBackdrop" class="mts-modal-backdrop" aria-hidden="true">
          <div class="mts-modal" role="dialog" aria-modal="true">
            <div class="mts-modal-header">
              <div id="mtsModalTitle" data-i18n="add_house">${t("add_house")}</div>
              <button id="mtsModalClose" class="mts-btn" type="button" data-i18n="close">${t("close")}</button>
            </div>
            <div id="mtsModalBody" class="mts-modal-body"></div>
            <div class="mts-modal-actions">
              <button id="mtsModalCancel" class="mts-btn" type="button" data-i18n="close">${t("close")}</button>
              <button id="mtsModalSave" class="mts-btn primary" type="button" data-i18n="save_changes">${t("save_changes")}</button>
            </div>
          </div>
        </div>
      </div>

      <aside id="mtsSidebar" class="mts-sidebar" aria-label="House details">
        <div class="mts-sidebar-header">
          <div id="mtsSidebarTitle" data-i18n="house">${t("house")}</div>
          <button id="mtsSidebarClose" class="mts-btn" type="button" data-i18n="close">${t("close")}</button>
        </div>
        <div id="mtsSidebarBody" class="mts-sidebar-body"></div>
        <div class="mts-sidebar-actions">
          <button id="mtsSidebarDelete" class="mts-btn" type="button" data-i18n="delete">${t("delete")}</button>
          <button id="mtsSidebarSave" class="mts-btn primary" type="button" data-i18n="save_changes">${t("save_changes")}</button>
        </div>
      </aside>
    </div>
  `;

  mtsApp.appendChild(shell);
  ui.shell = shell;
  ui.territorySelect = shell.querySelector("#mtsTerritory");
  ui.toggleGuideBtn = shell.querySelector("#mtsToggleGuide");
  ui.addPinBtn = shell.querySelector("#mtsAddPin");
  ui.latInput = shell.querySelector("#mtsLat");
  ui.lngInput = shell.querySelector("#mtsLng");
  ui.addByCoordsBtn = shell.querySelector("#mtsAddByCoords");
  ui.clearCoordsBtn = shell.querySelector("#mtsClearCoords");
  ui.useLocationBtn = shell.querySelector("#mtsUseLocation");
  ui.guide = shell.querySelector("#mtsGuide");
  ui.tabMap = shell.querySelector("#mtsTabMap");
  ui.tabProfiles = shell.querySelector("#mtsTabProfiles");
  ui.leftPanel = shell.querySelector(".mts-left");
  ui.mapWrap = shell.querySelector("#mtsMapWrap");
  ui.profilesWrap = shell.querySelector("#mtsProfilesWrap");
  ui.cardsWrap = shell.querySelector("#mtsCards");
  ui.searchInput = shell.querySelector("#mtsSearch");
  ui.priorityBtn = shell.querySelector("#mtsPriorityBtn");
  ui.priorityDropdown = shell.querySelector("#mtsPriorityDropdown");
  ui.caseStatusBtn = shell.querySelector("#mtsCaseStatusBtn");
  ui.caseStatusDropdown = shell.querySelector("#mtsCaseStatusDropdown");
  ui.typeBtn = shell.querySelector("#mtsTypeBtn");
  ui.typeDropdown = shell.querySelector("#mtsTypeDropdown");
  ui.sortSelect = shell.querySelector("#mtsSort");
  ui.houseCount = shell.querySelector("#mtsHouseCount");
  ui.toast = shell.querySelector("#mtsToast");
  ui.sidebar = shell.querySelector("#mtsSidebar");
  ui.sidebarTitle = shell.querySelector("#mtsSidebarTitle");
  ui.sidebarCloseBtn = shell.querySelector("#mtsSidebarClose");
  ui.sidebarBody = shell.querySelector("#mtsSidebarBody");
  ui.sidebarSaveBtn = shell.querySelector("#mtsSidebarSave");
  ui.sidebarDeleteBtn = shell.querySelector("#mtsSidebarDelete");
  ui.modalBackdrop = shell.querySelector("#mtsModalBackdrop");
  ui.modalTitle = shell.querySelector("#mtsModalTitle");
  ui.modalCloseBtn = shell.querySelector("#mtsModalClose");
  ui.modalBody = shell.querySelector("#mtsModalBody");
  ui.modalCancelBtn = shell.querySelector("#mtsModalCancel");
  ui.modalSaveBtn = shell.querySelector("#mtsModalSave");
  ui.offlineBanner = shell.querySelector("#mtsOfflineBanner");
  ui.loadingOverlay = shell.querySelector("#mtsLoadingOverlay");

  // Render guide content
  function renderGuideContent() {
    const guideEl = shell.querySelector("#mtsGuideContent");
    if (!guideEl) return;

    const S = "margin:4px 0 0 30px;padding:0;line-height:1.8;font-size:14px;";

    const G = {
      en: {
        tabs: ["Full", "🗺️Map", "📋 Profiles", "✏️ Editing", "💡 Tips"],
        map: `<ol style="${S}">
          <li>Select a <b>city</b> to load the map (only Jakarta is active in this demo).</li>
          <li>Click <b>Add pin</b>, then click on the map to place a new house. Or enter <b>Lat/Lng</b> manually and click <b>Add</b>.</li>
          <li>Click a <b>map pin</b> to see a preview. Click <b>View Details</b> to open the sidebar.</li>
          <li>Click an empty area on the map to close the sidebar.</li>
          <li>Use the <b>🔄 refresh</b> button on the map to sync the latest data.</li>
        </ol>`,
        profiles: `<ol style="${S}">
          <li>Switch to the <b>Profiles</b> tab to see all houses as cards.</li>
          <li>Filter by <b>priority</b>, <b>case status</b>, and <b>type</b> using the dropdown filters.</li>
          <li>Search by <b>name or contact number</b> using the search bar.</li>
          <li>Sort by name, date created, date modified, or priority.</li>
          <li>Click <b>Export Spreadsheet</b> to download all data as an Excel file.</li>
          <li>Click a card to open its details and zoom to it on the map.</li>
        </ol>`,
        editing: `<ol style="${S}">
          <li>In the sidebar, edit: name, type, <b>priority</b>, <b>case status</b>, coordinates, contact, notes, photos, and links.</li>
          <li>Upload up to <b>10 photos</b> per house. Photos are automatically compressed.</li>
          <li>Use <b>WhatsApp</b>/<b>Call</b> buttons to quickly contact the house.</li>
          <li><b>Contact</b> must be an Indonesian phone number (7-13 digits, starting with 0).</li>
          <li><b>Coordinates</b> are editable - the pin moves when you save.</li>
          <li>Use <b>Open in Google Maps</b> to navigate to the location.</li>
          <li>Attach Google Docs, Google Sheets, or custom links to each house.</li>
        </ol>`,
        tips: `<ol style="${S}">
          <li>A warning appears if you navigate away with <b>unsaved changes</b>.</li>
          <li>Every save records <b>who</b> last modified the house and <b>when</b>.</li>
          <li>Press <b>Escape</b> to close modals, sidebar, or cancel add-pin mode.</li>
        </ol>
        <div style="margin-top:4px;font-size:13px;color:#555;">${t("pin_colors")}: 🔴 ${t("urgent")} &nbsp; 🟡 ${t("normal")} &nbsp; 🟢 ${t("stable")}</div>`
      },

      id: {
        tabs: ["Semua", "🗺️ Peta", "📋 Profil", "✏️ Edit", "💡 Tips"],
        map: `<ol style="${S}">
          <li>Pilih <b>kota</b> untuk memuat peta (hanya Jakarta yang aktif dalam demo ini).</li>
          <li>Klik <b>Tambah pin</b>, lalu klik pada peta untuk menempatkan rumah baru. Atau masukkan <b>Lat/Lng</b> manual lalu klik <b>Tambah</b>.</li>
          <li>Klik <b>pin</b> untuk pratinjau. Klik <b>Lihat Detail</b> untuk membuka sidebar.</li>
          <li>Klik area kosong pada peta untuk menutup sidebar.</li>
          <li>Gunakan tombol <b>🔄 segarkan</b> di peta untuk menyinkronkan data terbaru.</li>
        </ol>`,
        profiles: `<ol style="${S}">
          <li>Beralih ke tab <b>Profil</b> untuk melihat semua rumah sebagai kartu.</li>
          <li>Filter berdasarkan <b>prioritas</b>, <b>status kasus</b>, dan <b>tipe</b> menggunakan dropdown.</li>
          <li>Cari berdasarkan <b>nama atau nomor kontak</b> menggunakan kolom pencarian.</li>
          <li>Urutkan berdasarkan nama, tanggal dibuat, tanggal diubah, atau prioritas.</li>
          <li>Klik <b>Ekspor Spreadsheet</b> untuk mengunduh data sebagai file Excel.</li>
          <li>Klik kartu untuk membuka detail dan zoom ke lokasinya di peta.</li>
        </ol>`,
        editing: `<ol style="${S}">
          <li>Di sidebar, edit: nama, tipe, <b>prioritas</b>, <b>status kasus</b>, koordinat, kontak, catatan, foto, dan link.</li>
          <li>Unggah hingga <b>10 foto</b> per rumah. Foto otomatis dikompresi.</li>
          <li>Gunakan tombol <b>WhatsApp</b>/<b>Telepon</b> untuk menghubungi.</li>
          <li><b>Kontak</b> harus nomor Indonesia (7-13 digit, diawali 0).</li>
          <li><b>Koordinat</b> bisa diedit - pin bergeser saat disimpan.</li>
          <li>Gunakan <b>Buka di Google Maps</b> untuk navigasi ke lokasi.</li>
          <li>Lampirkan Google Docs, Google Sheets, atau link kustom ke setiap rumah.</li>
        </ol>`,
        tips: `<ol style="${S}">
          <li>Peringatan muncul jika Anda menavigasi dengan <b>perubahan yang belum disimpan</b>.</li>
          <li>Setiap penyimpanan mencatat <b>siapa</b> yang terakhir mengubah dan <b>kapan</b>.</li>
          <li>Tekan <b>Escape</b> untuk menutup modal, sidebar, atau membatalkan mode tambah pin.</li>
        </ol>
        <div style="margin-top:4px;font-size:13px;color:#555;">${t("pin_colors")}: 🔴 ${t("urgent")} &nbsp; 🟡 ${t("normal")} &nbsp; 🟢 ${t("stable")}</div>`
      },

      zh_cn: {
        tabs: ["全部", "🗺️ 地图", "📋 档案", "✏️ 编辑", "💡 提示"],
        map: `<ol style="${S}">
          <li>选择一个<b>城市</b>来加载地图（此演示中仅雅加达可用）。</li>
          <li>点击<b>添加图钉</b>，然后在地图上点击放置房屋。或手动输入<b>经纬度</b>后点击<b>添加</b>。</li>
          <li>点击<b>地图图钉</b>查看预览。点击<b>查看详情</b>打开侧边栏。</li>
          <li>点击地图空白处关闭侧边栏。</li>
          <li>使用地图上的<b>🔄刷新</b>按钮同步最新数据。</li>
        </ol>`,
        profiles: `<ol style="${S}">
          <li>切换到<b>档案</b>选项卡查看所有房屋卡片。</li>
          <li>按<b>优先级</b>、<b>案件状态</b>和<b>类型</b>使用下拉菜单筛选。</li>
          <li>使用搜索栏按<b>名称或联系方式</b>搜索。</li>
          <li>按名称、创建日期、修改日期或优先级排序。</li>
          <li>点击<b>导出表格</b>将所有数据下载为Excel文件。</li>
          <li>点击卡片打开详细信息并在地图上定位。</li>
        </ol>`,
        editing: `<ol style="${S}">
          <li>在侧边栏中编辑：名称、类型、<b>优先级</b>、<b>案件状态</b>、坐标、联系方式、备注、照片和链接。</li>
          <li>每栋房屋最多上传<b>10张照片</b>。照片自动压缩。</li>
          <li>使用<b>WhatsApp</b>/<b>拨打</b>按钮快速联系。</li>
          <li><b>联系方式</b>须为印尼号码（7-13位，以0开头）。</li>
          <li><b>坐标</b>可编辑 - 保存后图钉会移动。</li>
          <li>使用<b>在Google地图中打开</b>导航到位置。</li>
          <li>可附加Google文档、Google表格或自定义链接。</li>
        </ol>`,
        tips: `<ol style="${S}">
          <li>在有<b>未保存更改</b>时尝试离开会出现警告。</li>
          <li>每次保存都会记录<b>谁</b>最后修改以及<b>何时</b>修改。</li>
          <li>按<b>Escape</b>关闭弹窗、侧边栏或取消添加图钉模式。</li>
        </ol>
        <div style="margin-top:4px;font-size:13px;color:#555;">${t("pin_colors")}：🔴 ${t("urgent")} &nbsp; 🟡 ${t("normal")} &nbsp; 🟢 ${t("stable")}</div>`
      },

      zh_tw: {
        tabs: ["全部", "🗺️ 地圖", "📋 檔案", "✏️ 編輯", "💡 提示"],
        map: `<ol style="${S}">
          <li>選擇一個<b>城市</b>來加載地圖（此演示中僅雅加達可用）。</li>
          <li>點擊<b>新增圖釘</b>，然後在地圖上點擊放置房屋。或手動輸入<b>經緯度</b>後點擊<b>新增</b>。</li>
          <li>點擊<b>地圖圖釘</b>查看預覽。點擊<b>查看詳情</b>開啟側邊欄。</li>
          <li>點擊地圖空白處關閉側邊欄。</li>
          <li>使用地圖上的<b>🔄重新整理</b>按鈕同步最新資料。</li>
        </ol>`,
        profiles: `<ol style="${S}">
          <li>切換到<b>檔案</b>選項卡查看所有房屋卡片。</li>
          <li>按<b>優先級</b>、<b>案件狀態</b>和<b>類型</b>使用下拉選單篩選。</li>
          <li>使用搜尋欄按<b>名稱或聯絡方式</b>搜尋。</li>
          <li>按名稱、建立日期、修改日期或優先級排序。</li>
          <li>點擊<b>匯出表格</b>將所有資料下載為Excel檔案。</li>
          <li>點擊卡片開啟詳細資訊並在地圖上定位。</li>
        </ol>`,
        editing: `<ol style="${S}">
          <li>在側邊欄中編輯：名稱、類型、<b>優先級</b>、<b>案件狀態</b>、座標、聯絡方式、備註、照片和連結。</li>
          <li>每棟房屋最多上傳<b>10張照片</b>。照片自動壓縮。</li>
          <li>使用<b>WhatsApp</b>/<b>撥打</b>按鈕快速聯繫。</li>
          <li><b>聯絡方式</b>須為印尼號碼（7-13位，以0開頭）。</li>
          <li><b>座標</b>可編輯 - 儲存後圖釘會移動。</li>
          <li>使用<b>在Google地圖中開啟</b>導航到位置。</li>
          <li>可附加Google文件、Google表格或自訂連結。</li>
        </ol>`,
        tips: `<ol style="${S}">
          <li>在有<b>未儲存更改</b>時嘗試離開會出現警告。</li>
          <li>每次儲存都會記錄<b>誰</b>最後修改以及<b>何時</b>修改。</li>
          <li>按<b>Escape</b>關閉彈窗、側邊欄或取消新增圖釘模式。</li>
        </ol>
        <div style="margin-top:4px;font-size:13px;color:#555;">${t("pin_colors")}：🔴 ${t("urgent")} &nbsp; 🟡 ${t("normal")} &nbsp; 🟢 ${t("stable")}</div>`
      }
    };

    const lang = G[currentLang] || G.zh_tw;
    const keys = ["map", "profiles", "editing", "tips"];
    const fullContent = `<ol style="${S}">` +
      keys.map((k) => lang[k].replace(/<\/?ol[^>]*>/g, "")).join("") +
      `</ol>`;

    guideEl.innerHTML = `
      <div class="mts-guide-tabs">
        ${lang.tabs.map((label, i) => `<button class="mts-guide-tab${i === 0 ? " active" : ""}" data-guide-idx="${i}">${label}</button>`).join("")}
      </div>
      <div class="mts-guide-panel active" data-guide-panel="0">${fullContent}</div>
      ${keys.map((key, i) => `<div class="mts-guide-panel" data-guide-panel="${i + 1}">${lang[key]}</div>`).join("")}
    `;

    guideEl.querySelectorAll(".mts-guide-tab").forEach((btn) => {
      btn.addEventListener("click", () => {
        guideEl.querySelectorAll(".mts-guide-tab").forEach((b) => b.classList.remove("active"));
        guideEl.querySelectorAll(".mts-guide-panel").forEach((p) => p.classList.remove("active"));
        btn.classList.add("active");
        guideEl.querySelector(`[data-guide-panel="${btn.dataset.guideIdx}"]`).classList.add("active");
      });
    });
  }

  renderGuideContent();

  // Language switch
  shell.querySelector("#mtsLangSelect").addEventListener("change", (e) => {
    currentLang = e.target.value;
    window.localStorage.setItem("mtsLang", currentLang);
    // Update all data-i18n elements
    shell.querySelectorAll("[data-i18n]").forEach((el) => {
      const key = el.dataset.i18n;
      if (el.tagName === "INPUT") el.placeholder = t(key);
      else {
        // For dropdown labels with emojis, append the emoji back
        if (key === "urgent") el.textContent = t(key) + " \ud83d\udd34";
        else if (key === "normal") el.textContent = t(key) + " \ud83d\udfe1";
        else if (key === "stable") el.textContent = t(key) + " \ud83d\udfe2";
        else el.textContent = t(key);
      }
    });
    // Reset dropdown button text if no filters are checked
    if (ui.priorityBtn && !ui.priorityDropdown?.querySelector("input:checked")) {
      ui.priorityBtn.textContent = t("all_priorities");
    }
    if (ui.caseStatusBtn && !ui.caseStatusDropdown?.querySelector("input:checked")) {
      ui.caseStatusBtn.textContent = t("all_case_statuses");
    }
    if (ui.typeBtn && !ui.typeDropdown?.querySelector("input:checked")) {
      ui.typeBtn.textContent = t("all_types");
    }
    // Update placeholders for lat/lng
    const latInput = shell.querySelector("#mtsLat");
    const lngInput = shell.querySelector("#mtsLng");
    if (latInput) latInput.placeholder = t("latitude");
    if (lngInput) lngInput.placeholder = t("longitude");
    // Re-render guide, cards, and map popups
    renderGuideContent();
    renderCards();
    renderMarkers();
    // Re-render sidebar if open
    if (state.selectedHouseId) openSidebar(state.selectedHouseId);
  });

  // Guide
  ui.toggleGuideBtn.addEventListener("click", () => {
    const currentlyHidden = ui.guide.classList.contains("hidden");
    setGuideVisible(currentlyHidden);
  });

  // Tabs (disabled until city is selected)
  ui.tabMap.addEventListener("click", () => {
    if (!state.territory) { showToast(t("please_select_city")); return; }
    setActiveTab("map");
  });
  ui.tabProfiles.addEventListener("click", () => {
    if (!state.territory) { showToast(t("please_select_city")); return; }
    setActiveTab("profiles");
  });

  // City
  ui.territorySelect.addEventListener("change", async () => {
    const value = ui.territorySelect.value;
    if (value) {
      // Disable the placeholder so user can't go back to "Select city"
      const placeholder = ui.territorySelect.querySelector('option[value=""]');
      if (placeholder) placeholder.disabled = true;
    }
    await setTerritory(value);
  });

  // Add by clicking map
  ui.addPinBtn.addEventListener("click", () => {
    if (!state.territory) { showToast(t("please_select_city")); return; }
    if (!state.map) return;
    state.addMode = !state.addMode;
    ui.addPinBtn.textContent = state.addMode ? t("click_on_map") : t("add_pin");
    showToast(state.addMode ? t("toast_pin_click") : t("toast_pin_cancel"));
  });

  // Add by coordinates
  ui.addByCoordsBtn.addEventListener("click", () => {
    if (!state.territory) { showToast(t("please_select_city")); return; }
    const latVal = ui.latInput.value.trim();
    const lngVal = ui.lngInput.value.trim();
    if (!latVal || !lngVal) {
      showToast(t("toast_enter_coords"));
      return;
    }
    const lat = Number(latVal);
    const lng = Number(lngVal);
    if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
      showToast(t("toast_invalid_coords"));
      return;
    }
    if (!withinJakartaBounds(lat, lng)) {
      showToast(t("toast_outside_jakarta"));
      return;
    }
    const nearby = findNearbyHouse(lat, lng);
    if (nearby) {
      const ok = window.confirm(`${t("confirm_nearby")}: "${nearby.name || '(Unnamed)'}"\n${t("confirm_proceed")}`);
      if (!ok) return;
    }
    openHouseModal({ mode: "create", lat, lng });
  });

  // Use My Location
  ui.useLocationBtn.addEventListener("click", () => {
    if (!state.territory) { showToast(t("please_select_city")); return; }
    if (!navigator.geolocation) {
      showToast(t("location_failed"));
      return;
    }
    ui.useLocationBtn.disabled = true;
    ui.useLocationBtn.textContent = t("locating");
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const lat = pos.coords.latitude.toFixed(6);
        const lng = pos.coords.longitude.toFixed(6);
        ui.latInput.value = lat;
        ui.lngInput.value = lng;
        ui.useLocationBtn.disabled = false;
        ui.useLocationBtn.textContent = t("use_my_location");
        showToast(`${t("coordinates")}: ${lat}, ${lng}`);
      },
      () => {
        showToast(t("location_failed"));
        ui.useLocationBtn.disabled = false;
        ui.useLocationBtn.textContent = t("use_my_location");
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  });

  // Clear coordinates
  ui.clearCoordsBtn.addEventListener("click", () => {
    if (!state.territory) { showToast(t("please_select_city")); return; }
    ui.latInput.value = "";
    ui.lngInput.value = "";
  });

  // Profiles filters
  shell.querySelector("#mtsRefresh").addEventListener("click", async () => {
    await refreshHouses();
  });
  shell.querySelector("#mtsReset").addEventListener("click", () => {
    // Clear search
    if (ui.searchInput) ui.searchInput.value = "";
    // Uncheck all priority filters
    if (ui.priorityDropdown) {
      ui.priorityDropdown.querySelectorAll("input:checked").forEach((cb) => { cb.checked = false; });
    }
    if (ui.priorityBtn) ui.priorityBtn.textContent = t("all_priorities");
    // Uncheck all case status filters
    if (ui.caseStatusDropdown) {
      ui.caseStatusDropdown.querySelectorAll("input:checked").forEach((cb) => { cb.checked = false; });
    }
    if (ui.caseStatusBtn) ui.caseStatusBtn.textContent = t("all_case_statuses");
    // Uncheck all type filters
    if (ui.typeDropdown) {
      ui.typeDropdown.querySelectorAll("input:checked").forEach((cb) => { cb.checked = false; });
    }
    if (ui.typeBtn) ui.typeBtn.textContent = t("all_types");
    // Reset sort
    if (ui.sortSelect) ui.sortSelect.value = "newest";
    renderCards();
    updateMapFilters();
  });
  let searchTimeout;
  ui.searchInput.addEventListener("input", () => {
    clearTimeout(searchTimeout);
    searchTimeout = setTimeout(() => { renderCards(); updateMapFilters(); }, 250);
  });
  if (ui.sortSelect) ui.sortSelect.addEventListener("change", () => renderCards());

  // Export CSV
  shell.querySelector("#mtsExportCsv").addEventListener("click", () => exportToCSV());

  // Multi-select dropdown logic
  function setupMultiSelect(btn, dropdown) {
    btn.addEventListener("click", (e) => {
      e.stopPropagation();
      // Close other open dropdowns first
      shell.querySelectorAll(".mts-multiselect-dropdown.open").forEach((d) => {
        if (d !== dropdown) d.classList.remove("open");
      });
      dropdown.classList.toggle("open");
    });

    dropdown.addEventListener("click", (e) => e.stopPropagation());

    dropdown.addEventListener("change", () => {
      const checked = dropdown.querySelectorAll("input:checked");
      if (checked.length === 0) {
        // Read current translation from data-i18n key
        const i18nKey = btn.dataset.i18n;
        btn.textContent = i18nKey ? t(i18nKey) : "All";
      } else {
        const labels = Array.from(checked).map((cb) => cb.parentElement.textContent.trim());
        btn.textContent = labels.length <= 2 ? labels.join(", ") : `${labels.length} selected`;
      }
      renderCards();
      updateMapFilters();
    });
  }

  setupMultiSelect(ui.priorityBtn, ui.priorityDropdown);
  setupMultiSelect(ui.caseStatusBtn, ui.caseStatusDropdown);
  setupMultiSelect(ui.typeBtn, ui.typeDropdown);

  // Close dropdowns when clicking outside
  document.addEventListener("click", () => {
    shell.querySelectorAll(".mts-multiselect-dropdown.open").forEach((d) => {
      d.classList.remove("open");
    });
  });

  // Sidebar
  ui.sidebarCloseBtn.addEventListener("click", () => {
    if (state.sidebarDirty) {
      const ok = window.confirm(t("confirm_unsaved"));
      if (!ok) return;
    }
    closeSidebar();
  });
  ui.sidebarSaveBtn.addEventListener("click", async () => {
    await saveSidebarChanges();
  });
  ui.sidebarDeleteBtn.addEventListener("click", async () => {
    await deleteSelectedHouse();
  });

  // Modal
  ui.modalCloseBtn.addEventListener("click", closeModal);
  ui.modalCancelBtn.addEventListener("click", closeModal);

  // Popup "View Details" button handler
  document.addEventListener("mts-open-sidebar", (e) => {
    // Guard against silent data loss
    if (state.sidebarDirty && !window.confirm(t("confirm_unsaved"))) return;
    const houseId = e.detail;
    if (houseId) openSidebar(houseId);
  });
}

function getCheckedValues(dropdown) {
  if (!dropdown) return [];
  return Array.from(dropdown.querySelectorAll("input:checked")).map((cb) => cb.value);
}

// Shared popup HTML generator (used by renderMarkers and saveSidebarChanges)
function generatePopupContent(house) {
  return `
    <div style="min-width:160px;font-family:inherit;font-size:12px;">
      <div style="font-weight:700;font-size:13px;margin-bottom:4px;">${escapeHtml(house.name || "(Unnamed)")}</div>
      <div style="color:#555;margin-bottom:2px;">${t("type")}: ${escapeHtml(translateType(house.type) || "-")}</div>
      <div style="color:#555;margin-bottom:2px;">${t("priority")}: ${priorityLabel(house.priority)}</div>
      <div style="color:#555;margin-bottom:6px;">${t("case_status")}: ${caseStatusLabel(house.status)}</div>
      <button onclick="document.dispatchEvent(new CustomEvent('mts-open-sidebar',{detail:'${house.id}'}))"
        style="padding:3px 10px;font-size:11px;background:#3170a7;color:#fff;border:none;border-radius:3px;cursor:pointer;">
        ${t("view_details")}
      </button>
    </div>
  `;
}

function matchesFilters(house) {
  const q = (ui.searchInput?.value || "").toLowerCase().trim();

  const priorityChecked = getCheckedValues(ui.priorityDropdown);
  if (priorityChecked.length && !priorityChecked.includes(normalizePriority(house.priority))) return false;

  const caseStatusChecked = getCheckedValues(ui.caseStatusDropdown);
  if (caseStatusChecked.length && !caseStatusChecked.includes(normalizeCaseStatus(house.status))) return false;

  const typeChecked = getCheckedValues(ui.typeDropdown);
  if (typeChecked.length && !typeChecked.some((t) => (house.type || "").toLowerCase() === t)) return false;

  if (q) {
    const nameStr = (house.name || "").toLowerCase();
    const contactStr = (house.contact || "").toLowerCase();
    if (!nameStr.includes(q) && !contactStr.includes(q)) return false;
  }
  return true;
}

function renderCards() {
  if (!ui.cardsWrap) return;
  ui.cardsWrap.innerHTML = "";

  // Don't show anything if no city selected
  if (!state.territory) {
    if (ui.houseCount) ui.houseCount.textContent = "";
    return;
  }

  const filtered = state.houses.filter(matchesFilters);

  // Sort
  const sortVal = ui.sortSelect?.value || "newest";
  filtered.sort((a, b) => {
    if (sortVal === "name_az") return (a.name || "").localeCompare(b.name || "");
    if (sortVal === "name_za") return (b.name || "").localeCompare(a.name || "");
    if (sortVal === "priority_urgent") {
      const order = { urgent: 0, normal: 1, stable: 2 };
      const diff = (order[a.priority] ?? 1) - (order[b.priority] ?? 1);
      if (diff !== 0) return diff;
      // Tiebreaker: sub-sort by newest created date
      return (b.created_at || "").localeCompare(a.created_at || "");
    }
    // ISO 8601 strings sort alphabetically — no need to parse Date objects
    const aCreated = a.created_at || "";
    const bCreated = b.created_at || "";
    const aMod = a.last_modified_at || aCreated;
    const bMod = b.last_modified_at || bCreated;
    if (sortVal === "oldest") return aCreated.localeCompare(bCreated);
    if (sortVal === "modified_newest") return bMod.localeCompare(aMod);
    if (sortVal === "modified_oldest") return aMod.localeCompare(bMod);
    return bCreated.localeCompare(aCreated); // newest
  });

  // House count
  if (ui.houseCount) {
    if (filtered.length === state.houses.length) {
      ui.houseCount.textContent = `${state.houses.length} ${t("houses")}`;
    } else {
      ui.houseCount.textContent = `${t("showing_houses")} ${filtered.length} ${t("of")} ${state.houses.length} ${t("houses")}`;
    }
  }

  // Update Profiles tab badge
  if (ui.tabProfiles) {
    ui.tabProfiles.textContent = state.houses.length
      ? `${t("profiles")} (${state.houses.length})`
      : t("profiles");
  }

  if (!filtered.length) {
    ui.cardsWrap.innerHTML = `
      <div class="mts-empty-state">
        <div class="mts-empty-icon">🔍</div>
        <div class="mts-empty-title">${t("no_houses_match")}</div>
        <div class="mts-empty-hint">${t("try_reset")}</div>
      </div>`;
    return;
  }

  for (const house of filtered) {
    const card = document.createElement("div");
    card.className = "mts-card";
    card.style.borderLeft = `4px solid ${priorityToColor(house.priority)}`;
    const lastVisitStr = house.last_visit_date
      ? new Date(house.last_visit_date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
      : t("never_visited");
    card.innerHTML = `
      <div class="title">${escapeHtml(house.name || "(Unnamed)")}</div>
      <div class="meta">${t("type")}: ${escapeHtml(translateType(house.type) || "-")}</div>
      <div class="meta">${t("last_visit_date")}: ${lastVisitStr}</div>
      <div style="display:flex;gap:6px;flex-wrap:wrap;margin-top:4px;">
        <span class="mts-badge mts-badge-priority" style="background:${priorityToColor(house.priority)}">${priorityLabel(house.priority)}</span>
        <span class="mts-badge mts-badge-case-status">${caseStatusLabel(house.status)}</span>
      </div>
    `;
    card.addEventListener("click", () => {
      // Guard against silent data loss
      if (state.sidebarDirty && !window.confirm(t("confirm_unsaved"))) return;

      // Show map and open sidebar (better UX).
      setActiveTab("map");
      if (state.map) {
        const marker = state.markers.get(house.id);
        const lat = Number(house.lat);
        const lng = Number(house.lng);
        if (marker && Number.isFinite(lat) && Number.isFinite(lng)) {
          // Use the native cluster method — it zooms and fires a callback
          // the exact moment the marker is visible (no arbitrary delay).
          state.clusterGroup.zoomToShowLayer(marker, () => {
            highlightPin(lat, lng);
            if (marker.openPopup) marker.openPopup();
          });
        }
      }
      openSidebar(house.id);
    });
    ui.cardsWrap.appendChild(card);
  }
}

// Sync map markers with the current profile filters.
function updateMapFilters() {
  if (!state.clusterGroup || !state.markers) return;
  state.clusterGroup.clearLayers();
  removeHighlight();
  const matchedMarkers = [];
  for (const house of state.houses) {
    if (matchesFilters(house)) {
      const marker = state.markers.get(house.id);
      if (marker) matchedMarkers.push(marker);
    }
  }
  state.clusterGroup.addLayers(matchedMarkers);
}


function exportToCSV() {
  if (!state.houses.length) {
    showToast(t("toast_no_houses"));
    return;
  }

  if (!window.XLSX) {
    showToast("Excel library not loaded. Try refreshing.");
    return;
  }

  const headers = ["Name", "Type", "Case Status", "Priority", "Last Visit Date", "Latitude", "Longitude", "Contact", "Notes", "Documents", "Last Modified By", "Last Modified At", "Created At"];
  const rows = state.houses.map((h) => {
    // Merge legacy doc/sheet into links for export
    const allDocs = [];
    if (h.doc_name || h.doc_link) allDocs.push(`${h.doc_name || "Doc"}: ${h.doc_link || ""}`);
    if (h.sheet_name || h.sheet_link) allDocs.push(`${h.sheet_name || "Sheet"}: ${h.sheet_link || ""}`);
    if (Array.isArray(h.links)) h.links.forEach((l) => allDocs.push(`${l.name || ""}: ${l.url || ""}`));
    const docsStr = allDocs.join(" | ");
    return [
      h.name || "", h.type || "", h.status || "", h.priority || "", h.last_visit_date || "", h.lat, h.lng,
      h.contact || "", h.notes || "",
      docsStr, h.last_modified_by || "", h.last_modified_at || "", h.created_at || "",
    ];
  });

  const wsData = [headers, ...rows];
  const ws = window.XLSX.utils.aoa_to_sheet(wsData);

  // Auto-size columns
  ws["!cols"] = headers.map((_, i) => {
    const maxLen = Math.max(headers[i].length, ...rows.map((r) => String(r[i] || "").length));
    return { wch: Math.min(maxLen + 2, 40) };
  });

  const wb = window.XLSX.utils.book_new();
  window.XLSX.utils.book_append_sheet(wb, ws, "Houses");
  window.XLSX.writeFile(wb, `houses_export_${new Date().toISOString().slice(0, 10)}.xlsx`);
  showToast(t("toast_exported"));
}

function openHouseModal({ mode, lat, lng }) {
  if (!ui.modalBackdrop || !ui.modalBody || !ui.modalTitle || !ui.modalSaveBtn) return;
  ui.modalTitle.textContent = mode === "create" ? t("add_house") : t("house");

  const caseStatusOptionsHtml = getCaseStatusOptions().map(
    (o) => `<option value="${o.value}">${o.label}</option>`
  ).join("");

  const priorityOptionsHtml = getPriorityOptions().map(
    (o) => `<option value="${o.value}">${o.label}</option>`
  ).join("");

  const typeOptionsHtml = getTypeOptions().map(
    (o) => `<option value="${o.value}">${o.label}</option>`
  ).join("");

  ui.modalBody.innerHTML = `
    <div class="mts-field"><label>${t("coordinates")}</label><input id="mLatLng" type="text" value="${escapeAttr(formatLatLng(lat, lng))}" disabled /></div>
    <div class="mts-field"><label>${t("name")}</label><input id="mName" type="text" /></div>
    <div class="mts-field"><label>${t("type")}</label><select id="mType"><option value="">${t("select_type")}</option>${typeOptionsHtml}</select></div>
    <div class="mts-field"><label>${t("priority")}</label><select id="mPriority">${priorityOptionsHtml}</select></div>
    <div class="mts-field"><label>${t("case_status")}</label><select id="mCaseStatus">${caseStatusOptionsHtml}</select></div>
    <div class="mts-field"><label>${t("contact")}</label><input id="mContact" type="text" inputmode="tel" maxlength="15" placeholder="08xx / +628xx" /></div>
    <div class="mts-field"><label>${t("notes")}</label><textarea id="mNotes" placeholder="${t("notes_placeholder")}"></textarea></div>
  `;

  ui.modalBackdrop.classList.add("open");
  ui.modalBackdrop.setAttribute("aria-hidden", "false");

  // Strip non-digits from contact as user types
  const mContactInput = ui.modalBody.querySelector("#mContact");
  if (mContactInput) {
    mContactInput.addEventListener("input", () => {
      mContactInput.value = stripNonDigits(mContactInput.value);
    });
  }

  ui.modalSaveBtn.onclick = async () => {
    await createHouse({ lat, lng });
  };
}

function closeModal() {
  ui.modalBackdrop?.classList.remove("open");
  ui.modalBackdrop?.setAttribute("aria-hidden", "true");
  if (ui.modalBody) ui.modalBody.innerHTML = "";
  if (ui.modalSaveBtn) ui.modalSaveBtn.onclick = null;
}

async function createHouse({ lat, lng }) {
  if (!supabaseClient || !ui.modalBody) return;

  const name = String(ui.modalBody.querySelector("#mName")?.value || "").trim();
  const type = String(ui.modalBody.querySelector("#mType")?.value || "").trim();
  const status = String(ui.modalBody.querySelector("#mCaseStatus")?.value || "new case");
  const priority = String(ui.modalBody.querySelector("#mPriority")?.value || "normal");
  const contact = stripNonDigits(ui.modalBody.querySelector("#mContact")?.value || "");
  const notes = String(ui.modalBody.querySelector("#mNotes")?.value || "");

  if (!name) {
    showToast(t("toast_name_req"));
    return;
  }

  // Duplicate name check
  const dupName = state.houses.find((h) => (h.name || "").toLowerCase() === name.toLowerCase());
  if (dupName) {
    const ok = window.confirm(`${t("confirm_dup_name")}: "${dupName.name}"\n${t("confirm_proceed")}`);
    if (!ok) return;
  }

  const contactErr = validateContact(contact);
  if (contactErr !== true) {
    showToast(contactErr);
    return;
  }

  const last_modified_by = window.localStorage.getItem("loggedInUserName") || "unknown";
  const last_modified_at = new Date().toISOString();

  const payload = {
    name,
    type,
    status,
    priority,
    lat,
    lng,
    contact,
    notes,
    doc_link: null,
    doc_name: null,
    sheet_link: null,
    sheet_name: null,
    links: [],
    last_modified_by,
    last_modified_at,
  };

  const { data, error } = await supabaseClient
    .from("houses")
    .insert(payload)
    .select("id,name,type,status,priority,last_visit_date,lat,lng,contact,notes,doc_link,doc_name,sheet_link,sheet_name,links,last_modified_by,last_modified_at,created_at")
    .maybeSingle();

  if (error || !data) {
    showToast(t("toast_failed_add"));
    return;
  }

  state.houses.unshift({ ...data, status: normalizeCaseStatus(data.status), priority: normalizePriority(data.priority) });
  closeModal();
  renderMarkers();
  renderCards();

  // Open sidebar for quick edits
  openSidebar(data.id);
  showToast(t("toast_saved"));
}

// ------------------------
// Navigation links
// ------------------------
function confirmNavigation(event, targetPage, isLogout = false) {
  event.preventDefault();
  if (state.sidebarDirty && !window.confirm(t("confirm_unsaved"))) return;
  delayedNavigate(targetPage, isLogout);
}

closeLinkMap.addEventListener("click", (e) => confirmNavigation(e, DASHBOARD2_PAGE));
publicActivitySidebarLinkMap.addEventListener("click", (e) => confirmNavigation(e, DASHBOARD2_PAGE));
publicActivitiesLinkMap.addEventListener("click", (e) => confirmNavigation(e, DASHBOARD2_PAGE));
logoutLinkMap.addEventListener("click", (e) => confirmNavigation(e, LOGIN_PAGE, true));

// ------------------------
// Boot
// ------------------------

renderShell();

mapTrackingImage.addEventListener("load", positionMapTrackingOverlay);
window.addEventListener("resize", positionMapTrackingOverlay);
positionMapTrackingOverlay();

// Default territory selection, keep it blank to force the user to pick.
// If you want Jakarta pre-selected, uncomment below.
// ui.territorySelect.value = "jakarta";
// setTerritory("jakarta");

// Grey out all buttons + tabs until a city is selected
setTerritory("");

// Escape key shortcuts
document.addEventListener("keydown", (e) => {
  if (e.key !== "Escape") return;
  // 1. Close modal first (highest priority)
  if (ui.modalBackdrop && ui.modalBackdrop.classList.contains("open")) {
    closeModal();
    return;
  }
  // 2. Close sidebar
  if (ui.sidebar && ui.sidebar.classList.contains("open")) {
    if (state.sidebarDirty) {
      const ok = window.confirm(t("confirm_unsaved"));
      if (!ok) return;
    }
    closeSidebar();
    return;
  }
  // 3. Cancel add-pin mode
  if (state.addMode) {
    state.addMode = false;
    ui.addPinBtn.textContent = t("add_pin");
    showToast(t("toast_pin_cancel"));
  }
});

// Warn before leaving page with unsaved sidebar changes
window.addEventListener("beforeunload", (e) => {
  if (state.sidebarDirty) {
    e.preventDefault();
    e.returnValue = "";
  }
});

// Offline / online indicator
function updateOnlineStatus() {
  if (ui.offlineBanner) {
    ui.offlineBanner.classList.toggle("show", !navigator.onLine);
  }
}
window.addEventListener("online", updateOnlineStatus);
window.addEventListener("offline", updateOnlineStatus);
updateOnlineStatus();
