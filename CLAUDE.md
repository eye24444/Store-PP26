# CLAUDE.md — บันทึกโปรเจกต์ Store PP26

> อ่านไฟล์นี้ก่อนเริ่มงาน จะได้เข้าใจโปรเจกต์เร็วโดยไม่ต้องไล่อ่านทุกไฟล์
> (This file is a quick brief so a fresh session gets up to speed without scanning the whole repo.)

## โปรเจกต์นี้คืออะไร
เว็บแอปจัดการสโตร์อุปกรณ์/วัสดุงานก่อสร้าง ชื่อ **Store PP26** — เบิก/คืน, ติดตามทรัพย์สิน,
รับของเข้า, รายงาน, จัดการข้อมูลหลัก แปลงมาจาก prototype ของ Claude Design
(`project/Store PP26.dc.html`) มาเป็นแอปจริง UI ภาษาไทย ธีมมืด สีหลักส้ม `#f5a623`

## Stack
- **React 18 + Vite** (ไม่มี TypeScript), inline styles เป็นหลัก
- ไม่มี backend server — เป็น static SPA เก็บข้อมูลใน **localStorage**
- Sync ข้ามเครื่องผ่าน **Google Apps Script + Google Sheet** (โค้ดใน `google-sheet/Code.gs`)
- Deploy: **GitHub Actions → GitHub Pages** (`.github/workflows/deploy.yml`)
  - repo: `github.com/eye24444/Store-PP26` · เว็บ: `eye24444.github.io/Store-PP26`

## คำสั่ง
```bash
npm install      # ติดตั้ง
npm run dev      # dev server (localhost:5173)
npm run build    # build ไป dist/
npm run preview  # ดู build
```
Deploy อัตโนมัติเมื่อ push ขึ้น branch `main` (ผู้ใช้มักอัปไฟล์ผ่านหน้าเว็บ GitHub upload)

## โครงสร้างไฟล์
```
index.html                หน้าเริ่ม (โหลดฟอนต์ Noto Sans Thai/Inter, ชื่อแท็บ)
src/main.jsx              entry
src/App.jsx               โครงรวม: sidebar/มือถือ-drawer, สลับหน้า, toast, PIN gate, สลับ role
src/lib/
  seed.js                 ข้อมูลตั้งต้น (staff/consumables/assets/...) + DATA_KEYS (คีย์ที่ persist/sync)
  theme.js                STATUS_META, สี, style helper ปุ่ม, thumb/photo styles
  useStore.js             *** สมองของแอป *** state + actions + deriveVals (คล้าย renderVals เดิม)
                          + auto pull/push Google Sheet
  useIsMobile.js          hook ตรวจจอมือถือ
  storage.js              localStorage + Google Sheet fetch (push/pull) + admin PIN
src/components/           Thumb, PhotoDropzone, ScrollX, SheetSettings, PinModal, ui.js
src/pages/                Dashboard, Request(เบิก), Return(คืน), Tracker(ติดตาม),
                          Reports(รายงาน), GoodsIn(รับของเข้า), Central(รับเข้า/คืนสโตร์กลาง), Admin
google-sheet/Code.gs      Apps Script backend (เขียนตารางอ่านง่าย + JSON snapshot ใน _data)
google-sheet/README.md    วิธีตั้งค่า Web App
project/, chats/          ไฟล์ต้นฉบับดีไซน์จาก Claude Design (อย่าแก้ ใช้อ้างอิง)
```

## สถาปัตยกรรม state (สำคัญ)
- `useStore()` ถือ state ก้อนเดียว, `set(patch)` รองรับทั้ง object และ updater function
- **action methods** = พอร์ต 1:1 จาก class ใน prototype เดิม (approve, submitRequest, addAsset, submitReceipt, ...)
- **deriveVals()** = คำนวณค่าที่ UI ใช้ (เหมือน renderVals เดิม) — หน้าเพจอ่านจาก `vals`
- แต่ละหน้ารับ prop `vals`; ใช้ `vals.s` (state ดิบ), `vals.api` (actions), `vals.setState`

## ข้อมูล & Sync
- `DATA_KEYS` ใน seed.js = คีย์ข้อมูลจริงที่ persist: staff, consumables, assets, pending,
  transactions, requisitions, deliveries, scrapReturns, receipts
- localStorage เก็บอัตโนมัติทุกครั้งที่ state เปลี่ยน
- ถ้าตั้งค่า Sheet URL (ปุ่ม ⚙️ เชื่อม Google Sheet): auto-**pull ตอนเปิดแอป** + auto-**push (debounce 2.5s)** เมื่อแก้
- Apps Script เขียน 2 อย่าง: (1) JSON เต็มใน sheet `_data!A1` (ใช้ pull) (2) ตารางอ่านง่ายแยกแท็บ
  โดย import กลับได้เฉพาะ 3 แท็บหลัก: พนักงาน/วัสดุสิ้นเปลือง/ทรัพย์สิน (ดู IMPORT_KEYS)

## ฟีเจอร์ที่ควรรู้
- **Role**: Staff (ดู+ส่งคำขอ) / Store=admin (อนุมัติ+จัดการ). เข้าโหมด Store ต้องใส่ **PIN 4 หลัก**
  (ค่าเริ่มต้น `2626`, เก็บใน localStorage ต่อเครื่อง, เปลี่ยนได้ใน PinModal). role รีเซ็ตเป็น staff เมื่อรีโหลด
- **เบิก/คืน** เป็นตะกร้าหลายรายการ ต้องแนบรูปก่อนส่ง → เข้าคิว pending → admin อนุมัติ → ตัด/คืนสต็อก
- **รับของเข้า (GoodsIn)**: เพิ่มวัสดุ (เพิ่ม qty) หรือทรัพย์สิน (สร้างชิ้นใหม่พร้อมออกรหัส) + ประวัติ
- **Central**: ใบขอใช้จากสโตร์กลาง (received/remaining) + ส่งคืนเศษเหล็ก (รอใบส่งคืน)
- รูปภาพเก็บเป็น base64 (ระวังชนลิมิต ~50k ตัวอักษร/เซลล์ ถ้า sync ขึ้น Sheet มากๆ)

## จุดที่มักแก้
- สีหลัก/สถานะ → `src/lib/theme.js` (และ `#1e2430`/`#262c38` กระจายใน inline styles)
- พื้นหลัง/ฟอนต์ → `src/styles/global.css` (+ `src/App.jsx`)
- ข้อมูลตั้งต้น → `src/lib/seed.js`
- ตรรกะ/ฟีเจอร์ → `src/lib/useStore.js`

## ข้อควรระวัง
- แก้แล้วต้อง build ผ่าน (`npm run build`) และควรทดสอบด้วย Playwright (ตัวอย่างเทสต์เคยรันที่ viewport 390px/มือถือ)
- ราคาสี/ธีมมาจาก prototype เดิม — คงโทนเดิมไว้เมื่อแก้ UI
- อย่าแก้ไฟล์ใน `project/` และ `chats/` (เป็นต้นฉบับดีไซน์)
