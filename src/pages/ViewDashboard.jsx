import { card, pageTitle, pageSub, sectionTitle } from '../components/ui.js';
import { TABS, COLS } from '../lib/config.js';
import { statusMeta, toNum } from '../lib/viewer.js';

export default function ViewDashboard({ tables }) {
  const cons = (tables[TABS.consumables] || { rows: [] }).rows;
  const assets = (tables[TABS.assets] || { rows: [] }).rows;

  const low = cons.filter((r) => toNum(r[COLS.cQty]) <= toNum(r[COLS.cMin]));
  const statusCount = {};
  assets.forEach((a) => {
    const { label } = statusMeta(a[COLS.aStatus]);
    statusCount[label] = (statusCount[label] || 0) + 1;
  });
  const strip = [
    ['พร้อมเบิก', '#34c471'],
    ['กำลังถูกเบิกใช้', '#f5a623'],
    ['ส่งซ่อม', '#4a90d9'],
    ['ชำรุด', '#e0555f'],
    ['หาย', '#9b6bea'],
  ];

  return (
    <div>
      <div style={pageTitle}>ภาพรวมสต็อกสโตร์</div>
      <div style={pageSub}>ข้อมูลสดจาก Google Sheet — ทุกคนดูได้</div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(200px,1fr))', gap: 14, marginBottom: 22 }}>
        <Kpi label="วัสดุสิ้นเปลือง (รายการ)" value={cons.length} />
        <Kpi label="ใกล้หมด ควรเบิกเติม" value={low.length} color="#e0555f" />
        <Kpi label="ทรัพย์สิน/ครุภัณฑ์ (ชิ้น)" value={assets.length} />
        <Kpi label="พร้อมเบิก" value={statusCount['พร้อมเบิก'] || 0} color="#34c471" />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(150px,1fr))', gap: 12, marginBottom: 26 }}>
        {strip.map(([label, color]) => (
          <div key={label} style={{ background: '#262c38', borderLeft: `4px solid ${color}`, borderRadius: 10, padding: '14px 16px' }}>
            <div style={{ fontSize: 12, color: '#8b94a3' }}>{label}</div>
            <div style={{ fontSize: 24, fontWeight: 800, color }}>{statusCount[label] || 0}</div>
          </div>
        ))}
      </div>

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
        <div style={sectionTitle}>รายการที่ควรเบิกเติม</div>
        <div style={{ fontSize: 12, color: '#8b94a3' }}>{low.length} รายการ</div>
      </div>
      {low.length ? (
        <div style={{ ...card }}>
          {low.map((r, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '11px 16px', borderTop: i ? '1px solid #333b48' : 'none', gap: 12 }}>
              <div style={{ fontWeight: 600, fontSize: 13.5 }}>{r[COLS.cName] || r[COLS.cCode] || '—'}</div>
              <div style={{ fontSize: 12.5, color: '#8b94a3' }}>
                คงเหลือ {r[COLS.cQty] || 0} {r[COLS.cUnit] || ''} / ขั้นต่ำ {r[COLS.cMin] || 0}
              </div>
              <div style={{ background: 'rgba(224,85,95,0.15)', color: '#e0555f', fontSize: 11.5, fontWeight: 700, padding: '3px 9px', borderRadius: 999, whiteSpace: 'nowrap' }}>ควรเบิกเติม</div>
            </div>
          ))}
        </div>
      ) : (
        <div style={{ background: '#262c38', border: '1px dashed #3a4150', borderRadius: 14, padding: 20, textAlign: 'center', color: '#8b94a3', fontSize: 13 }}>ทุกอย่างสต็อกเพียงพอ 👍</div>
      )}
    </div>
  );
}

function Kpi({ label, value, color }) {
  return (
    <div style={{ background: '#262c38', border: '1px solid #333b48', borderRadius: 14, padding: 18 }}>
      <div style={{ fontSize: 12, color: color || '#8b94a3', marginBottom: 8 }}>{label}</div>
      <div style={{ fontSize: 30, fontWeight: 800, color: color || undefined }}>{value}</div>
    </div>
  );
}
