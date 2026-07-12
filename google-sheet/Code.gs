/**
 * Store PP26 — Google Sheet backend (free, no server needed).
 *
 * SAVE (app -> sheet): stores the exact JSON snapshot in a hidden "_data" sheet
 * AND renders each collection into a readable Thai tab (พนักงาน, วัสดุสิ้นเปลือง,
 * ทรัพย์สิน, ...).
 *
 * LOAD (sheet -> app): starts from the _data snapshot, then OVERRIDES the three
 * master lists (staff / consumables / assets) from the readable tabs — so you
 * can type or paste your real inventory into those tabs and pull it into the
 * app. Other collections (history, requests, ...) come from the snapshot.
 *
 * SETUP: see google-sheet/README.md.
 */

var RAW_SHEET = '_data';
var CELL = 'A1';

// collection key -> readable Thai tab name + [fieldKey, thaiHeader] columns
var TABLES = {
  staff: {
    tab: 'พนักงาน',
    cols: [['id', 'ID'], ['name', 'ชื่อ'], ['phone', 'เบอร์โทร'], ['position', 'ตำแหน่ง'], ['photo', 'รูป']],
  },
  consumables: {
    tab: 'วัสดุสิ้นเปลือง',
    cols: [['code', 'รหัส'], ['name', 'รายการ'], ['category', 'หมวด'], ['unit', 'หน่วย'], ['qty', 'คงเหลือ'], ['threshold', 'ขั้นต่ำ'], ['id', 'ID'], ['photo', 'รูป']],
  },
  assets: {
    tab: 'ทรัพย์สิน',
    cols: [['code', 'รหัส'], ['category', 'ประเภท'], ['name', 'รุ่น/ยี่ห้อ'], ['status', 'สถานะ'], ['holderStaffId', 'ผู้ถือ (ID)'], ['site', 'หน่วยงาน'], ['costCode', 'Cost Code'], ['date', 'วันที่เบิก'], ['id', 'ID'], ['photo', 'รูป']],
  },
  transactions: {
    tab: 'ประวัติเบิก-คืน',
    cols: [['date', 'วันที่'], ['person', 'บุคคล'], ['action', 'รายการ'], ['item', 'ของ'], ['job', 'งาน/หน่วยงาน'], ['costCode', 'Cost Code']],
  },
  pending: {
    tab: 'คำขอรออนุมัติ',
    cols: [['id', 'ID'], ['kind', 'ประเภท'], ['staffId', 'ผู้ขอ (ID)'], ['job', 'งาน'], ['costCode', 'Cost Code'], ['date', 'วันที่'], ['lines', 'รายการ (JSON)']],
  },
  requisitions: {
    tab: 'ใบขอใช้สโตร์กลาง',
    cols: [['docNo', 'เลขที่เอกสาร'], ['date', 'วันที่'], ['id', 'ID'], ['lines', 'รายการ (JSON)']],
  },
  deliveries: {
    tab: 'บันทึกรับเข้า',
    cols: [['id', 'ID'], ['reqId', 'ใบขอใช้ (ID)'], ['lineId', 'รายการ (ID)'], ['qty', 'จำนวน'], ['date', 'วันที่'], ['photo', 'รูป']],
  },
  scrapReturns: {
    tab: 'ส่งคืนเศษเหล็ก',
    cols: [['id', 'ID'], ['date', 'วันที่'], ['note', 'หมายเหตุ'], ['status', 'สถานะ'], ['slipNo', 'เลขใบส่งคืน'], ['slipDate', 'วันที่รับใบ'], ['photo', 'รูป']],
  },
};

// Which readable tabs are safe to import back into the app (flat master lists).
var IMPORT_KEYS = ['staff', 'consumables', 'assets'];

var STATUS_BY_LABEL = {
  'พร้อมเบิก': 'available',
  'กำลังถูกเบิกใช้': 'in_use', 'ใช้งานอยู่': 'in_use', 'มีคนถือ': 'in_use',
  'ส่งซ่อม': 'repair', 'ชำรุด': 'damaged', 'หาย': 'lost',
  available: 'available', in_use: 'in_use', repair: 'repair', damaged: 'damaged', lost: 'lost',
};

function json_(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}

function rawSheet_() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sh = ss.getSheetByName(RAW_SHEET);
  if (!sh) { sh = ss.insertSheet(RAW_SHEET); sh.hideSheet(); }
  return sh;
}

var _idc = 0;
function genId_(p) { _idc++; return p + '_' + Date.now() + '_' + _idc; }
function num_(v) { var n = Number(v); return isNaN(n) ? 0 : n; }
function str_(v) { return v === null || v === undefined ? '' : String(v); }

// ---- SAVE: render one collection into its readable tab ----
function writeTable_(ss, key, rows) {
  var def = TABLES[key];
  if (!def) return;
  var sh = ss.getSheetByName(def.tab) || ss.insertSheet(def.tab);
  sh.clear();
  var headers = def.cols.map(function (c) { return c[1]; });
  var values = [headers];
  (rows || []).forEach(function (r) {
    values.push(def.cols.map(function (c) {
      var v = r[c[0]];
      if (v === null || v === undefined) return '';
      if (typeof v === 'object') return JSON.stringify(v);
      return v;
    }));
  });
  var range = sh.getRange(1, 1, values.length, headers.length);
  range.setNumberFormat('@');
  range.setValues(values);
  sh.getRange(1, 1, 1, headers.length).setFontWeight('bold').setBackground('#2a303c').setFontColor('#ffffff');
  sh.setFrozenRows(1);
}

// ---- LOAD: parse a readable tab back into row objects ----
function parseTable_(ss, key) {
  var def = TABLES[key];
  var sh = ss.getSheetByName(def.tab);
  if (!sh) return null;
  var values = sh.getDataRange().getValues();
  if (values.length < 2) return [];

  var labelToKey = {};
  def.cols.forEach(function (c) { labelToKey[c[1]] = c[0]; });
  var colKeys = values[0].map(function (h) { return labelToKey[String(h).trim()] || null; });

  var rows = [];
  for (var i = 1; i < values.length; i++) {
    var raw = values[i];
    if (raw.join('').trim() === '') continue; // skip blank lines
    var obj = {};
    colKeys.forEach(function (k, idx) { if (k) obj[k] = raw[idx]; });
    rows.push(normalizeRow_(key, obj));
  }
  return rows;
}

function normalizeRow_(key, o) {
  if (key === 'staff') {
    return { id: str_(o.id) || genId_('s'), name: str_(o.name), phone: str_(o.phone), position: str_(o.position), photo: str_(o.photo) };
  }
  if (key === 'consumables') {
    return {
      id: str_(o.id) || genId_('c'), code: str_(o.code), name: str_(o.name), category: str_(o.category) || 'ทั่วไป',
      unit: str_(o.unit), qty: num_(o.qty), threshold: num_(o.threshold), photo: str_(o.photo),
    };
  }
  if (key === 'assets') {
    var st = STATUS_BY_LABEL[str_(o.status).trim()] || 'available';
    return {
      id: str_(o.id) || genId_('a'), code: str_(o.code), category: str_(o.category) || 'ทั่วไป', name: str_(o.name),
      status: st, holderStaffId: str_(o.holderStaffId) || null, site: str_(o.site) || 'สโตร์กลาง',
      costCode: str_(o.costCode) || null, date: str_(o.date) || null, photo: str_(o.photo),
    };
  }
  return o;
}

// GET ?action=load  ->  { ok, data }
function doGet(e) {
  var action = (e && e.parameter && e.parameter.action) || 'load';
  if (action !== 'load') return json_({ ok: false, error: 'unknown action' });

  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var raw = rawSheet_().getRange(CELL).getValue();
  var data = {};
  if (raw) { try { data = JSON.parse(raw) || {}; } catch (err) { data = {}; } }

  // Override the three master lists from the readable tabs when present.
  IMPORT_KEYS.forEach(function (key) {
    var rows = parseTable_(ss, key);
    if (rows && rows.length) data[key] = rows;
  });

  return json_({ ok: true, data: data });
}

// POST { action:'save', data:{...} }  ->  { ok }
function doPost(e) {
  var body = {};
  try { body = JSON.parse(e.postData.contents); } catch (err) { body = {}; }
  if (body.action !== 'save') return json_({ ok: false, error: 'unknown action' });

  var data = body.data || {};
  rawSheet_().getRange(CELL).setValue(JSON.stringify(data));
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  Object.keys(TABLES).forEach(function (key) { writeTable_(ss, key, data[key]); });
  return json_({ ok: true });
}
