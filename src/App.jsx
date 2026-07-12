import { useState } from 'react';
import { useStore } from './lib/useStore.js';
import { useIsMobile } from './lib/useIsMobile.js';
import { toggleBtn, navBtn } from './lib/theme.js';
import { DATA_KEYS } from './lib/seed.js';
import Dashboard from './pages/Dashboard.jsx';
import Request from './pages/Request.jsx';
import Return from './pages/Return.jsx';
import Tracker from './pages/Tracker.jsx';
import Reports from './pages/Reports.jsx';
import Central from './pages/Central.jsx';
import GoodsIn from './pages/GoodsIn.jsx';
import Admin from './pages/Admin.jsx';
import SheetSettings from './components/SheetSettings.jsx';
import PinModal from './components/PinModal.jsx';

export default function App() {
  const { state, set, vals, showToast } = useStore();
  const [showSettings, setShowSettings] = useState(false);
  const [showPin, setShowPin] = useState(false);
  const isMobile = useIsMobile();

  // Entering Store (admin) mode requires the 4-digit PIN; leaving to Staff is free.
  const requestAdmin = () => {
    if (state.role === 'admin') return;
    setShowPin(true);
  };

  // Replace persisted data keys with a snapshot pulled from the sheet.
  const applyPulled = (data) => {
    const patch = {};
    for (const k of DATA_KEYS) if (data[k] !== undefined) patch[k] = data[k];
    set(patch);
  };

  // On mobile the nav item also closes the drawer after navigating.
  const [drawerOpen, setDrawerOpen] = useState(false);
  const onNav = (fn) => () => {
    fn();
    setDrawerOpen(false);
  };

  const brand = (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '0 4px' }}>
      <div style={{ width: 38, height: 38, borderRadius: 9, background: '#f5a623', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: 13, color: '#1e2430', flexShrink: 0 }}>PP26</div>
      <div>
        <div style={{ fontWeight: 800, fontSize: 16, lineHeight: 1.1 }}>Store PP26</div>
        <div style={{ fontSize: 10.5, color: '#8b94a3' }}>เบิก-คืนทรัพย์สินหน้างาน</div>
      </div>
    </div>
  );

  const roleToggle = (
    <div style={{ display: 'flex', background: '#2a303c', border: '1px solid #3a4150', borderRadius: 10, padding: 3 }}>
      <button style={toggleBtn(state.role === 'staff')} onClick={() => vals.api.setRole('staff')}>
        Staff
      </button>
      <button style={toggleBtn(state.role === 'admin')} onClick={requestAdmin}>
        Store {state.role === 'admin' ? '' : '🔒'}
      </button>
    </div>
  );

  const navList = (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
      {vals.navItems.map((nav) => (
        <button key={nav.key} style={navBtn(nav.active)} onClick={onNav(nav.onClick)}>
          <span>{nav.label}</span>
          {nav.hasBadge ? (
            <span style={{ background: '#f5a623', color: '#1e2430', fontSize: 10.5, fontWeight: 800, borderRadius: 999, padding: '1px 7px' }}>{nav.badgeText}</span>
          ) : null}
        </button>
      ))}
      <button
        onClick={onNav(() => setShowSettings(true))}
        style={{ ...navBtn(false), border: '1px solid #333b48', justifyContent: 'flex-start', fontSize: 12.5 }}
      >
        ⚙️ เชื่อม Google Sheet
      </button>
    </div>
  );

  return (
    <div style={{ minHeight: '100vh', background: '#1e2430', color: '#e9edf2', display: 'flex', flexDirection: isMobile ? 'column' : 'row' }}>
      {isMobile ? (
        // --- Mobile: top bar + slide-down drawer ---
        <header style={{ position: 'sticky', top: 0, zIndex: 90, background: '#20262f', borderBottom: '1px solid #333b48' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10, padding: '12px 14px' }}>
            {brand}
            <button
              onClick={() => setDrawerOpen((v) => !v)}
              aria-label="เมนู"
              style={{ border: '1px solid #3a4150', background: '#2a303c', color: '#e9edf2', width: 42, height: 42, borderRadius: 10, fontSize: 18, flexShrink: 0 }}
            >
              {drawerOpen ? '✕' : '☰'}
              {vals.pendingCount > 0 && !drawerOpen ? (
                <span style={{ position: 'absolute', marginTop: -8, marginLeft: 2, background: '#f5a623', color: '#1e2430', fontSize: 9, fontWeight: 800, borderRadius: 999, padding: '0 5px' }}>{vals.pendingCount}</span>
              ) : null}
            </button>
          </div>
          {drawerOpen ? (
            <div style={{ padding: '0 14px 14px', display: 'flex', flexDirection: 'column', gap: 12, borderTop: '1px solid #333b48' }}>
              <div style={{ marginTop: 12 }}>{roleToggle}</div>
              {navList}
            </div>
          ) : null}
        </header>
      ) : (
        // --- Desktop: fixed sidebar ---
        <aside
          style={{
            width: 236,
            flexShrink: 0,
            background: '#20262f',
            borderRight: '1px solid #333b48',
            display: 'flex',
            flexDirection: 'column',
            padding: '20px 14px',
            gap: 18,
            position: 'sticky',
            top: 0,
            height: '100vh',
            overflowY: 'auto',
          }}
        >
          {brand}
          {roleToggle}
          {navList}
          <div style={{ marginTop: 'auto', fontSize: 10.5, color: '#5c6472', padding: '0 4px' }}>
            เมนูนี้ต่อยอดเพิ่มหน้าใหม่ได้ในอนาคต เช่น "รับเข้าจากสโตร์กลาง"
          </div>
        </aside>
      )}

      {/* Content */}
      <div style={{ flex: 1, minWidth: 0, padding: isMobile ? '18px 16px 60px' : '28px 32px 60px', overflowY: 'auto' }}>
        {vals.isDashboard && <Dashboard vals={vals} />}
        {vals.isRequest && <Request vals={vals} />}
        {vals.isReturn && <Return vals={vals} />}
        {vals.isTracker && <Tracker vals={vals} isMobile={isMobile} />}
        {vals.isReports && <Reports vals={vals} />}
        {vals.isGoodsIn && <GoodsIn vals={vals} />}
        {vals.isCentral && <Central vals={vals} />}
        {vals.isAdmin && <Admin vals={vals} />}
      </div>

      {/* Toast */}
      {state.toast ? (
        <div
          style={{
            position: 'fixed',
            left: '50%',
            bottom: 26,
            transform: 'translateX(-50%)',
            background: '#2a303c',
            border: '1px solid #4a5262',
            color: '#e9edf2',
            padding: '12px 20px',
            borderRadius: 11,
            fontSize: 13,
            fontWeight: 600,
            boxShadow: '0 10px 30px rgba(0,0,0,0.4)',
            animation: 'toastIn 0.2s ease',
            zIndex: 100,
          }}
        >
          {state.toast}
        </div>
      ) : null}

      {showSettings && (
        <SheetSettings onClose={() => setShowSettings(false)} state={state} onPulled={applyPulled} showToast={showToast} />
      )}

      {showPin && (
        <PinModal
          onClose={() => setShowPin(false)}
          onSuccess={() => {
            vals.api.setRole('admin');
            setShowPin(false);
            setDrawerOpen(false);
          }}
          showToast={showToast}
        />
      )}
    </div>
  );
}
