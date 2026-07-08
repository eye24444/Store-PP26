import { card, pageTitle, pageSub, sectionTitle } from '../components/ui.js';
import ScrollX from '../components/ScrollX.jsx';

export default function Dashboard({ vals }) {
  return (
    <div>
      <div style={pageTitle}>ภาพรวมสต็อกสโตร์&nbsp;</div>
      <div style={pageSub}>อัปเดตล่าสุด: 07/07/2026 09:40 น.</div>

      {/* KPI cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(200px,1fr))', gap: 14, marginBottom: 22 }}>
        <Kpi label="ของสิ้นเปลือง (รายการ)" value={vals.consumableTypeCount} />
        <Kpi label="ใกล้หมด ควรเบิกเติม" value={vals.lowStockCount} color="#e0555f" />
        <Kpi label="ทรัพย์สิน/ครุภัณฑ์ (ชิ้น)" value={vals.assetTotalCount} />
        <Kpi label="คำขอรออนุมัติ" value={vals.pendingCount} color="#f5a623" />
      </div>

      {/* status strip */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(150px,1fr))', gap: 12, marginBottom: 26 }}>
        <StatusCard label="พร้อมเบิก" value={vals.countAvailable} color="#34c471" />
        <StatusCard label="กำลังถูกเบิกใช้" value={vals.countInUse} color="#f5a623" />
        <StatusCard label="ส่งซ่อม" value={vals.countRepair} color="#4a90d9" />
        <StatusCard label="ชำรุด" value={vals.countDamaged} color="#e0555f" />
        <StatusCard label="หาย" value={vals.countLost} color="#9b6bea" />
      </div>

      {/* assets by category */}
      <div style={sectionTitle}>ทรัพย์สินแยกตามประเภท</div>
      <div style={{ ...card, marginBottom: 26 }}>
        <ScrollX minWidth={640}>
          <div style={{ ...assetGrid, padding: '12px 16px', background: '#2a303c', fontSize: 12, color: '#8b94a3', fontWeight: 700 }}>
            <div>ประเภท</div>
            <div>ทั้งหมด</div>
            <div>พร้อมเบิก</div>
            <div>ใช้งานอยู่</div>
            <div>ส่งซ่อม</div>
            <div>ชำรุด</div>
            <div>รหัสทั้งหมด</div>
          </div>
          {vals.assetGroups.map((g) => (
            <div key={g.category} style={{ ...assetGrid, padding: '12px 16px', borderTop: '1px solid #333b48', fontSize: 13, alignItems: 'center' }}>
              <div style={{ fontWeight: 700 }}>{g.category}</div>
              <div>{g.total}</div>
              <div style={{ color: '#34c471', fontWeight: 700 }}>{g.available}</div>
              <div style={{ color: '#f5a623', fontWeight: 700 }}>{g.inUse}</div>
              <div style={{ color: '#4a90d9' }}>{g.repair}</div>
              <div style={{ color: '#e0555f' }}>{g.damaged}</div>
              <div style={{ color: '#8b94a3', fontSize: 11 }}>{g.codesText}</div>
            </div>
          ))}
        </ScrollX>
      </div>

      {/* consumables by category */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
        <div style={{ fontSize: 16, fontWeight: 700 }}>สต็อกวัสดุสิ้นเปลืองคงเหลือ (แยกตามหมวด)</div>
        <div style={{ fontSize: 12, color: '#8b94a3' }}>{vals.lowStockCount} รายการควรเบิกเติม</div>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {vals.consumableCategoryGroups.map((cg) => (
          <div key={cg.category} style={card}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 16px', background: '#2a303c' }}>
              <div style={{ fontWeight: 700, fontSize: 13.5 }}>{cg.category}</div>
              <div style={{ fontSize: 11.5, color: '#8b94a3' }}>{cg.count} รายการ</div>
            </div>
            {cg.items.map((it) => (
              <div key={it.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 16px', borderTop: '1px solid #333b48', gap: 12 }}>
                <div style={{ fontWeight: 600, fontSize: 13 }}>{it.name}</div>
                <div style={{ fontSize: 12.5, color: '#8b94a3' }}>
                  คงเหลือ {it.qty} {it.unit} / ขั้นต่ำ {it.threshold}
                </div>
                <div style={{ background: it.badgeBg, color: it.badgeColor, fontSize: 11.5, fontWeight: 700, padding: '3px 9px', borderRadius: 999, whiteSpace: 'nowrap' }}>{it.badgeText}</div>
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

const assetGrid = {
  display: 'grid',
  gridTemplateColumns: '1.3fr 0.7fr 0.9fr 0.9fr 0.7fr 0.7fr 2fr',
  gap: 8,
};

function Kpi({ label, value, color }) {
  return (
    <div style={{ background: '#262c38', border: '1px solid #333b48', borderRadius: 14, padding: 18 }}>
      <div style={{ fontSize: 12, color: color || '#8b94a3', marginBottom: 8 }}>{label}</div>
      <div style={{ fontSize: 30, fontWeight: 800, color: color || undefined }}>{value}</div>
    </div>
  );
}

function StatusCard({ label, value, color }) {
  return (
    <div style={{ background: '#262c38', borderLeft: `4px solid ${color}`, borderRadius: 10, padding: '14px 16px' }}>
      <div style={{ fontSize: 12, color: '#8b94a3' }}>{label}</div>
      <div style={{ fontSize: 24, fontWeight: 800, color }}>{value}</div>
    </div>
  );
}
