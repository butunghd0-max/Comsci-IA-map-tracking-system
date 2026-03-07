// ============================================
// mts-i18n.js — Internationalization
// ============================================
// Stores all user-facing strings in a lookup table (I18N) keyed by
// translation key then language code: I18N[key][lang] → string.
// Every module retrieves text through the t() helper.
//
// Supported languages: en, id (Bahasa), zh_cn, zh_tw.
//
// Extensibility: to add a language, add it to LANGS and add a
// property to every I18N entry.  The language selector auto-populates.
// ============================================

const LANGS = {
  en: "English",
  id: "Bahasa",
  zh_cn: "简体中文",
  zh_tw: "繁體中文",
};

// Persisted in localStorage so the choice survives page reloads.
let currentLang = window.localStorage.getItem("mtsLang") || "en";

// Translations organised by UI section.
const I18N = {
  // Topbar
  title:            { en: "Map Tracking System", id: "Map Tracking System", zh_cn: "地图追踪系统", zh_tw: "地圖追蹤系統" },
  city:             { en: "City:", id: "Kota:", zh_cn: "城市:", zh_tw: "城市:" },
  select_city:      { en: "Select city", id: "Pilih kota", zh_cn: "选择城市", zh_tw: "選擇城市" },
  hide_guide:       { en: "Hide guide", id: "Tutup panduan", zh_cn: "隐藏指南", zh_tw: "隱藏指南" },
  show_guide:       { en: "Show guide", id: "Tampilkan panduan", zh_cn: "显示指南", zh_tw: "顯示指南" },
  add_pin:          { en: "Add pin", id: "Tambah pin", zh_cn: "添加图钉", zh_tw: "新增圖釘" },
  click_on_map:     { en: "Click on map...", id: "Klik pada peta...", zh_cn: "点击地图...", zh_tw: "點擊地圖..." },
  latitude:         { en: "Latitude", id: "Latitude", zh_cn: "纬度", zh_tw: "緯度" },
  longitude:        { en: "Longitude", id: "Longitude", zh_cn: "经度", zh_tw: "經度" },
  add:              { en: "Add", id: "Tambah", zh_cn: "添加", zh_tw: "新增" },
  clear:            { en: "Clear", id: "Hapus", zh_cn: "清除", zh_tw: "清除" },
  // Tabs
  map:              { en: "Map", id: "Peta", zh_cn: "地图", zh_tw: "地圖" },
  profiles:         { en: "Profiles", id: "Profil", zh_cn: "档案", zh_tw: "檔案" },
  // Guide
  quick_guide:      { en: "Quick Guide", id: "Panduan Singkat", zh_cn: "快速指南", zh_tw: "快速指南" },
  // Profiles toolbar
  search_by:       { en: "Search By", id: "Cari berdasarkan", zh_cn: "搜索", zh_tw: "搜尋" },
  containing:       { en: "containing", id: "mengandung", zh_cn: "包含", zh_tw: "包含" },
  filter:           { en: "Filter", id: "Filter", zh_cn: "筛选", zh_tw: "篩選" },
  newest_first:     { en: "Newest first", id: "Terbaru", zh_cn: "最新优先", zh_tw: "最新優先" },
  oldest_first:     { en: "Oldest first", id: "Terlama", zh_cn: "最旧优先", zh_tw: "最舊優先" },
  name_az:          { en: "Name A-Z", id: "Nama A-Z", zh_cn: "名称 A-Z", zh_tw: "名稱 A-Z" },
  name_za:          { en: "Name Z-A", id: "Nama Z-A", zh_cn: "名称 Z-A", zh_tw: "名稱 Z-A" },
  modified_newest:  { en: "Recently modified", id: "Terakhir diubah", zh_cn: "最近修改", zh_tw: "最近修改" },
  modified_oldest:  { en: "Oldest modified", id: "Terlama diubah", zh_cn: "最早修改", zh_tw: "最早修改" },
  export_sheet:     { en: "Export Spreadsheet", id: "Ekspor Spreadsheet", zh_cn: "导出表格", zh_tw: "匯出表格" },
  priority_urgent_first: { en: "Priority (urgent first)", id: "Prioritas (mendesak dulu)", zh_cn: "优先级（紧急优先）", zh_tw: "優先級（緊急優先）" },
  last_visit_date:  { en: "Last visit", id: "Kunjungan terakhir", zh_cn: "最后访视", zh_tw: "最後訪視" },
  never_visited:    { en: "Never visited", id: "Belum pernah dikunjungi", zh_cn: "尚未访视", zh_tw: "尚未訪視" },
  today:            { en: "Today", id: "Hari ini", zh_cn: "今天", zh_tw: "今天" },
  all_types:        { en: "All types", id: "Semua Tipe", zh_cn: "所有类型", zh_tw: "所有類型" },
  // Case Status labels
  case_status:      { en: "Case Status", id: "Status Kasus", zh_cn: "案件状态", zh_tw: "案件狀態" },
  new_case:         { en: "New Case", id: "Kasus Baru", zh_cn: "新案", zh_tw: "新案" },
  active_care:      { en: "Active Care", id: "Perawatan Aktif", zh_cn: "访视中", zh_tw: "訪視中" },
  follow_up:        { en: "Follow-up", id: "Tindak Lanjut", zh_cn: "稳定追踪", zh_tw: "穩定追蹤" },
  case_closed:      { en: "Closed", id: "Selesai", zh_cn: "结案", zh_tw: "結案" },
  all_case_statuses: { en: "All case statuses", id: "Semua status kasus", zh_cn: "所有案件状态", zh_tw: "所有案件狀態" },
  // Priority labels
  priority:         { en: "Priority", id: "Prioritas", zh_cn: "优先级", zh_tw: "優先級" },
  urgent:           { en: "Urgent", id: "Mendesak", zh_cn: "紧急", zh_tw: "緊急" },
  normal:           { en: "Normal", id: "Normal", zh_cn: "一般", zh_tw: "一般" },
  stable:           { en: "Stable", id: "Stabil", zh_cn: "稳定", zh_tw: "穩定" },
  all_priorities:   { en: "All priorities", id: "Semua prioritas", zh_cn: "所有优先级", zh_tw: "所有優先級" },
  // Type labels
  orphanage:        { en: "Orphanage", id: "Panti Asuhan", zh_cn: "孤儿院", zh_tw: "孤兒院" },
  nursing_home:     { en: "Nursing Home", id: "Panti Jompo", zh_cn: "养老院", zh_tw: "養老院" },
  rest_house:       { en: "Rest House", id: "Rumah Singgah", zh_cn: "中途之家", zh_tw: "中途之家" },
  // Sidebar
  name:             { en: "Name", id: "Nama", zh_cn: "名称", zh_tw: "名稱" },
  type:             { en: "Type", id: "Tipe", zh_cn: "类型", zh_tw: "類型" },
  status:           { en: "Status", id: "Status", zh_cn: "状态", zh_tw: "狀態" },
  select_type:      { en: "Select type", id: "Pilih tipe", zh_cn: "选择类型", zh_tw: "選擇類型" },
  coordinates:      { en: "Coordinates", id: "Koordinat", zh_cn: "坐标", zh_tw: "座標" },
  open_gmaps:       { en: "Open in Google Maps", id: "Buka di Google Maps", zh_cn: "在Google地图中打开", zh_tw: "在Google地圖中開啟" },
  contact:          { en: "Contact", id: "Kontak", zh_cn: "联系方式", zh_tw: "聯絡方式" },
  notes:            { en: "Notes", id: "Catatan", zh_cn: "备注", zh_tw: "備註" },
  notes_placeholder:{ en: "Add visit notes, reminders, etc", id: "Tambahkan catatan...", zh_cn: "添加访问备注、提醒等", zh_tw: "新增訪問備註、提醒等" },
  documents:        { en: "Documents", id: "Dokumen", zh_cn: "文档", zh_tw: "文件" },
  no_documents:     { en: "No documents yet", id: "Belum ada dokumen", zh_cn: "暂无文档", zh_tw: "暫無文件" },
  open:             { en: "Open", id: "Buka", zh_cn: "打开", zh_tw: "打開" },
  links:            { en: "Links", id: "Link", zh_cn: "链接", zh_tw: "連結" },
  add_link:         { en: "+ Add Link", id: "+ Tambah Link", zh_cn: "+ 添加链接", zh_tw: "+ 新增連結" },
  close:            { en: "Close", id: "Tutup", zh_cn: "关闭", zh_tw: "關閉" },
  delete:           { en: "Delete", id: "Hapus", zh_cn: "删除", zh_tw: "刪除" },
  save_changes:     { en: "Save changes", id: "Simpan", zh_cn: "保存更改", zh_tw: "儲存更改" },
  house:            { en: "House", id: "Rumah", zh_cn: "房屋", zh_tw: "房屋" },
  view_details:     { en: "View Details", id: "Lihat Detail", zh_cn: "查看详情", zh_tw: "查看詳情" },
  // Photos
  photos:           { en: "Photos", id: "Foto", zh_cn: "照片", zh_tw: "照片" },
  upload_photos:    { en: "📷 Upload Photos", id: "📷 Unggah Foto", zh_cn: "📷 上传照片", zh_tw: "📷 上傳照片" },
  uploading:        { en: "Uploading...", id: "Mengunggah...", zh_cn: "上传中...", zh_tw: "上傳中..." },
  photo_limit:      { en: "Max 10 photos per house", id: "Maks 10 foto per rumah", zh_cn: "每个房屋最多10张照片", zh_tw: "每個房屋最多10張照片" },
  delete_photo:     { en: "Delete this photo?", id: "Hapus foto ini?", zh_cn: "删除这张照片？", zh_tw: "刪除這張照片？" },
  // Communication
  whatsapp:         { en: "WhatsApp", id: "WhatsApp", zh_cn: "WhatsApp", zh_tw: "WhatsApp" },
  call:             { en: "Call", id: "Telepon", zh_cn: "拨打", zh_tw: "撥打" },
  use_my_location:  { en: "📍 Use My Location", id: "📍 Gunakan Lokasi Saya", zh_cn: "📍 使用我的位置", zh_tw: "📍 使用我的位置" },
  locating:         { en: "Locating...", id: "Menentukan lokasi...", zh_cn: "定位中...", zh_tw: "定位中..." },
  location_failed:  { en: "Could not get your location", id: "Tidak dapat menentukan lokasi Anda", zh_cn: "无法获取您的位置", zh_tw: "無法獲取您的位置" },
  // Toasts & Confirms
  toast_name_req:   { en: "Name is required", id: "Nama wajib diisi", zh_cn: "名称为必填项", zh_tw: "名稱為必填項" },
  toast_type_req:   { en: "Please select a type", id: "Silakan pilih tipe", zh_cn: "请选择类型", zh_tw: "請選擇類型" },
  toast_saved:      { en: "Saved", id: "Tersimpan", zh_cn: "已保存", zh_tw: "已儲存" },
  toast_deleted:    { en: "Deleted", id: "Terhapus", zh_cn: "已删除", zh_tw: "已刪除" },
  toast_no_url:     { en: "No URL to open", id: "Tidak ada URL", zh_cn: "没有可打开的 URL", zh_tw: "沒有可打開的 URL" },
  toast_exported:   { en: "Spreadsheet exported", id: "Spreadsheet diekspor", zh_cn: "电子表格已导出", zh_tw: "試算表已匯出" },
  toast_no_houses:  { en: "No houses to export", id: "Tidak ada rumah", zh_cn: "没有可导出的房屋", zh_tw: "沒有可匯出的房屋" },
  toast_pin_click:  { en: "Click inside Jakarta to place a pin", id: "Klik di dalam Jakarta", zh_cn: "在雅加达内点击以放置图钉", zh_tw: "在雅加達內點擊以放置圖釘" },
  toast_pin_cancel: { en: "Pin adding cancelled", id: "Penambahan pin dibatalkan", zh_cn: "已取消添加图钉", zh_tw: "已取消新增圖釘" },
  toast_invalid_coords: { en: "Invalid coordinates format", id: "Format koordinat tidak valid", zh_cn: "坐标格式无效", zh_tw: "座標格式無效" },
  toast_enter_coords: { en: "Please enter latitude and longitude", id: "Masukkan lintang dan bujur", zh_cn: "请输入经纬度", zh_tw: "請輸入經緯度" },
  toast_outside_jakarta: { en: "Coordinates must be inside Jakarta", id: "Koordinat harus di dalam Jakarta", zh_cn: "坐标必须在雅加达范围内", zh_tw: "座標必須在雅加達範圍內" },
  toast_failed_load: { en: "Failed to load houses", id: "Gagal memuat rumah", zh_cn: "加载房屋失败", zh_tw: "載入房屋失敗" },
  toast_failed_save: { en: "Failed to save", id: "Gagal menyimpan", zh_cn: "保存失败", zh_tw: "儲存失敗" },
  toast_failed_delete: { en: "Failed to delete", id: "Gagal menghapus", zh_cn: "删除失败", zh_tw: "刪除失敗" },
  toast_failed_add: { en: "Failed to add house", id: "Gagal menambahkan rumah", zh_cn: "添加房屋失败", zh_tw: "新增房屋失敗" },
  toast_only_jakarta: { en: "Only Jakarta is available in this demo", id: "Hanya Jakarta yang tersedia", zh_cn: "此演示中仅雅加达可用", zh_tw: "此演示中僅雅加達可用" },
  confirm_delete:   { en: "Delete this house? This cannot be undone.", id: "Hapus rumah ini? Tidak dapat dibatalkan.", zh_cn: "删除此房屋？此操作无法撤销。", zh_tw: "刪除此房屋？此操作無法復原。" },
  confirm_unsaved:  { en: "You have unsaved changes. Discard them?", id: "Ada perubahan yang belum disimpan. Abaikan?", zh_cn: "您有未保存的更改。要放弃吗？", zh_tw: "您有未儲存的更改。要放棄嗎？" },
  confirm_nearby:   { en: "There is already a house nearby", id: "Sudah ada rumah di dekat sini", zh_cn: "附近已经有房屋", zh_tw: "附近已經有房屋" },
  confirm_dup_name: { en: "A house named this already exists", id: "Rumah dengan nama ini sudah ada", zh_cn: "同名房屋已存在", zh_tw: "同名房屋已存在" },
  confirm_proceed:  { en: "Do you still want to proceed?", id: "Lanjutkan?", zh_cn: "您仍要继续吗？", zh_tw: "您仍要繼續嗎？" },
  add_house:        { en: "Add House", id: "Tambah Rumah", zh_cn: "添加房屋", zh_tw: "新增房屋" },
  showing_houses:   { en: "Showing", id: "Menampilkan", zh_cn: "显示", zh_tw: "顯示" },
  of:               { en: "of", id: "dari", zh_cn: "/", zh_tw: "/" },
  houses:           { en: "houses", id: "rumah", zh_cn: "房屋", zh_tw: "房屋" },
  last_modified_by: { en: "Last modified by", id: "Terakhir diubah oleh", zh_cn: "最后修改者", zh_tw: "最後修改者" },
  on:               { en: "on", id: "pada", zh_cn: "于", zh_tw: "於" },
  pin_colors:       { en: "Pin colors", id: "Warna pin", zh_cn: "图钉颜色", zh_tw: "圖釘顏色" },
  please_select_city: { en: "Please select a city first", id: "Silakan pilih kota terlebih dahulu", zh_cn: "请先选择城市", zh_tw: "請先選擇城市" },
  toast_refreshed:  { en: "Data refreshed", id: "Data diperbarui", zh_cn: "数据已刷新", zh_tw: "資料已重新整理" },
  no_houses_match:  { en: "No houses match your filters", id: "Tidak ada rumah yang cocok dengan filter", zh_cn: "没有匹配筛选条件的房屋", zh_tw: "沒有符合篩選條件的房屋" },
  try_reset:        { en: "Try resetting your filters", id: "Coba reset filter Anda", zh_cn: "尝试重置筛选条件", zh_tw: "嘗試重置篩選條件" },
  reset:            { en: "Reset", id: "Reset", zh_cn: "重置", zh_tw: "重置" },
  refresh_houses:   { en: "Refresh houses", id: "Segarkan rumah", zh_cn: "刷新房屋", zh_tw: "重新整理房屋" },
};

/**
 * Look up a translated string for the current language.
 * Falls back to Indonesian, then to the raw key.
 * @param {string} key - Translation key (must exist in I18N).
 * @returns {string} Translated text, or the key itself if not found.
 */
function t(key) {
  const entry = I18N[key];
  if (!entry) return key;
  return entry[currentLang] || entry["id"] || key;
}

// Built fresh each call so labels match the current language.
/** @returns {{ value: string, label: string }[]} */
function getCaseStatusOptions() {
  return [
    { value: "new case", label: t("new_case") },
    { value: "active care", label: t("active_care") },
    { value: "follow-up", label: t("follow_up") },
    { value: "closed", label: t("case_closed") },
  ];
}

function getPriorityOptions() {
  return [
    { value: "urgent", label: `${t("urgent")} (🔴)` },
    { value: "normal", label: `${t("normal")} (🟡)` },
    { value: "stable", label: `${t("stable")} (🟢)` },
  ];
}

function getTypeOptions() {
  return [
    { value: "Orphanage", label: t("orphanage") },
    { value: "Nursing Home", label: t("nursing_home") },
    { value: "Rest House", label: t("rest_house") },
  ];
}

/**
 * Map a priority level to its marker colour.
 * @param {string} priority - "urgent", "normal", or "stable".
 * @returns {string} Hex colour code.
 */
function priorityToColor(priority) {
  const p = String(priority || "").toLowerCase();
  if (p === "urgent") return "#d64545";
  if (p === "stable") return "#2f9e44";
  return "#caa52a"; // default: normal
}

/**
 * Normalize a raw priority string to one of: "urgent", "normal", "stable".
 * @param {string} priority
 * @returns {string}
 */
function normalizePriority(priority) {
  const p = String(priority || "").toLowerCase();
  if (p === "urgent") return "urgent";
  if (p === "stable") return "stable";
  return "normal";
}

/**
 * Normalize a raw case-status string using fuzzy matching (includes()).
 * Handles variations like "Active Care", "active", "ACTIVE_CARE".
 * @param {string} status
 * @returns {string} One of: "new case", "active care", "follow-up", "closed".
 */
function normalizeCaseStatus(status) {
  const s = String(status || "").toLowerCase();
  if (s.includes("new")) return "new case";
  if (s.includes("active") || s.includes("care")) return "active care";
  if (s.includes("follow")) return "follow-up";
  if (s.includes("close") || s.includes("done")) return "closed";
  return "new case";
}

/** Convert a house type (e.g. "Nursing Home") to its translated label. */
function translateType(type) {
  if (!type) return "";
  const key = type.toLowerCase().replace(/\s+/g, "_");
  return t(key) || type;
}

/** @returns {string} Translated priority label for UI display. */
function priorityLabel(priority) {
  const p = normalizePriority(priority);
  if (p === "urgent") return t("urgent");
  if (p === "stable") return t("stable");
  return t("normal");
}

function caseStatusLabel(status) {
  const s = normalizeCaseStatus(status);
  if (s === "new case") return t("new_case");
  if (s === "active care") return t("active_care");
  if (s === "follow-up") return t("follow_up");
  if (s === "closed") return t("case_closed");
  return t("new_case");
}
