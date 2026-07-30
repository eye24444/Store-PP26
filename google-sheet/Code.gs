/**
 * Store PP26 — Google Sheet backend v3 (shared with AppSheet)
 *
 * โมเดล: Item / Staff / Store / Requisition / Inventory (ชุดเดียวกับ AppSheet)
 *   - doGet  : ส่งข้อมูลทุกแท็บให้เว็บอ่านสด
 *   - doPost : รับการเบิก/คืนจากเว็บ → สร้าง 1 ใบ Requisition + หลายแถว Inventory
 *              (ออกเลข Req NO + ใส่ Movement +/- ให้เอง เพราะเว็บเขียนตรง ไม่ผ่าน AppSheet)
 *   - ไม่ยุ่งกับคอลัมน์ Stock ในตาราง Item (เป็นสูตร SUMIF อยู่แล้ว อัปเดตเอง)
 *
 * Deploy เป็น Web App (Execute as: Me, Who has access: Anyone)
 */

var READ_TABS = ['Item', 'Staff', 'Store', 'Requisition', 'Inventory'];
var TZ = 'Asia/Bangkok';

function json_(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}

function readTab_(ss, name) {
  var sh = ss.getSheetByName(name);
  if (!sh) return { headers: [], rows: [] };
  var values = sh.getDataRange().getDisplayValues();
  if (!values.length) return { headers: [], rows: [] };
  var headers = values[0].map(function (h) { return String(h).trim(); });
  var rows = [];
  for (var i = 1; i < values.length; i++) {
    var r = values[i];
    if (r.join('').trim() === '') continue;
    var o = {};
    headers.forEach(function (h, idx) { if (h) o[h] = r[idx]; });
    rows.push(o);
  }
  return { headers: headers, rows: rows };
}

function doGet(e) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var tables = {};
  READ_TABS.forEach(function (name) { tables[name] = readTab_(ss, name); });
  return json_({ ok: true, tables: tables, updatedAt: new Date().toISOString() });
}

// เพิ่มแถวโดยจับคู่ตามชื่อหัวคอลัมน์ (ทนต่อการสลับลำดับคอลัมน์)
function appendByHeader_(sh, obj) {
  var lastCol = sh.getLastColumn();
  var headers = sh.getRange(1, 1, 1, lastCol).getValues()[0].map(function (h) { return String(h).trim(); });
  var row = headers.map(function (h) { return Object.prototype.hasOwnProperty.call(obj, h) ? obj[h] : ''; });
  sh.appendRow(row);
}

// ออกเลข Req NO: ST26 + ddmmyy + '-' + running 3 หลัก (รีเซ็ตต่อวัน)
function nextReqNo_(ss) {
  var prefix = 'ST26' + Utilities.formatDate(new Date(), TZ, 'ddMMyy');
  var sh = ss.getSheetByName('Requisition');
  var count = 0;
  if (sh && sh.getLastRow() > 1) {
    var headers = sh.getRange(1, 1, 1, sh.getLastColumn()).getValues()[0].map(function (h) { return String(h).trim(); });
    var idx = headers.indexOf('Req NO');
    if (idx >= 0) {
      var col = sh.getRange(2, idx + 1, sh.getLastRow() - 1, 1).getValues();
      col.forEach(function (r) { if (String(r[0]).indexOf(prefix) === 0) count++; });
    }
  }
  return prefix + '-' + ('00' + (count + 1)).slice(-3);
}

function uid8_() {
  return Utilities.getUuid().replace(/-/g, '').slice(0, 8);
}

// POST { action:'movement', data:{ status, by, vendor, lines:[{itemId, amount}] } }
function doPost(e) {
  var body = {};
  try { body = JSON.parse(e.postData.contents); } catch (err) { body = {}; }
  if (body.action !== 'movement') return json_({ ok: false, error: 'unknown action' });

  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var d = body.data || {};
  var status = d.status === 'Stock In' ? 'Stock In' : 'Stock Out';
  var sign = status === 'Stock Out' ? -1 : 1;
  var reqNo = nextReqNo_(ss);
  var now = new Date();

  // 1) หัวใบ Requisition
  appendByHeader_(ss.getSheetByName('Requisition'), {
    'Req NO': reqNo, 'Date': now, 'Status': status,
    'By': d.by || '', 'Vendors': d.vendor || '', 'remark': '',
  });

  // 2) รายการ Inventory (พร้อม Movement +/-)
  var invSheet = ss.getSheetByName('Inventory');
  var lines = d.lines || [];
  lines.forEach(function (ln) {
    var amt = Number(ln.amount) || 0;
    appendByHeader_(invSheet, {
      'Inventory ID': uid8_(),
      'Req NO': reqNo,
      'Item ID': ln.itemId,
      'Date': now,
      'Amount': amt,
      'Movement': sign * amt,
    });
  });

  return json_({ ok: true, reqNo: reqNo, count: lines.length });
}
