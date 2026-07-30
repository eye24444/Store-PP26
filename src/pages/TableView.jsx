import { useState } from 'react';
import { card, pageTitle, pageSub } from '../components/ui.js';
import { visibleHeaders } from '../lib/viewer.js';
import ScrollX from '../components/ScrollX.jsx';

// ตารางทั่วไป อ่านสดจากแท็บใน Sheet (โชว์ทุกคอลัมน์ เพิ่มคอลัมน์เองก็เด้งตาม)
export default function TableView({ tables, tab, title, subtitle }) {
  const [q, setQ] = useState('');
  const t = tables[tab] || { headers: [], rows: [] };
  const headers = visibleHeaders(t.headers);
  const query = q.trim().toLowerCase();
  const rows = t.rows.filter((r) => !query || headers.some((h) => String(r[h] || '').toLowerCase().includes(query)));

  return (
    <div>
      <div style={pageTitle}>{title}</div>
      {subtitle ? <div style={pageSub}>{subtitle}</div> : null}

      <input
        type="text"
        placeholder="ค้นหา"
        value={q}
        onChange={(e) => setQ(e.target.value)}
        style={{ width: '100%', maxWidth: 420, padding: '11px 14px', borderRadius: 9, background: '#262c38', border: '1px solid #333b48', color: '#e9edf2', fontFamily: 'inherit', fontSize: 14, marginBottom: 16 }}
      />

      {rows.length ? (
        <div style={card}>
          <ScrollX minWidth={Math.max(480, headers.length * 140)}>
            <div style={{ display: 'grid', gridTemplateColumns: `repeat(${headers.length}, minmax(120px,1fr))`, gap: 8, padding: '12px 16px', background: '#2a303c', fontSize: 11.5, color: '#8b94a3', fontWeight: 700 }}>
              {headers.map((h) => (<div key={h}>{h}</div>))}
            </div>
            {rows.map((r, i) => (
              <div key={i} style={{ display: 'grid', gridTemplateColumns: `repeat(${headers.length}, minmax(120px,1fr))`, gap: 8, padding: '10px 16px', borderTop: '1px solid #333b48', fontSize: 13, alignItems: 'center' }}>
                {headers.map((h, j) => (<div key={h} style={{ fontWeight: j === 0 ? 700 : 400, color: j === 0 ? '#e9edf2' : '#c3cad4' }}>{r[h]}</div>))}
              </div>
            ))}
          </ScrollX>
        </div>
      ) : (
        <div style={{ background: '#262c38', border: '1px dashed #3a4150', borderRadius: 14, padding: 24, textAlign: 'center', color: '#8b94a3', fontSize: 13 }}>
          {t.rows.length ? 'ไม่พบรายการที่ค้นหา' : 'ยังไม่มีข้อมูลในแท็บนี้'}
        </div>
      )}
    </div>
  );
}
