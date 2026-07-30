import { useState } from 'react';
import { card, pageTitle, pageSub } from '../components/ui.js';
import { TABS, COLS } from '../lib/config.js';
import { toNum } from '../lib/viewer.js';

// หน้าหลัก: รายการของ + คงเหลือ + หน่วย (อ่านสดจากตาราง Item)
export default function StockList({ tables }) {
  const [q, setQ] = useState('');
  const rows = (tables[TABS.item] || { rows: [] }).rows;
  const query = q.trim().toLowerCase();
  const filtered = rows.filter(
    (r) => !query || String(r[COLS.itemName] || '').toLowerCase().includes(query) || String(r[COLS.itemId] || '').toLowerCase().includes(query)
  );

  return (
    <div>
      <div style={pageTitle}>สต็อกคงเหลือ</div>
      <div style={pageSub}>รายการของในสโตร์ · ข้อมูลสดจาก Google Sheet</div>

      <input
        type="text"
        placeholder="ค้นหารายการของ"
        value={q}
        onChange={(e) => setQ(e.target.value)}
        style={{ width: '100%', maxWidth: 420, padding: '11px 14px', borderRadius: 9, background: '#262c38', border: '1px solid #333b48', color: '#e9edf2', fontFamily: 'inherit', fontSize: 14, marginBottom: 16 }}
      />

      {filtered.length ? (
        <div style={card}>
          <div style={{ ...grid, padding: '12px 16px', background: '#2a303c', fontSize: 12, color: '#8b94a3', fontWeight: 700 }}>
            <div>#</div>
            <div>รายการของ</div>
            <div style={{ textAlign: 'right' }}>คงเหลือ</div>
            <div>หน่วย</div>
          </div>
          {filtered.map((r, i) => {
            const stock = toNum(r[COLS.itemStock]);
            return (
              <div key={i} style={{ ...grid, padding: '11px 16px', borderTop: '1px solid #333b48', fontSize: 14, alignItems: 'center' }}>
                <div style={{ color: '#8b94a3' }}>{i + 1}</div>
                <div style={{ fontWeight: 600 }}>{r[COLS.itemName] || '—'}</div>
                <div style={{ textAlign: 'right', fontWeight: 800, fontSize: 16, color: stock <= 0 ? '#e0555f' : '#e9edf2', fontVariantNumeric: 'tabular-nums' }}>{r[COLS.itemStock] || 0}</div>
                <div style={{ color: '#8b94a3' }}>{r[COLS.itemUnit] || ''}</div>
              </div>
            );
          })}
        </div>
      ) : (
        <div style={{ background: '#262c38', border: '1px dashed #3a4150', borderRadius: 14, padding: 24, textAlign: 'center', color: '#8b94a3', fontSize: 13 }}>
          {rows.length ? 'ไม่พบรายการที่ค้นหา' : 'ยังไม่มีข้อมูลในตาราง Item'}
        </div>
      )}
    </div>
  );
}

const grid = { display: 'grid', gridTemplateColumns: '40px 1fr 90px 80px', gap: 10 };
