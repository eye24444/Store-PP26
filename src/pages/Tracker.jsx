import { card, pageTitle, pageSub } from '../components/ui.js';
import { chipBtn } from '../lib/theme.js';
import Thumb from '../components/Thumb.jsx';

export default function Tracker({ vals }) {
  const { s, setState, selectedAsset } = vals;

  return (
    <div>
      <div style={pageTitle}>ติดตามทรัพย์สิน</div>
      <div style={pageSub}>ค้นหาว่าใครถือครองทรัพย์สินอยู่ อยู่หน่วยงานใด หรือใครยังไม่คืน</div>

      <div style={{ display: 'flex', gap: 10, marginBottom: 14, flexWrap: 'wrap' }}>
        <input
          type="text"
          placeholder="ค้นหารหัส / ชื่อ / ผู้ถือครอง / หน่วยงาน"
          value={s.trackerQuery}
          onChange={(e) => setState({ trackerQuery: e.target.value })}
          style={{ flex: 1, minWidth: 220, padding: '11px 14px', borderRadius: 9, background: '#262c38', border: '1px solid #333b48', color: '#e9edf2', fontFamily: 'inherit', fontSize: 14 }}
        />
      </div>
      <div style={{ display: 'flex', gap: 8, marginBottom: 18, flexWrap: 'wrap' }}>
        {FILTERS.map((f) => (
          <button key={f.key} style={chipBtn(s.trackerFilter === f.key, f.color)} onClick={() => setState({ trackerFilter: f.key })}>
            {f.label}
          </button>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1.6fr 1fr 1fr 1fr', gap: 18 }}>
        <div style={{ ...card, maxHeight: 520, overflowY: 'auto' }}>
          <div style={{ ...trackGrid, padding: '12px 16px', background: '#2a303c', fontSize: 12, color: '#8b94a3', fontWeight: 700, position: 'sticky', top: 0 }}>
            <div>รูป</div>
            <div>รหัส</div>
            <div>ชื่อ</div>
            <div>สถานะ</div>
            <div>ถืออยู่กับ</div>
          </div>
          {vals.filteredAssets.map((a) => (
            <div
              key={a.id}
              onClick={a.onSelect}
              style={{ ...trackGrid, padding: '10px 16px', borderTop: '1px solid #333b48', fontSize: 13, cursor: 'pointer', alignItems: 'center' }}
            >
              <Thumb size={40} photo={a.photo} />
              <div style={{ fontWeight: 700 }}>{a.code}</div>
              <div>{a.name}</div>
              <div style={{ color: a.statusColor, fontWeight: 600 }}>{a.statusLabel}</div>
              <div style={{ color: '#8b94a3' }}>{a.holderName}</div>
            </div>
          ))}
        </div>

        <div style={{ gridColumn: 'span 3' }}>
          {selectedAsset ? (
            <div style={{ ...card, padding: 22 }}>
              <div style={{ display: 'flex', gap: 16, alignItems: 'flex-start', marginBottom: 14 }}>
                <Thumb size={64} photo={selectedAsset.photo} />
                <div>
                  <div style={{ fontSize: 22, fontWeight: 800, marginBottom: 2 }}>{selectedAsset.code}</div>
                  <div style={{ color: '#8b94a3' }}>
                    {selectedAsset.category} · {selectedAsset.name}
                  </div>
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, fontSize: 14 }}>
                <Detail label="สถานะ" value={selectedAsset.statusLabel} valueColor={selectedAsset.statusColor} />
                <Detail label="อยู่กับ" value={selectedAsset.holderName} />
                <Detail label="เบิกวันที่" value={selectedAsset.dateText} />
                <Detail label="ใช้ในงาน" value={selectedAsset.siteText} />
                <Detail label="Cost Code" value={selectedAsset.costCodeText} />
              </div>
            </div>
          ) : (
            <div style={{ background: '#262c38', border: '1px dashed #3a4150', borderRadius: 14, padding: 40, textAlign: 'center', color: '#8b94a3', fontSize: 13 }}>
              เลือกทรัพย์สินจากตารางด้านซ้ายเพื่อดูรายละเอียด
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

const trackGrid = { display: 'grid', gridTemplateColumns: '0.9fr 1fr 1.2fr 1fr 1fr', gap: 8 };

const FILTERS = [
  { key: 'all', label: 'ทั้งหมด', color: '#f5a623' },
  { key: 'available', label: 'พร้อมเบิก', color: '#34c471' },
  { key: 'in_use', label: 'มีคนถือ', color: '#f5a623' },
  { key: 'repair', label: 'ส่งซ่อม', color: '#4a90d9' },
  { key: 'damaged', label: 'ชำรุด', color: '#e0555f' },
  { key: 'lost', label: 'หาย', color: '#9b6bea' },
];

function Detail({ label, value, valueColor }) {
  return (
    <div>
      <div style={{ color: '#8b94a3', fontSize: 12, marginBottom: 4 }}>{label}</div>
      <div style={{ fontWeight: 700, color: valueColor }}>{value}</div>
    </div>
  );
}
