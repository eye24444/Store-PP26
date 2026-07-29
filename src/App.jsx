import { useState } from 'react';
import { useLiveData, getEndpoint, setEndpoint } from './lib/viewer.js';
import { useIsMobile } from './lib/useIsMobile.js';
import { navBtn, fieldStyle, enabledBtn } from './lib/theme.js';
import { card } from './components/ui.js';
import ViewDashboard from './pages/ViewDashboard.jsx';
import ViewAssets from './pages/ViewAssets.jsx';
import ViewStock from './pages/ViewStock.jsx';
import RequestForm from './pages/RequestForm.jsx';
import ViewRequests from './pages/ViewRequests.jsx';

const NAV = [
  { key: 'dashboard', label: 'ภาพรวมสต็อก' },
  { key: 'assets', label: 'ติดตามทรัพย์สิน' },
  { key: 'stock', label: 'วัสดุคงเหลือ' },
  { key: 'request', label: 'ส่งคำขอเบิก' },
  { key: 'requests', label: 'คำขอเบิกล่าสุด' },
];

export default function App() {
  const { status, tables, updatedAt, error, reload } = useLiveData();
  const isMobile = useIsMobile();
  const [page, setPage] = useState('dashboard');
  const [drawer, setDrawer] = useState(false);
  const [showCfg, setShowCfg] = useState(false);

  const go = (k) => { setPage(k); setDrawer(false); };

  const brand = (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '0 4px' }}>
      <div style={{ width: 38, height: 38, borderRadius: 9, background: '#f5a623', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: 13, color: '#1e2430', flexShrink: 0 }}>PP26</div>
      <div>
        <div style={{ fontWeight: 800, fontSize: 16, lineHeight: 1.1 }}>Store PP26</div>
        <div style={{ fontSize: 10.5, color: '#8b94a3' }}>เบิก-คืนทรัพย์สินหน้างาน</div>
      </div>
    </div>
  );

  const navList = (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
      {NAV.map((n) => (
        <button key={n.key} style={navBtn(page === n.key)} onClick={() => go(n.key)}>
          <span>{n.label}</span>
        </button>
      ))}
      <button onClick={() => { setShowCfg(true); setDrawer(false); }} style={{ ...navBtn(false), border: '1px solid #333b48', justifyContent: 'flex-start', fontSize: 12.5 }}>
        ⚙️ ตั้งค่าลิงก์ Sheet
      </button>
      <button onClick={reload} style={{ ...navBtn(false), justifyContent: 'flex-start', fontSize: 12.5, color: '#8b94a3' }}>
        🔄 รีเฟรชข้อมูล
      </button>
    </div>
  );

  return (
    <div style={{ minHeight: '100vh', background: '#1e2430', color: '#e9edf2', display: 'flex', flexDirection: isMobile ? 'column' : 'row' }}>
      {isMobile ? (
        <header style={{ position: 'sticky', top: 0, zIndex: 90, background: '#20262f', borderBottom: '1px solid #333b48' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10, padding: '12px 14px' }}>
            {brand}
            <button onClick={() => setDrawer((v) => !v)} aria-label="เมนู" style={{ border: '1px solid #3a4150', background: '#2a303c', color: '#e9edf2', width: 42, height: 42, borderRadius: 10, fontSize: 18, flexShrink: 0 }}>
              {drawer ? '✕' : '☰'}
            </button>
          </div>
          {drawer ? <div style={{ padding: '0 14px 14px', borderTop: '1px solid #333b48' }}><div style={{ marginTop: 12 }}>{navList}</div></div> : null}
        </header>
      ) : (
        <aside style={{ width: 236, flexShrink: 0, background: '#20262f', borderRight: '1px solid #333b48', display: 'flex', flexDirection: 'column', padding: '20px 14px', gap: 18, position: 'sticky', top: 0, height: '100vh', overflowY: 'auto' }}>
          {brand}
          {navList}
          <div style={{ marginTop: 'auto', fontSize: 10.5, color: '#5c6472', padding: '0 4px' }}>
            {updatedAt ? 'อัปเดตล่าสุด: ' + new Date(updatedAt).toLocaleString('th-TH') : 'ข้อมูลสดจาก Google Sheet'}
          </div>
        </aside>
      )}

      <div style={{ flex: 1, minWidth: 0, padding: isMobile ? '18px 16px 60px' : '28px 32px 60px', overflowY: 'auto' }}>
        {status === 'loading' && <Msg icon="⏳" title="กำลังโหลดข้อมูลจาก Google Sheet…" />}
        {status === 'noconfig' && (
          <Msg icon="🔌" title="ยังไม่ได้เชื่อม Google Sheet" sub="กดปุ่ม ⚙️ ตั้งค่าลิงก์ Sheet แล้ววางลิงก์ Web App (/exec) เพื่อเริ่มดูข้อมูล">
            <button style={{ ...enabledBtn(false), marginTop: 14 }} onClick={() => setShowCfg(true)}>ตั้งค่าลิงก์ Sheet</button>
          </Msg>
        )}
        {status === 'error' && <Msg icon="⚠️" title="โหลดข้อมูลไม่สำเร็จ" sub={error}><button style={{ ...enabledBtn(false), marginTop: 14 }} onClick={reload}>ลองใหม่</button></Msg>}
        {(status === 'ready' || status === 'refreshing') && tables && (
          <>
            {page === 'dashboard' && <ViewDashboard tables={tables} />}
            {page === 'assets' && <ViewAssets tables={tables} isMobile={isMobile} />}
            {page === 'stock' && <ViewStock tables={tables} />}
            {page === 'request' && <RequestForm tables={tables} onDone={reload} />}
            {page === 'requests' && <ViewRequests tables={tables} />}
          </>
        )}
      </div>

      {showCfg && <ConfigModal onClose={() => setShowCfg(false)} onSaved={reload} />}
    </div>
  );
}

function Msg({ icon, title, sub, children }) {
  return (
    <div style={{ ...card, padding: 40, textAlign: 'center', maxWidth: 520, margin: '40px auto' }}>
      <div style={{ fontSize: 44 }}>{icon}</div>
      <div style={{ fontSize: 18, fontWeight: 800, margin: '10px 0 6px' }}>{title}</div>
      {sub ? <div style={{ color: '#8b94a3', fontSize: 14, lineHeight: 1.6 }}>{sub}</div> : null}
      {children}
    </div>
  );
}

function ConfigModal({ onClose, onSaved }) {
  const [url, setUrl] = useState(getEndpoint());
  return (
    <div onClick={onClose} style={{ position: 'fixed', inset: 0, background: '#00000088', zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
      <div onClick={(e) => e.stopPropagation()} style={{ ...card, padding: 24, maxWidth: 520, width: '100%' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 6 }}>
          <div style={{ fontSize: 18, fontWeight: 800 }}>ตั้งค่าลิงก์ Google Sheet</div>
          <button onClick={onClose} style={{ border: 'none', background: '#3a4150', color: '#e9edf2', width: 30, height: 30, borderRadius: 8, cursor: 'pointer', fontWeight: 700 }}>×</button>
        </div>
        <div style={{ fontSize: 12.5, color: '#8b94a3', marginBottom: 14, lineHeight: 1.6 }}>
          วางลิงก์ Web App (ลงท้าย /exec) จาก Google Apps Script — แอปจะอ่านข้อมูลสดจาก Google Sheet ทันที
          <br />สำหรับใช้งานจริงกับทุกคน แนะนำใส่ลิงก์ในไฟล์ <code style={{ color: '#f5a623' }}>src/lib/config.js</code> จะได้ไม่ต้องตั้งทีละเครื่อง
        </div>
        <input value={url} onChange={(e) => setUrl(e.target.value)} placeholder="https://script.google.com/macros/s/..../exec" style={{ ...fieldStyle, marginBottom: 14 }} />
        <button style={enabledBtn(false)} onClick={() => { setEndpoint(url.trim()); onClose(); onSaved(); }}>บันทึกและโหลดข้อมูล</button>
      </div>
    </div>
  );
}
