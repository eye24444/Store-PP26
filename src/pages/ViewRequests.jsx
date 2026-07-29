import { card, pageTitle, pageSub } from '../components/ui.js';
import { TABS } from '../lib/config.js';
import { visibleHeaders } from '../lib/viewer.js';
import ScrollX from '../components/ScrollX.jsx';

const STATUS_COLOR = { 'รออนุมัติ': '#f5a623', 'อนุมัติ': '#34c471', 'อนุมัติแล้ว': '#34c471', 'ปฏิเสธ': '#e0555f', 'ไม่อนุมัติ': '#e0555f' };

// คำขอเบิกล่าสุด (อ่านจากแท็บ "คำขอเบิก") — เรียงใหม่สุดขึ้นก่อน
export default function ViewRequests({ tables }) {
  const tbl = tables[TABS.requests] || { headers: [], rows: [] };
  const headers = visibleHeaders(tbl.headers);
  const rows = [...tbl.rows].reverse();
  const statusHeader = tbl.headers.find((h) => h === 'สถานะ');

  return (
    <div>
      <div style={pageTitle}>คำขอเบิกล่าสุด</div>
      <div style={pageSub}>รายการคำขอเบิกจากสตาฟ พร้อมสถานะการอนุมัติ</div>

      {rows.length ? (
        <div style={card}>
          <ScrollX minWidth={Math.max(560, headers.length * 130)}>
            <div style={{ display: 'grid', gridTemplateColumns: `repeat(${headers.length}, minmax(110px,1fr))`, gap: 8, padding: '12px 16px', background: '#2a303c', fontSize: 11.5, color: '#8b94a3', fontWeight: 700 }}>
              {headers.map((h) => (<div key={h}>{h}</div>))}
            </div>
            {rows.map((r, i) => (
              <div key={i} style={{ display: 'grid', gridTemplateColumns: `repeat(${headers.length}, minmax(110px,1fr))`, gap: 8, padding: '10px 16px', borderTop: '1px solid #333b48', fontSize: 13, alignItems: 'center' }}>
                {headers.map((h) => {
                  if (h === statusHeader) {
                    const c = STATUS_COLOR[String(r[h]).trim()] || '#8b94a3';
                    return <div key={h}><span style={{ color: c, fontWeight: 700 }}>{r[h]}</span></div>;
                  }
                  return <div key={h} style={{ color: '#c3cad4' }}>{r[h]}</div>;
                })}
              </div>
            ))}
          </ScrollX>
        </div>
      ) : (
        <div style={{ background: '#262c38', border: '1px dashed #3a4150', borderRadius: 14, padding: 24, textAlign: 'center', color: '#8b94a3', fontSize: 13 }}>ยังไม่มีคำขอเบิก</div>
      )}
    </div>
  );
}
