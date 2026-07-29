/**
 * Store PP26 — Google Sheet backend v2 (read-live viewer + request intake)
 *
 * โมเดลใหม่: Google Sheet = ฐานข้อมูลจริง (แก้ใน Sheet หรือ AppSheet)
 *   - doGet  : ส่งข้อมูลทุกแท็บให้เว็บแอป "อ่านสด" (รองรับคอลัมน์ที่เพิ่มเองด้วย)
 *   - doPost : รับคำขอเบิกจากฟอร์มในแอป มาต่อท้ายแท็บ "คำขอเบิก"
 *
 * แท็บที่ควรมี (สร้างเองใน Google Sheet ได้เลย ใส่หัวคอลัมน์แถวแรก):
 *   - วัสดุสิ้นเปลือง : รหัส | รายการ | หมวด | หน่วย | คงเหลือ | ขั้นต่ำ | (เพิ่มคอลัมน์เองได้)
 *   - ทรัพย์สิน       : รหัส | ประเภท | รุ่น/ยี่ห้อ | สถานะ | ผู้ถือ | หน่วยงาน | งาน | Cost Code | วันที่เบิก | (เพิ่มได้)
 *   - พนักงาน         : ชื่อ | เบอร์โทร | ตำแหน่ง | (เพิ่มได้)
 *   - คำขอเบิก        : สคริปต์สร้าง/เติมให้อัตโนมัติเมื่อมีคนส่งฟอร์ม
 *
 * SETUP: วางโค้ดนี้ใน Extensions → Apps Script แล้ว Deploy เป็น Web App
 *        (Execute as: Me, Who has access: Anyone) คัดลอก URL /exec ไปใส่ในแอป
 */

// แท็บที่เปิดให้เว็บแอปอ่าน (เพิ่ม/แก้ชื่อได้ตามต้องการ)
var READ_TABS = ['วัสดุสิ้นเปลือง', 'ทรัพย์สิน', 'พนักงาน', 'คำขอเบิก'];
var REQUEST_TAB = 'คำขอเบิก';
var REQUEST_HEADERS = ['วันที่-เวลา', 'ผู้เบิก', 'เบอร์โทร', 'รายการที่ขอ', 'จำนวน', 'ใช้ในงาน', 'Cost Code', 'หมายเหตุ', 'สถานะ'];

function json_(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}

// อ่านทั้งแท็บเป็น { headers:[...], rows:[{หัวคอลัมน์: ค่า}, ...] }
function readTab_(ss, name) {
  var sh = ss.getSheetByName(name);
  if (!sh) return { headers: [], rows: [] };
  var values = sh.getDataRange().getDisplayValues(); // getDisplayValues = ได้ข้อความตามที่เห็น (วันที่ไม่เพี้ยน)
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

// GET -> ส่งข้อมูลทุกแท็บ
function doGet(e) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var tables = {};
  READ_TABS.forEach(function (name) { tables[name] = readTab_(ss, name); });
  return json_({ ok: true, tables: tables, updatedAt: new Date().toISOString() });
}

// POST { action:'request', data:{ name, phone, lines:[{item, qty}], job, costCode, note } }
function doPost(e) {
  var body = {};
  try { body = JSON.parse(e.postData.contents); } catch (err) { body = {}; }

  if (body.action === 'request') {
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var sh = ss.getSheetByName(REQUEST_TAB) || ss.insertSheet(REQUEST_TAB);
    if (sh.getLastRow() === 0) {
      sh.appendRow(REQUEST_HEADERS);
      sh.getRange(1, 1, 1, REQUEST_HEADERS.length).setFontWeight('bold').setBackground('#2a303c').setFontColor('#ffffff');
      sh.setFrozenRows(1);
    }
    var d = body.data || {};
    var when = new Date();
    var lines = (d.lines && d.lines.length) ? d.lines : [{ item: d.items || '', qty: d.qty || '' }];
    lines.forEach(function (ln) {
      sh.appendRow([when, d.name || '', d.phone || '', ln.item || '', ln.qty || '', d.job || '', d.costCode || '', d.note || '', 'รออนุมัติ']);
    });
    return json_({ ok: true, count: lines.length });
  }
  return json_({ ok: false, error: 'unknown action' });
}
