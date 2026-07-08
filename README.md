# Store PP26 — ระบบเบิก-คืนทรัพย์สินหน้างานก่อสร้าง

เว็บแอปจัดการสโตร์อุปกรณ์และวัสดุงานก่อสร้าง สร้างจากดีไซน์ต้นแบบ Claude Design
(`project/Store PP26.dc.html`) แล้วนำมาทำเป็นแอปจริงด้วย **React + Vite**

## ฟีเจอร์

- **ภาพรวมสต็อก** — สรุปจำนวนวัสดุสิ้นเปลือง, ทรัพย์สินแยกตามประเภท/สถานะ (พร้อมเบิก / ใช้งานอยู่ / ส่งซ่อม / ชำรุด / หาย) และวัสดุที่ควรเบิกเติม
- **เบิกของ** — เบิกหลายรายการต่อครั้ง ผสมทรัพย์สิน + วัสดุสิ้นเปลืองได้ แนบรูปหลักฐาน (บังคับ)
- **คืนของ** — คืนหลายชิ้นพร้อมระบุสภาพ (ปกติ / ส่งซ่อม / ชำรุด) พร้อมรูปหลักฐาน
- **ติดตามทรัพย์สิน** — ค้นหาว่าทรัพย์สินแต่ละชิ้นอยู่กับใคร หน่วยงานใด สถานะอะไร
- **รายงานสรุป** — เบิกมากสุดตามคน/งาน, สรุปรายวัน, ประวัติการเบิก-คืนทั้งหมด
- **รับเข้า/คืนสโตร์กลาง** — ติดตามใบขอใช้ (received/remaining ต่อรายการ), บันทึกรับเข้า (ตัดสต็อกอัตโนมัติ), และการส่งคืนเศษเหล็ก (รอใบส่งคืน)
- **ผู้ดูแลสโตร์** — อนุมัติ/ปฏิเสธคำขอ และจัดการข้อมูลหลัก (วัสดุ / ทรัพย์สิน / พนักงาน) พร้อมอัปโหลดรูปแต่ละรายการ
- สลับมุมมอง **Staff / Store (ผู้ดูแล)** ได้

## การเก็บข้อมูล

- ข้อมูลถูกบันทึกใน **localStorage** ของเบราว์เซอร์ → รีเฟรชแล้วไม่หาย
- เชื่อม **Google Sheet** (ฟรี ผ่าน Google Apps Script) เพื่อแชร์ข้อมูลข้ามเครื่องได้ —
  ดูวิธีตั้งค่าใน [`google-sheet/README.md`](./google-sheet/README.md)
- เริ่มต้นด้วยข้อมูลจำลอง (mock data) ตามที่ตกลงในแชทออกแบบ

## รันในเครื่อง

```bash
npm install
npm run dev        # เปิด dev server (http://localhost:5173)
npm run build      # build ไปที่ dist/
npm run preview    # ดู build ที่ build แล้ว
```

## Deploy ฟรี

`npm run build` จะได้โฟลเดอร์ `dist/` เป็นไฟล์ static ล้วน อัปขึ้นได้ทั้ง
GitHub Pages / Netlify / Vercel (ตั้ง `base: './'` ไว้แล้วจึงวางที่ subpath ใดก็ได้)

## โครงสร้างโปรเจกต์

```
index.html              จุดเริ่ม (โหลดฟอนต์ + mount React)
src/
  main.jsx              entry
  App.jsx               โครง layout: sidebar + สลับหน้า + toast
  lib/
    seed.js             ข้อมูลเริ่มต้น (ตรงกับต้นแบบ) + helper
    theme.js            design tokens + style helper (พอร์ตจากต้นแบบ)
    useStore.js         state + action + ค่าที่คำนวณ (พอร์ตจาก renderVals)
    storage.js          localStorage + Google Sheet sync
  components/           Thumb, PhotoDropzone, SheetSettings, ui.js
  pages/                Dashboard, Request, Return, Tracker, Reports, Central, Admin
google-sheet/           โค้ด + วิธีตั้งค่า Google Apps Script backend
project/                ไฟล์ดีไซน์ต้นฉบับจาก Claude Design
chats/                  บทสนทนาการออกแบบ
```
