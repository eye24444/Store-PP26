import { card, pageTitle, pageSub, sectionTitle } from '../components/ui.js';
import { activeBtn } from '../lib/theme.js';

export default function Reports({ vals }) {
  const { s, setState } = vals;

  return (
    <div>
      <div style={pageTitle}>รายงานสรุป</div>
      <div style={pageSub}>สรุปการเบิก-คืนตามช่วงเวลา</div>

      <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
        <button style={activeBtn(s.reportPeriod === 'day')} onClick={() => setState({ reportPeriod: 'day' })}>
          วัน
        </button>
        <button style={activeBtn(s.reportPeriod === 'week')} onClick={() => setState({ reportPeriod: 'week' })}>
          สัปดาห์
        </button>
        <button style={activeBtn(s.reportPeriod === 'month')} onClick={() => setState({ reportPeriod: 'month' })}>
          เดือน
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 18, marginBottom: 24 }}>
        <div style={{ ...card, padding: 18 }}>
          <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 12 }}>เบิกมากที่สุด (ตามบุคคล)</div>
          {vals.topPersons.map((p) => (
            <Rank key={p.name} name={p.name} count={p.count} />
          ))}
        </div>
        <div style={{ ...card, padding: 18 }}>
          <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 12 }}>งานที่เบิกใช้มากที่สุด</div>
          {vals.topJobs.map((j) => (
            <Rank key={j.name} name={j.name} count={j.count} />
          ))}
        </div>
      </div>

      <div style={sectionTitle}>สรุปรายวัน (คลิกเพื่อดูรายละเอียด)</div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 24 }}>
        {vals.dailyGroups.map((d) => (
          <div key={d.date} style={card}>
            <div onClick={d.onToggle} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 18px', cursor: 'pointer' }}>
              <div style={{ fontWeight: 700, fontSize: 14 }}>{d.date}</div>
              <div style={{ display: 'flex', gap: 14, alignItems: 'center' }}>
                <div style={{ fontSize: 12.5, color: '#f5a623', fontWeight: 600 }}>เบิก {d.borrowCount}</div>
                <div style={{ fontSize: 12.5, color: '#34c471', fontWeight: 600 }}>คืน {d.returnCount}</div>
                <div style={{ color: '#8b94a3', fontSize: 13 }}>{d.arrow}</div>
              </div>
            </div>
            {d.expanded && (
              <div style={{ borderTop: '1px solid #333b48' }}>
                {d.items.map((t) => (
                  <div key={t.key} style={{ ...dailyGrid, padding: '10px 18px', borderTop: '1px solid #2c323e', fontSize: 12.5 }}>
                    <div style={{ color: t.actionColor, fontWeight: 600 }}>{t.action}</div>
                    <div>{t.person}</div>
                    <div>{t.item}</div>
                    <div style={{ color: '#8b94a3' }}>{t.job}</div>
                    <div style={{ color: '#8b94a3' }}>{t.costCode}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

      <div style={sectionTitle}>ประวัติการเบิก-คืนทั้งหมด</div>
      <div style={card}>
        <div style={{ ...txGrid, padding: '12px 16px', background: '#2a303c', fontSize: 12, color: '#8b94a3', fontWeight: 700 }}>
          <div>วันที่</div>
          <div>บุคคล</div>
          <div>รายการ</div>
          <div>ของ</div>
          <div>งาน/หน่วยงาน</div>
          <div>Cost Code</div>
        </div>
        {vals.transactionsView.map((t) => (
          <div key={t.key} style={{ ...txGrid, padding: '11px 16px', borderTop: '1px solid #333b48', fontSize: 13 }}>
            <div>{t.date}</div>
            <div>{t.person}</div>
            <div style={{ color: t.actionColor, fontWeight: 600 }}>{t.action}</div>
            <div>{t.item}</div>
            <div style={{ color: '#8b94a3' }}>{t.job}</div>
            <div style={{ color: '#8b94a3' }}>{t.costCode}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

const dailyGrid = { display: 'grid', gridTemplateColumns: '0.8fr 1fr 1.6fr 1.2fr 1fr', gap: 8 };
const txGrid = { display: 'grid', gridTemplateColumns: '1fr 1.2fr 0.8fr 1.6fr 1.2fr 1fr', gap: 8 };

function Rank({ name, count }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '9px 0', borderTop: '1px solid #333b48', fontSize: 13 }}>
      <div>{name}</div>
      <div style={{ fontWeight: 700, color: '#f5a623' }}>{count} ครั้ง</div>
    </div>
  );
}
