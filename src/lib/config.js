// ────────────────────────────────────────────────────────────────────────────
//  ตั้งค่าลิงก์ Google Sheet (Web App) ตรงนี้ที่เดียว
//
//  วางลิงก์ที่ลงท้ายด้วย /exec ที่ได้จากตอน Deploy Apps Script ลงในเครื่องหมาย ''
//  ด้านล่าง แล้วอัปโค้ดขึ้น GitHub — ทุกคนที่เปิดเว็บจะเห็นข้อมูลทันที (ไม่ต้องล็อกอิน)
//
//  ตัวอย่าง:
//  export const SHEET_ENDPOINT = 'https://script.google.com/macros/s/AKfy..../exec';
// ────────────────────────────────────────────────────────────────────────────
export const SHEET_ENDPOINT = 'https://script.google.com/macros/s/AKfycby3xsz3yJNcrTXp7m49iHyRi5T9v9zwMXXcHVU4bqU-yor85aUh4t8VXjyrxwP_2wAl/exec';

// ชื่อแท็บใน Google Sheet (แก้ให้ตรงกับที่ตั้งใน Sheet ได้)
export const TABS = {
  consumables: 'วัสดุสิ้นเปลือง',
  assets: 'ทรัพย์สิน',
  staff: 'พนักงาน',
  requests: 'คำขอเบิก',
};

// หัวคอลัมน์ที่แอปใช้ทำสรุป (ถ้าใน Sheet ใช้ชื่ออื่น แก้ตรงนี้ให้ตรง)
export const COLS = {
  // วัสดุสิ้นเปลือง
  cName: 'รายการ', cCode: 'รหัส', cCat: 'หมวด', cUnit: 'หน่วย', cQty: 'คงเหลือ', cMin: 'ขั้นต่ำ',
  // ทรัพย์สิน
  aCode: 'รหัส', aCat: 'ประเภท', aName: 'รุ่น/ยี่ห้อ', aStatus: 'สถานะ',
  aHolder: 'ผู้ถือ', aSite: 'หน่วยงาน', aJob: 'งาน', aCost: 'Cost Code', aDate: 'วันที่เบิก',
  // พนักงาน
  sName: 'ชื่อ', sPhone: 'เบอร์โทร', sPosition: 'ตำแหน่ง',
};

// เก็บคอลัมน์เทคนิคที่ไม่ต้องโชว์ในตาราง
export const HIDDEN_COLS = ['ID', 'id', 'รูป', 'photo', 'ผู้ถือ (ID)', 'ผู้ขอ (ID)'];
