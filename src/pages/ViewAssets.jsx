import { useState } from 'react';
import { card, pageTitle, pageSub } from '../components/ui.js';
import { chipBtn } from '../lib/theme.js';
import { TABS, COLS } from '../lib/config.js';
import { visibleHeaders, statusMeta } from '../lib/viewer.js';
import ScrollX from '../components/ScrollX.jsx';

// ติดตามทรัพย์สิน — ใครถืออยู่ อยู่หน่วยงาน/งานอะไร สถานะไหน (อ่านสดจาก Sheet)
export default function ViewAssets({ tables, isMobile }) {
  const [q, setQ] = useState('');
  const [filter, setFilter] = useState('all');
  const [sel, setSel] = useState(null);

  const tbl = tables[TABS.assets] || { headers: [], rows: [] };
  const headers = visibleHeaders(tbl.headers);
  const query = q.trim().toLowerCase();

  const rows = tbl.rows.filter((r) => {
    if (filter !== 'all' && statusMeta(r[COLS.aStatus]).label !== filter) return false;
    if (!query) return true;
    return headers.some((h) => String(r[h] || '').toLowerCase().includes(query));
  });

  const filters = ['all', 'พร้อมเบิก', 'กำลังถูกเบิกใช้', 'ส่งซ่อม', 'ชำรุด', 'หาย'];
  const fColor = { 'พร้อมเบิก': '#34c471', 'กำลังถูกเบิกใช้': '#f5a623', 'ส่งซ่อม': '#4a90d9', 'ชำรุด': '#e0555f', 'หาย': '#9b6bea', all: '#f5a623' };

  return (
    <div>
      <div style={pageTitle}>ติดตามทรัพย์สิน</div>
      <div style={pageSub}>ค้นหาว่าทรัพย์สินแต่ละชิ้นอยู่กับใคร หน่วยงาน/งานอะไร สถานะไหน</div>

      <input
        type="text"
        placeholder="ค้นหารหัส / ชื่อ / ผู้ถือ / หน่วยงาน"
        value={q}
        onChange={(e) => setQ(e.target.value)}
        style={{ width: '100%', maxWidth: 420, padding: '11px 14px', borderRadius: 9, background: '#262c38', border: '1px solid #333b48', color: '#e9edf2', fontFamily: 'inherit', fontSize: 14, marginBottom: 12 }}
      />
      <div style={{ display: 'flex', gap: 8, marginBottom: 16, flexWrap: 'wrap' }}>
        {filters.map((f) => (
          <button key={f} style={chipBtn(filter === f, fColor[f])} onClick={() => setFilter(f)}>{f === 'all' ? 'ทั้งหมด' : f}</button>
        ))}
      </div>

      {rows.length ? (
        <div style={card}>
          <ScrollX minWidth={Math.max(560, (headers.length) * 140)}>
            <div style={{ display: 'grid', gridTemplateColumns: `repeat(${headers.length}, minmax(120px,1fr))`, gap: 8, padding: '12px 16px', background: '#2a303c', fontSize: 11.5, color: '#8b94a3', fontWeight: 700 }}>
              {headers.map((h) => (<div key={h}>{h}</div>))}
            </div>
            {rows.map((r, i) => (
              <div
                key={i}
                onClick={() => setSel(r)}
                style={{ display: 'grid', gridTemplateColumns: `repeat(${headers.length}, minmax(120px,1fr))`, gap: 8, padding: '10px 16px', borderTop: '1px solid #333b48', fontSize: 13, alignItems: 'center', cursor: 'pointer' }}
              >
                {headers.map((h) => {
                  if (h === COLS.aStatus) {
                    const m = statusMeta(r[h]);
                    return <div key={h} style={{ color: m.color, fontWeight: 700 }}>{m.label}</div>;
                  }
                  return <div key={h} style={{ fontWeight: h === COLS.aCode ? 700 : 400, color: h === COLS.aCode ? '#e9edf2' : '#c3cad4' }}>{r[h]}</div>;
                })}
              </div>
            ))}
          </ScrollX>
        </div>
      ) : (
        <div style={{ background: '#262c38', border: '1px dashed #3a4150', borderRadius: 14, padding: 24, textAlign: 'center', color: '#8b94a3', fontSize: 13 }}>
          {(tbl.rows || []).length ? 'ไม่พบทรัพย์สินตามเงื่อนไข' : 'ยังไม่มีข้อมูลในแท็บ "ทรัพย์สิน" ของ Google Sheet'}
        </div>
      )}

      {sel && (
        <div onClick={() => setSel(null)} style={{ position: 'fixed', inset: 0, background: '#00000088', zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
          <div onClick={(e) => e.stopPropagation()} style={{ ...card, padding: 22, maxWidth: 440, width: '100%', maxHeight: '85vh', overflowY: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 14 }}>
              <div>
                <div style={{ fontSize: 22, fontWeight: 800 }}>{sel[COLS.aCode] || '—'}</div>
                <div style={{ color: '#8b94a3' }}>{[sel[COLS.aCat], sel[COLS.aName]].filter(Boolean).join(' · ')}</div>
              </div>
              <button onClick={() => setSel(null)} style={{ border: 'none', background: '#3a4150', color: '#e9edf2', width: 30, height: 30, borderRadius: 8, cursor: 'pointer', fontWeight: 700 }}>×</button>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, fontSize: 14 }}>
              {headers.filter((h) => h !== COLS.aCode).map((h) => {
                const isStatus = h === COLS.aStatus;
                const m = isStatus ? statusMeta(sel[h]) : null;
                return (
                  <div key={h}>
                    <div style={{ color: '#8b94a3', fontSize: 12, marginBottom: 4 }}>{h}</div>
                    <div style={{ fontWeight: 700, color: isStatus ? m.color : undefined }}>{isStatus ? m.label : (sel[h] || '—')}</div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
