// ────────────────────────────────────────────────────────────────────────────
//  ลิงก์ Google Sheet (Web App /exec) — ใส่ที่เดียวตรงนี้
// ────────────────────────────────────────────────────────────────────────────
export const SHEET_ENDPOINT = 'https://script.google.com/macros/s/AKfycby3xsz3yJNcrTXp7m49iHyRi5T9v9zwMXXcHVU4bqU-yor85aUh4t8VXjyrxwP_2wAl/exec';

// ชื่อแท็บใน Google Sheet (ชุดเดียวกับ AppSheet)
export const TABS = {
  item: 'Item',
  staff: 'Staff',
  store: 'Store',
  requisition: 'Requisition',
  inventory: 'Inventory',
};

// หัวคอลัมน์ที่แอปใช้ (แก้ให้ตรงกับ Sheet ได้)
export const COLS = {
  // Item
  itemId: 'Item ID', itemName: 'Name', itemUnit: 'Description', itemStock: 'Stock', itemCat: 'Category',
  // Staff  (key = ID; โชว์ชื่อเล่นใน dropdown)
  staffId: 'ID', staffName: 'ชื่อ', staffNick: 'ชื่อเล่น',
  // Store (key = ID, Name)
  storeId: 'ID', storeName: 'Name',
};

// คอลัมน์เทคนิคที่ไม่ต้องโชว์ในตารางแบบ dynamic
export const HIDDEN_COLS = ['_RowNumber', 'Image', 'รูป', 'photo', 'remark'];
