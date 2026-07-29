import { useState } from 'react';
import { card, pageTitle, pageSub } from '../components/ui.js';
import { TABS, COLS } from '../lib/config.js';
import { visibleHeaders, toNum } from '../lib/viewer.js';
import ScrollX from '../components/ScrollX.jsx';

// ตารางวัสดุคงเหลือ — แสดงทุกคอลัมน์ที่มีใน Sheet (เพิ่มคอลัมน์เองแล้วโชว์เลย)
export default function ViewStock({ tables }) {
  const [q, setQ] = useState('');
  const tbl = tables[TABS.consumables] || { headers: [], rows: [] };
  const headers = visibleHeaders(tbl.headers);
  const query = q.trim().toLowerCase();
  const rows = tbl.rows.filter((r) => !query || headers.some((h) => String(r[h] || '').toLowerCase().includes(query)));

  return (
    <div>
      <div style={pageTitle}>วัสดุคงเหลือ</div>
      <div style={pageSub}>ของสิ้นเปลืองในสโตร์ — เห็นว่ามีอะไร เหลือเท่าไหร่ ควรเบิกเติมไหม</div>

      <input
        type="text"
        placeholder="ค้นหารายการ / รหัส / หมวด"
        value={q}
        onChange={(e) => setQ(e.target.value)}
        style={{ width: '100%', maxWidth: 420, padding: '11px 14px', borderRadius: 9, background: '#262c38', border: '1px solid #333b48', color: '#e9edf2', fontFamily: 'inherit', fontSize: 14, marginBottom: 16 }}
      />

      {rows.length ? (
        <div style={card}>
          <ScrollX minWidth={Math.max(520, (headers.length + 1) * 130)}>
            <div style={{ display: 'grid', gridTemplateColumns: `repeat(${headers.length}, minmax(110px,1fr)) 120px`, gap: 8, padding: '12px 16px', background: '#2a303c', fontSize: 11.5, color: '#8b94a3', fontWeight: 700 }}>
              {headers.map((h) => (<div key={h}>{h}</div>))}
              <div>สถานะสต็อก</div>
            </div>
            {rows.map((r, i) => {
              const lowStock = toNum(r[COLS.cQty]) <= toNum(r[COLS.cMin]);
              return (
                <div key={i} style={{ display: 'grid', gridTemplateColumns: `repeat(${headers.length}, minmax(110px,1fr)) 120px`, gap: 8, padding: '10px 16px', borderTop: '1px solid #333b48', fontSize: 13, alignItems: 'center' }}>
                  {headers.map((h) => (
                    <div key={h} style={{ fontWeight: h === COLS.cName ? 600 : 400, color: h === COLS.cName ? '#e9edf2' : '#c3cad4' }}>{r[h]}</div>
                  ))}
                  <div>
                    <span style={{ background: lowStock ? 'rgba(224,85,95,0.15)' : 'rgba(52,196,113,0.15)', color: lowStock ? '#e0555f' : '#34c471', fontSize: 11.5, fontWeight: 700, padding: '3px 9px', borderRadius: 999, whiteSpace: 'nowrap' }}>
                      {lowStock ? 'ควรเบิกเติม' : 'ปกติ'}
                    </span>
                  </div>
                </div>
              );
            })}
          </ScrollX>
        </div>
      ) : (
        <Empty tables={tables} />
      )}
    </div>
  );
}

function Empty({ tables }) {
  const has = (tables[TABS.consumables] || {}).rows?.length;
  return (
    <div style={{ background: '#262c38', border: '1px dashed #3a4150', borderRadius: 14, padding: 24, textAlign: 'center', color: '#8b94a3', fontSize: 13 }}>
      {has ? 'ไม่พบรายการที่ค้นหา' : 'ยังไม่มีข้อมูลในแท็บ "วัสดุสิ้นเปลือง" ของ Google Sheet'}
    </div>
  );
}
