import React, { useState, useEffect } from "react";
import {
  LayoutGrid, Package, Wrench, ArrowLeftRight, Search, FileBarChart,
  Sun, Moon, Languages, AlertTriangle, CheckCircle2, Clock, XCircle,
  ChevronRight, X, User, MapPin, Hash, Calendar, ArrowDownToLine,
  ArrowUpFromLine, TrendingUp, Bell, Upload, Image as ImageIcon, Download
} from "lucide-react";
import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  LineChart, Line, PieChart, Pie, Cell,
} from "recharts";

/* ---------------------------------------------------------------
   TOKENS & STYLING
------------------------------------------------------------------*/
const T = {
  dark: {
    bg: "#12161B", panel: "#1B2129", panel2: "#222A33", line: "#2C3540",
    text: "#EDEFF2", sub: "#8E99A6", accent: "#F5A623", accent2: "#E0891A",
    ok: "#4CC38A", warn: "#F5A623", bad: "#E6555A", info: "#5B8CC9",
  },
  light: {
    bg: "#F1EFEA", panel: "#FFFFFF", panel2: "#F6F4EF", line: "#DEDAD1",
    text: "#1B2129", sub: "#5B6470", accent: "#C9700E", accent2: "#A85C0A",
    ok: "#2F9C6B", warn: "#C9700E", bad: "#C23B40", info: "#2E5F94",
  },
};

const DISPLAY = "'Oswald','Barlow Condensed',sans-serif";
const BODY = "'Inter','Helvetica Neue',sans-serif";

const I18N = {
  en: {
    dashboard: "Dashboard", inventory: "Inventory", assets: "Assets", borrow: "Borrow/Return",
    tracking: "Search", reports: "Reports", totalStock: "Total Stock", available: "Available",
    inUse: "In Use", damaged: "Damaged", repair: "Repair", lowStock: "Low Stock",
    pending: "Pending", daily: "Today", weekly: "Weekly", monthly: "Monthly",
    reorderRequired: "Reorder Required", searchPlaceholder: "Search asset, name, employee…",
    currentHolder: "Current Holder", location: "Location", status: "Status", borrowed: "Date",
    role: "Role", exportExcel: "Export", newRequest: "New Request", requests: "Requests",
    submitRequest: "Submit", approve: "Approve", reject: "Reject", issue: "Issue",
    returnAsset: "Return", requestRepair: "Request Repair", uploadProof: "Upload Proof",
    selectImage: "Select Image", noImage: "No image", transactions: "Transactions",
    transactionHistory: "History", proofImage: "Proof", notes: "Notes",
  },
  th: {
    dashboard: "แดชบอร์ด", inventory: "คลังพัสดุ", assets: "ทรัพย์สิน", borrow: "ยืม/คืน",
    tracking: "ค้นหา", reports: "รายงาน", totalStock: "รายการคงคลัง", available: "พร้อมใช้",
    inUse: "กำลังใช้งาน", damaged: "ชำรุด", repair: "ซ่อม", lowStock: "สต็อกต่ำ",
    pending: "ค้างอนุมัติ", daily: "วันนี้", weekly: "สัปดาห์", monthly: "เดือน",
    reorderRequired: "ต้องสั่งซื้อ", searchPlaceholder: "ค้นหาทรัพย์สิน ชื่อ พนักงาน…",
    currentHolder: "ผู้ถือปัจจุบัน", location: "ตำแหน่ง", status: "สถานะ", borrowed: "วันที่",
    role: "บทบาท", exportExcel: "ส่งออก", newRequest: "ยืมใหม่", requests: "คำขอ",
    submitRequest: "ยืน", approve: "อนุมัติ", reject: "ปฏิเสธ", issue: "นำออก",
    returnAsset: "คืน", requestRepair: "ขอซ่อม", uploadProof: "อัปโหลดหลักฐาน",
    selectImage: "เลือกรูป", noImage: "ไม่มีรูป", transactions: "ธุรกรรม",
    transactionHistory: "ประวัติ", proofImage: "หลักฐาน", notes: "หมายเหตุ",
  },
};

/* ---------------------------------------------------------------
   MOCK DATA
------------------------------------------------------------------*/
const CONSUMABLES = [
  { code: "CN-001", name: "Cutting Gloves (L)", cat: "Safety", unit: "pair", qty: 84, min: 50, supplier: "SiamSafe" },
  { code: "CN-002", name: "Grinding Disc 4\"", cat: "Disc", unit: "pcs", qty: 22, min: 30, supplier: "Bosch" },
  { code: "CN-003", name: "Welding Rod E6013", cat: "Weld", unit: "kg", qty: 145, min: 60, supplier: "Kobelco" },
  { code: "CN-004", name: "Wire Ties 4mm", cat: "Ties", unit: "roll", qty: 9, min: 15, supplier: "Local" },
  { code: "CN-005", name: "Release Oil", cat: "Chem", unit: "L", qty: 60, min: 40, supplier: "ChemCo" },
  { code: "CN-006", name: "Rebar Spacer 25mm", cat: "Concrete", unit: "pcs", qty: 1200, min: 500, supplier: "ConForm" },
];

const ASSETS = [
  { id: "JH-001", name: "Jack Hammer 1000W", brand: "Hilti", status: "In Use", holder: "Mr. Somchai", area: "Base Slab A", cost: "CC-101", date: "2026-07-01" },
  { id: "JH-002", name: "Jack Hammer 1000W", brand: "Hilti", status: "In Use", holder: "Mr. Anan", area: "Base Slab B", cost: "CC-101", date: "2026-07-02" },
  { id: "JH-003", name: "Jack Hammer 1000W", brand: "Hilti", status: "Available", holder: "-", area: "Central Store", cost: "-", date: "-" },
  { id: "TS-001", name: "Total Station", brand: "Topcon", status: "In Use", holder: "Eng. Preecha", area: "Survey", cost: "CC-050", date: "2026-07-05" },
  { id: "WM-001", name: "Welding Machine 300A", brand: "Lincoln", status: "In Use", holder: "Mr. Kittisak", area: "Steel Bay", cost: "CC-204", date: "2026-07-03" },
  { id: "AG-001", name: "Angle Grinder", brand: "Makita", status: "In Use", holder: "Mr. Wichai", area: "Formwork C", cost: "CC-101", date: "2026-07-04" },
];

const REQUESTS = [
  { id: "RQ-118", item: "Angle Grinder", by: "Mr. Somsak", qty: 1, status: "Pending", date: "2026-07-07", image: null },
  { id: "RQ-117", item: "Grinding Disc 4\"", by: "Mr. Wichai", qty: 20, status: "Pending", date: "2026-07-07", image: null },
  { id: "RQ-116", item: "Total Station", by: "Eng. Preecha", qty: 1, status: "Approved", date: "2026-07-06", image: null },
];

const WEEKLY = [
  { day: "Mon", tx: 34 }, { day: "Tue", tx: 41 }, { day: "Wed", tx: 28 },
  { day: "Thu", tx: 52 }, { day: "Fri", tx: 47 }, { day: "Sat", tx: 19 }, { day: "Sun", tx: 6 },
];

const STATUS_COLOR = (s, c) => ({
  "Available": c.ok, "In Use": c.info, "Repair": c.warn, Damaged: c.bad, Lost: c.bad,
}[s] || c.sub);

const ROLES = ["Admin", "Store Keeper", "Manager", "User"];

/* ---------------------------------------------------------------
   UI COMPONENTS
------------------------------------------------------------------*/
function Chip({ children, color }) {
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: 5, padding: "3px 9px",
      borderRadius: 999, fontSize: 11.5, fontWeight: 600, letterSpacing: 0.2,
      color: color, background: color + "1E", border: `1px solid ${color}55`,
      fontFamily: BODY, whiteSpace: "nowrap",
    }}>
      <span style={{ width: 6, height: 6, borderRadius: 999, background: color }} />
      {children}
    </span>
  );
}

function StatCard({ label, value, icon: Icon, c, tint }) {
  return (
    <div style={{
      background: c.panel, border: `1px solid ${c.line}`, borderRadius: 10,
      padding: "14px 14px 12px", flex: "1 1 130px", minWidth: 130, position: "relative", overflow: "hidden",
    }}>
      <div style={{ position: "absolute", top: 0, left: 0, width: 4, height: "100%", background: tint || c.accent }} />
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div style={{ fontSize: 11, color: c.sub, fontFamily: BODY, textTransform: "uppercase", letterSpacing: 0.6, fontWeight: 600 }}>{label}</div>
        {Icon && <Icon size={15} color={tint || c.accent} />}
      </div>
      <div style={{ fontFamily: DISPLAY, fontSize: 28, color: c.text, marginTop: 4, lineHeight: 1 }}>{value}</div>
    </div>
  );
}

function SectionTitle({ children, c }) {
  return (
    <h2 style={{
      fontFamily: DISPLAY, fontSize: 15, letterSpacing: 1.2, textTransform: "uppercase",
      color: c.text, margin: "22px 0 10px", fontWeight: 500,
    }}>{children}</h2>
  );
}

function SearchBar({ c, value, onChange, placeholder }) {
  return (
    <div style={{
      display: "flex", alignItems: "center", gap: 8, background: c.panel,
      border: `1px solid ${c.line}`, borderRadius: 10, padding: "9px 12px",
    }}>
      <Search size={16} color={c.sub} />
      <input
        value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder}
        style={{
          border: "none", outline: "none", background: "transparent", color: c.text,
          fontFamily: BODY, fontSize: 13.5, flex: 1,
        }}
      />
      {value && <X size={15} color={c.sub} style={{ cursor: "pointer" }} onClick={() => onChange("")} />}
    </div>
  );
}

function ImageUploadField({ c, onImageSelect, previewUrl }) {
  return (
    <div style={{ marginTop: 10 }}>
      <div style={{ fontSize: 11, color: c.sub, fontFamily: BODY, marginBottom: 6, fontWeight: 600, textTransform: "uppercase", letterSpacing: 0.4 }}>
        Upload Proof Image
      </div>
      <label style={{
        display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
        padding: "12px", borderRadius: 8, border: `2px dashed ${c.line}`, cursor: "pointer",
        background: c.panel2,
      }}>
        <Upload size={16} color={c.accent} />
        <span style={{ fontFamily: BODY, fontSize: 13, color: c.text }}>Choose Image</span>
        <input type="file" accept="image/*" onChange={e => {
          const file = e.target.files[0];
          if (file) {
            const reader = new FileReader();
            reader.onload = (evt) => onImageSelect(evt.target.result);
            reader.readAsDataURL(file);
          }
        }} style={{ display: "none" }} />
      </label>
      {previewUrl && (
        <div style={{ marginTop: 8, position: "relative" }}>
          <img src={previewUrl} style={{ width: "100%", height: 140, borderRadius: 8, objectFit: "cover", border: `1px solid ${c.line}` }} alt="preview" />
          <button onClick={() => onImageSelect(null)} style={{
            position: "absolute", top: 4, right: 4, width: 28, height: 28,
            borderRadius: 6, background: "#00000099", border: "none", cursor: "pointer",
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            <X size={16} color="#fff" />
          </button>
        </div>
      )}
    </div>
  );
}

function ImageViewer({ image, c, onClose }) {
  if (!image) return null;
  return (
    <div style={{
      position: "fixed", inset: 0, background: "#00000088", zIndex: 50,
      display: "flex", alignItems: "center", justifyContent: "center",
    }} onClick={onClose}>
      <div onClick={e => e.stopPropagation()} style={{
        position: "relative", maxWidth: "90vw", maxHeight: "90vh",
      }}>
        <img src={image} style={{ maxWidth: "100%", maxHeight: "100%", borderRadius: 12 }} alt="proof" />
        <button onClick={onClose} style={{
          position: "absolute", top: 10, right: 10, width: 36, height: 36,
          borderRadius: 8, background: "#00000099", border: "none", cursor: "pointer",
          display: "flex", alignItems: "center", justifyContent: "center",
        }}>
          <X size={20} color="#fff" />
        </button>
      </div>
    </div>
  );
}

/* ---------------------------------------------------------------
   SCREENS
------------------------------------------------------------------*/
function Dashboard({ c, t }) {
  const lowStock = CONSUMABLES.filter(i => i.qty <= i.min);
  const avail = ASSETS.filter(u => u.status === "Available").length;
  const inUse = ASSETS.filter(u => u.status === "In Use").length;
  const damage = ASSETS.filter(u => u.status === "Damaged").length;
  const repair = ASSETS.filter(u => u.status === "Repair").length;

  return (
    <div>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
        <StatCard c={c} label={t.totalStock} value={ASSETS.length + CONSUMABLES.length} icon={Package} />
        <StatCard c={c} label={t.available} value={avail} icon={CheckCircle2} tint={c.ok} />
        <StatCard c={c} label={t.inUse} value={inUse} icon={Clock} tint={c.info} />
        <StatCard c={c} label={t.repair} value={repair} icon={Wrench} tint={c.warn} />
        <StatCard c={c} label={t.lowStock} value={lowStock.length} icon={AlertTriangle} tint={c.bad} />
      </div>

      {lowStock.length > 0 && (
        <div style={{
          marginTop: 16, background: c.warn + "16", border: `1px solid ${c.warn}55`,
          borderRadius: 10, padding: "12px 14px", display: "flex", gap: 10,
        }}>
          <AlertTriangle size={18} color={c.warn} style={{ flexShrink: 0 }} />
          <div>
            <div style={{ fontFamily: DISPLAY, fontSize: 13, color: c.text }}>{t.reorderRequired}</div>
            <div style={{ fontSize: 11.5, color: c.sub, marginTop: 2 }}>
              {lowStock.map(i => i.name).join(" · ")}
            </div>
          </div>
        </div>
      )}

      <SectionTitle c={c}>{t.weekly}</SectionTitle>
      <div style={{ background: c.panel, border: `1px solid ${c.line}`, borderRadius: 10, padding: "12px 8px", height: 180 }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={WEEKLY}>
            <CartesianGrid stroke={c.line} vertical={false} />
            <XAxis dataKey="day" stroke={c.sub} fontSize={11} tickLine={false} axisLine={{ stroke: c.line }} />
            <YAxis stroke={c.sub} fontSize={11} tickLine={false} axisLine={false} width={28} />
            <Tooltip contentStyle={{ background: c.panel2, border: `1px solid ${c.line}`, borderRadius: 8 }} />
            <Bar dataKey="tx" fill={c.accent} radius={[3, 3, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <SectionTitle c={c}>{t.pending}</SectionTitle>
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {REQUESTS.filter(r => r.status === "Pending").map(r => (
          <div key={r.id} style={{
            background: c.panel, border: `1px solid ${c.line}`, borderRadius: 10, padding: "10px 12px",
            display: "flex", justifyContent: "space-between", alignItems: "center",
          }}>
            <div>
              <div style={{ fontFamily: BODY, fontWeight: 600, fontSize: 13.5, color: c.text }}>{r.item}</div>
              <div style={{ fontSize: 11.5, color: c.sub }}>{r.id} · {r.by}</div>
            </div>
            <Chip color={c.warn}>{r.status}</Chip>
          </div>
        ))}
      </div>
    </div>
  );
}

function Inventory({ c, t }) {
  const [q, setQ] = useState("");
  const filtered = CONSUMABLES.filter(i =>
    (i.name + i.code + i.cat).toLowerCase().includes(q.toLowerCase())
  );

  return (
    <div>
      <SearchBar c={c} value={q} onChange={setQ} placeholder="Search item…" />
      <div style={{ display: "flex", flexDirection: "column", gap: 8, marginTop: 12 }}>
        {filtered.map(i => {
          const low = i.qty <= i.min;
          const pct = Math.min(100, (i.qty / (i.min * 2)) * 100);
          return (
            <div key={i.code} style={{ background: c.panel, border: `1px solid ${c.line}`, borderRadius: 10, padding: 12 }}>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <div>
                  <div style={{ fontFamily: BODY, fontWeight: 600, fontSize: 14, color: c.text }}>{i.name}</div>
                  <div style={{ fontSize: 11.5, color: c.sub }}>{i.code} · {i.supplier}</div>
                </div>
                {low && <Chip color={c.bad}>{t.reorderRequired}</Chip>}
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginTop: 9 }}>
                <div style={{ fontFamily: DISPLAY, fontSize: 18, color: c.text, minWidth: 50 }}>
                  {i.qty} <span style={{ fontSize: 11, color: c.sub }}>{i.unit}</span>
                </div>
                <div style={{ flex: 1, height: 6, borderRadius: 999, background: c.line, overflow: "hidden" }}>
                  <div style={{ width: `${pct}%`, height: "100%", background: low ? c.bad : c.ok }} />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function Assets({ c, t, onOpen }) {
  const [q, setQ] = useState("");
  const filtered = ASSETS.filter(a =>
    (a.id + a.name + a.holder).toLowerCase().includes(q.toLowerCase())
  );

  return (
    <div>
      <SearchBar c={c} value={q} onChange={setQ} placeholder="Search asset…" />
      <div style={{ display: "flex", flexDirection: "column", gap: 8, marginTop: 12 }}>
        {filtered.map(a => (
          <div key={a.id} onClick={() => onOpen(a)} style={{
            background: c.panel, border: `1px solid ${c.line}`, borderRadius: 10, padding: 12, cursor: "pointer",
          }}>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <div>
                <div style={{ fontFamily: BODY, fontWeight: 700, fontSize: 14, color: c.text }}>{a.id}</div>
                <div style={{ fontSize: 11.5, color: c.sub }}>{a.name}</div>
              </div>
              <Chip color={STATUS_COLOR(a.status, c)}>{a.status}</Chip>
            </div>
            {a.holder !== "-" && (
              <div style={{ fontSize: 11.5, color: c.sub, marginTop: 6 }}>
                {a.holder} · {a.area}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

function AssetDetail({ asset, c, t, onClose }) {
  if (!asset) return null;

  return (
    <div style={{
      position: "fixed", inset: 0, background: "#00000066", zIndex: 40,
      display: "flex", alignItems: "flex-end",
    }} onClick={onClose}>
      <div onClick={e => e.stopPropagation()} style={{
        background: c.panel, width: "100%", maxWidth: 480, borderRadius: "16px 16px 0 0",
        padding: 18, borderTop: `1px solid ${c.line}`, maxHeight: "80vh", overflowY: "auto",
      }}>
        <div style={{ width: 40, height: 4, borderRadius: 999, background: c.line, margin: "0 auto 14px" }} />
        <div style={{
          display: "flex", justifyContent: "space-between", alignItems: "flex-start",
          paddingBottom: 14, borderBottom: `1px solid ${c.line}`,
        }}>
          <div>
            <div style={{ fontFamily: DISPLAY, fontSize: 22, color: c.text }}>{asset.id}</div>
            <div style={{ fontSize: 12.5, color: c.sub }}>{asset.name}</div>
          </div>
          <Chip color={STATUS_COLOR(asset.status, c)}>{asset.status}</Chip>
        </div>

        <div style={{ marginTop: 14, display: "flex", flexDirection: "column", gap: 10 }}>
          <Row c={c} icon={User} label={t.currentHolder} value={asset.holder} />
          <Row c={c} icon={MapPin} label={t.location} value={asset.area} />
          <Row c={c} icon={Hash} label="Cost Code" value={asset.cost} />
          <Row c={c} icon={Calendar} label={t.borrowed} value={asset.date} />
        </div>

        <div style={{ display: "flex", gap: 8, marginTop: 16 }}>
          <button style={btnSolid(c)}>Return</button>
          <button style={btnGhost(c)}>Repair</button>
        </div>
      </div>
    </div>
  );
}

function Row({ c, icon: Icon, label, value }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
      <div style={{ width: 30, height: 30, borderRadius: 7, background: c.panel2, display: "flex", alignItems: "center", justifyContent: "center", border: `1px solid ${c.line}` }}>
        <Icon size={14} color={c.sub} />
      </div>
      <div>
        <div style={{ fontSize: 10.5, color: c.sub, fontWeight: 600, textTransform: "uppercase" }}>{label}</div>
        <div style={{ fontSize: 13.5, color: c.text, fontWeight: 600 }}>{value}</div>
      </div>
    </div>
  );
}

function BorrowReturn({ c, t, role }) {
  const [tab, setTab] = useState("new");
  const [item, setItem] = useState("");
  const [image, setImage] = useState(null);

  return (
    <div>
      <div style={{ display: "flex", gap: 6, marginBottom: 14 }}>
        {["new", "requests"].map(k => (
          <button key={k} onClick={() => setTab(k)} style={{
            ...btnGhost(c), flex: 1, background: tab === k ? c.accent : c.panel2,
            color: tab === k ? "#12161B" : c.text, border: tab === k ? "none" : `1px solid ${c.line}`,
          }}>{k === "new" ? t.newRequest : t.requests}</button>
        ))}
      </div>

      {tab === "new" ? (
        <div style={{ background: c.panel, border: `1px solid ${c.line}`, borderRadius: 10, padding: 14, display: "flex", flexDirection: "column", gap: 10 }}>
          <div>
            <div style={{ fontSize: 11, color: c.sub, fontWeight: 600, marginBottom: 4 }}>Item</div>
            <select onChange={e => setItem(e.target.value)} style={selectStyle(c)}>
              <option>Select item or asset</option>
              {ASSETS.filter(a => a.status === "Available").map(a => <option key={a.id}>{a.name}</option>)}
            </select>
          </div>
          <div>
            <div style={{ fontSize: 11, color: c.sub, fontWeight: 600, marginBottom: 4 }}>Purpose</div>
            <input style={inputStyle(c)} placeholder="Work description" />
          </div>
          <div>
            <div style={{ fontSize: 11, color: c.sub, fontWeight: 600, marginBottom: 4 }}>Employee</div>
            <input style={inputStyle(c)} placeholder="Name or ID" />
          </div>
          <ImageUploadField c={c} onImageSelect={setImage} previewUrl={image} />
          <button style={btnSolid(c)}>{t.submitRequest}</button>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {REQUESTS.map(r => (
            <div key={r.id} style={{ background: c.panel, border: `1px solid ${c.line}`, borderRadius: 10, padding: 12 }}>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <div>
                  <div style={{ fontWeight: 700, fontSize: 13.5, color: c.text }}>{r.item}</div>
                  <div style={{ fontSize: 11.5, color: c.sub }}>{r.id} · {r.by}</div>
                </div>
                <Chip color={r.status === "Pending" ? c.warn : c.ok}>{r.status}</Chip>
              </div>
              {r.image && (
                <div style={{ marginTop: 8 }}>
                  <img src={r.image} style={{ width: "100%", height: 80, borderRadius: 8, objectFit: "cover", border: `1px solid ${c.line}`, cursor: "pointer" }} alt="proof" />
                </div>
              )}
              {(role === "Store Keeper" || role === "Admin") && r.status === "Pending" && (
                <div style={{ display: "flex", gap: 8, marginTop: 10 }}>
                  <button style={btnSolid(c, c.ok)}>{t.approve}</button>
                  <button style={btnSolid(c, c.bad)}>{t.reject}</button>
                  <button style={btnGhost(c)}>{t.issue}</button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function Tracking({ c, t, onOpen }) {
  const [q, setQ] = useState("");
  const result = ASSETS.find(a =>
    q && (a.id.toLowerCase() === q.toLowerCase() || a.holder.toLowerCase().includes(q.toLowerCase()))
  );

  return (
    <div>
      <SearchBar c={c} value={q} onChange={setQ} placeholder={t.searchPlaceholder} />
      {result ? (
        <div onClick={() => onOpen(result)} style={{
          marginTop: 14, background: c.panel, border: `1px solid ${c.line}`, borderRadius: 10, padding: 14, cursor: "pointer",
        }}>
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <div style={{ fontFamily: DISPLAY, fontSize: 20, color: c.text }}>{result.id}</div>
            <Chip color={STATUS_COLOR(result.status, c)}>{result.status}</Chip>
          </div>
          <div style={{ fontSize: 12, color: c.sub, marginTop: 2 }}>{result.name}</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 8, marginTop: 12 }}>
            <Row c={c} icon={User} label={t.currentHolder} value={result.holder} />
            <Row c={c} icon={MapPin} label={t.location} value={result.area} />
            <Row c={c} icon={Calendar} label={t.borrowed} value={result.date} />
          </div>
        </div>
      ) : q ? (
        <div style={{ marginTop: 24, textAlign: "center", color: c.sub }}>No match found</div>
      ) : null}
    </div>
  );
}

function Reports({ c, t }) {
  return (
    <div>
      <SectionTitle c={c}>{t.daily}</SectionTitle>
      <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
        <StatCard c={c} label="In" value={12} icon={ArrowDownToLine} tint={c.ok} />
        <StatCard c={c} label="Out" value={31} icon={ArrowUpFromLine} tint={c.info} />
        <StatCard c={c} label="Borrow" value={9} icon={ArrowLeftRight} tint={c.accent} />
        <StatCard c={c} label="Return" value={6} icon={ArrowLeftRight} tint={c.sub} />
      </div>

      <SectionTitle c={c}>{t.transactions}</SectionTitle>
      <div style={{ background: c.panel, border: `1px solid ${c.line}`, borderRadius: 10, padding: 14 }}>
        <div style={{ fontSize: 12, color: c.sub, marginBottom: 8, fontWeight: 600 }}>Recent activity</div>
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          {[1, 2, 3, 4, 5].map(i => (
            <div key={i} style={{ fontSize: 12, color: c.sub, padding: "6px 0", borderBottom: `1px solid ${c.line}`, display: "flex", justifyContent: "space-between" }}>
              <span>Transaction {i}</span>
              <span>2026-07-07</span>
            </div>
          ))}
        </div>
      </div>

      <div style={{ display: "flex", gap: 8, marginTop: 16 }}>
        <button style={btnSolid(c)}>{t.exportExcel}</button>
        <button style={btnGhost(c)}>PDF</button>
      </div>
    </div>
  );
}

/* ---------------------------------------------------------------
   STYLES
------------------------------------------------------------------*/
function btnSolid(c, color) {
  return {
    fontFamily: BODY, fontSize: 12.5, fontWeight: 700, padding: "8px 14px", borderRadius: 7,
    border: "none", background: color || c.accent, color: "#12161B", cursor: "pointer",
  };
}
function btnGhost(c) {
  return {
    fontFamily: BODY, fontSize: 12, fontWeight: 600, padding: "6px 12px", borderRadius: 7,
    border: `1px solid ${c.line}`, background: c.panel2, color: c.text, cursor: "pointer",
  };
}
function inputStyle(c) {
  return { width: "100%", boxSizing: "border-box", padding: "8px 10px", borderRadius: 7, border: `1px solid ${c.line}`, background: c.panel2, color: c.text, fontFamily: BODY, fontSize: 13 };
}
function selectStyle(c) { return { ...inputStyle(c) }; }

/* ---------------------------------------------------------------
   MAIN APP
------------------------------------------------------------------*/
const TABS = [
  { key: "dashboard", icon: LayoutGrid },
  { key: "inventory", icon: Package },
  { key: "assets", icon: Wrench },
  { key: "borrow", icon: ArrowLeftRight },
  { key: "tracking", icon: Search },
  { key: "reports", icon: FileBarChart },
];

export default function App() {
  const [dark, setDark] = useState(true);
  const [lang, setLang] = useState("en");
  const [tab, setTab] = useState("dashboard");
  const [role, setRole] = useState("Store Keeper");
  const [openAsset, setOpenAsset] = useState(null);
  const [imageView, setImageView] = useState(null);

  const c = dark ? T.dark : T.light;
  const t = I18N[lang];

  return (
    <div style={{
      minHeight: "100vh", background: c.bg, fontFamily: BODY, color: c.text,
      display: "flex", justifyContent: "center",
    }}>
      <div style={{ width: "100%", maxWidth: 480, minHeight: "100vh", display: "flex", flexDirection: "column", position: "relative" }}>
        {/* Header */}
        <div style={{
          position: "sticky", top: 0, zIndex: 20, background: c.bg, borderBottom: `1px solid ${c.line}`,
          padding: "14px 16px 12px",
        }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
            <div>
              <div style={{ fontFamily: DISPLAY, fontSize: 19, letterSpacing: 0.5, color: c.text, lineHeight: 1 }}>
                SITE<span style={{ color: c.accent }}>STORE</span>
              </div>
              <div style={{ fontSize: 10.5, color: c.sub, letterSpacing: 1, textTransform: "uppercase", marginTop: 2 }}>
                Construction Store & Assets
              </div>
            </div>
            <div style={{ display: "flex", gap: 6 }}>
              <button onClick={() => setLang(lang === "en" ? "th" : "en")} style={{ ...btnGhost(c), width: 32, height: 32, padding: 0 }}>{lang.toUpperCase()}</button>
              <button onClick={() => setDark(!dark)} style={{ ...btnGhost(c), width: 32, height: 32, padding: 0 }}>
                {dark ? <Sun size={16} /> : <Moon size={16} />}
              </button>
            </div>
          </div>
          <div style={{ display: "flex", gap: 6, marginTop: 10, overflowX: "auto", paddingBottom: 4 }}>
            {ROLES.map(r => (
              <button key={r} onClick={() => setRole(r)} style={{
                ...btnGhost(c), fontSize: 11, padding: "5px 10px", whiteSpace: "nowrap",
                background: role === r ? c.accent : c.panel2, color: role === r ? "#12161B" : c.sub,
                border: role === r ? "none" : `1px solid ${c.line}`,
              }}>{r}</button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div style={{ flex: 1, padding: "14px 16px 90px", overflowY: "auto" }}>
          {tab === "dashboard" && <Dashboard c={c} t={t} />}
          {tab === "inventory" && <Inventory c={c} t={t} />}
          {tab === "assets" && <Assets c={c} t={t} onOpen={setOpenAsset} />}
          {tab === "borrow" && <BorrowReturn c={c} t={t} role={role} />}
          {tab === "tracking" && <Tracking c={c} t={t} onOpen={setOpenAsset} />}
          {tab === "reports" && <Reports c={c} t={t} />}
        </div>

        {/* Bottom nav */}
        <div style={{
          position: "fixed", bottom: 0, left: "50%", transform: "translateX(-50%)",
          width: "100%", maxWidth: 480, background: c.panel, borderTop: `1px solid ${c.line}`,
          display: "flex", zIndex: 30,
        }}>
          {TABS.map(({ key, icon: Icon }) => (
            <button key={key} onClick={() => setTab(key)} style={{
              flex: 1, background: "none", border: "none", padding: "10px 2px 8px",
              display: "flex", flexDirection: "column", alignItems: "center", gap: 3, cursor: "pointer",
            }}>
              <Icon size={19} color={tab === key ? c.accent : c.sub} />
              <span style={{ fontSize: 9.5, fontWeight: 600, color: tab === key ? c.accent : c.sub, textTransform: "uppercase", letterSpacing: 0.3 }}>
                {t[key]}
              </span>
            </button>
          ))}
        </div>

        <AssetDetail asset={openAsset} c={c} t={t} onClose={() => setOpenAsset(null)} />
        <ImageViewer image={imageView} c={c} onClose={() => setImageView(null)} />
      </div>
    </div>
  );
}
