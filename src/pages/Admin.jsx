import { card, pageTitle, pageSub, smallLabel } from '../components/ui.js';
import { smallToggleBtn, enabledBtn, smallFieldStyle } from '../lib/theme.js';
import Thumb from '../components/Thumb.jsx';
import ScrollX from '../components/ScrollX.jsx';

const editInput = { padding: '7px 9px', borderRadius: 7, background: '#2f3644', border: '1px solid #3a4150', color: '#e9edf2', fontFamily: 'inherit', fontSize: 12.5, width: '100%' };
const iconBtn = (bg, color, border) => ({ border: border || 'none', background: bg, color, borderRadius: 7, padding: '0 9px', height: 28, cursor: 'pointer', fontSize: 11.5, fontFamily: 'inherit' });

export default function Admin({ vals }) {
  const { s, api, setState } = vals;

  return (
    <div>
      <div style={pageTitle}>ผู้ดูแลสโตร์</div>
      <div style={pageSub}>อนุมัติคำขอ จัดการข้อมูลวัสดุ/ทรัพย์สิน และข้อมูลสตาฟ</div>

      <div style={{ display: 'flex', gap: 8, marginBottom: 20, flexWrap: 'wrap' }}>
        <button style={smallToggleBtn(s.adminTab === 'requests')} onClick={() => setState({ adminTab: 'requests' })}>
          คำขอรออนุมัติ ({vals.pendingCount})
        </button>
        <button style={smallToggleBtn(s.adminTab === 'consumables')} onClick={() => setState({ adminTab: 'consumables' })}>
          วัสดุสิ้นเปลือง
        </button>
        <button style={smallToggleBtn(s.adminTab === 'assets')} onClick={() => setState({ adminTab: 'assets' })}>
          ทรัพย์สิน/ครุภัณฑ์
        </button>
        <button style={smallToggleBtn(s.adminTab === 'staff')} onClick={() => setState({ adminTab: 'staff' })}>
          พนักงาน/สตาฟ
        </button>
      </div>

      {s.adminTab === 'requests' && <RequestsTab vals={vals} />}
      {s.adminTab === 'consumables' && <ConsumablesTab vals={vals} />}
      {s.adminTab === 'assets' && <AssetsTab vals={vals} />}
      {s.adminTab === 'staff' && <StaffTab vals={vals} />}
    </div>
  );
}

function RequestsTab({ vals }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      {vals.pendingView.length > 0 ? (
        vals.pendingView.map((p) => (
          <div key={p.id} style={{ ...card, padding: '16px 18px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap', marginBottom: 10 }}>
              {p.hasPhoto ? (
                <Thumb size={56} photo={p.photo} showNoPhoto={false} />
              ) : (
                <div style={{ width: 56, height: 56, borderRadius: 10, background: '#2f3644', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, color: '#8b94a3' }}>ไม่มีรูป</div>
              )}
              <div style={{ flex: 1, minWidth: 200 }}>
                <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 2 }}>
                  {p.kindLabel} · {p.staffName}
                </div>
                <div style={{ fontSize: 12, color: '#8b94a3' }}>
                  {p.job} · {p.costCode} · {p.date} · {p.lineCountText}
                </div>
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                <button style={{ border: 'none', cursor: 'pointer', padding: '9px 16px', borderRadius: 9, fontWeight: 700, fontSize: 13, background: '#34c471', color: '#12271a', fontFamily: 'inherit' }} onClick={p.onApprove}>
                  อนุมัติทั้งหมด
                </button>
                <button style={{ border: 'none', cursor: 'pointer', padding: '9px 16px', borderRadius: 9, fontWeight: 700, fontSize: 13, background: '#3a4150', color: '#e9edf2', fontFamily: 'inherit' }} onClick={p.onReject}>
                  ปฏิเสธ
                </button>
              </div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6, paddingLeft: 4 }}>
              {p.lines.map((ln) => (
                <div key={ln.key} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12.5, color: '#c3cad4', background: '#2a303c', borderRadius: 8, padding: '7px 12px' }}>
                  <div>{ln.label}</div>
                  <div style={{ color: '#8b94a3' }}>{ln.detail}</div>
                </div>
              ))}
            </div>
          </div>
        ))
      ) : (
        <div style={{ background: '#262c38', border: '1px dashed #3a4150', borderRadius: 14, padding: 24, textAlign: 'center', color: '#8b94a3', fontSize: 13 }}>ไม่มีคำขอค้างอนุมัติ</div>
      )}
    </div>
  );
}

function ConsumablesTab({ vals }) {
  const { s, api, setState } = vals;
  const grid = { display: 'grid', gridTemplateColumns: '0.6fr 0.7fr 1.3fr 1fr 0.7fr 0.7fr 0.9fr 1.8fr', gap: 8 };
  const disabled = vals.newConsumableDisabled;

  return (
    <>
      <div style={{ ...card, marginBottom: 18 }}>
        <ScrollX minWidth={780}>
        <div style={{ ...grid, padding: '12px 16px', background: '#2a303c', fontSize: 11.5, color: '#8b94a3', fontWeight: 700 }}>
          <div>รูป</div>
          <div>รหัส</div>
          <div>รายการ</div>
          <div>หมวด</div>
          <div>คงเหลือ</div>
          <div>ขั้นต่ำ</div>
          <div>สถานะ</div>
          <div>จัดการ</div>
        </div>
        {vals.consumablesView.map((c) => (
          <div key={c.id} style={{ ...grid, padding: '10px 16px', borderTop: '1px solid #333b48', fontSize: 12.5, alignItems: 'center' }}>
            <PhotoCell id={c.photoInputId} photo={c.photo} onChange={c.onPhotoChange} />
            <div style={{ color: '#8b94a3' }}>{c.code}</div>
            {c.editing ? <input value={c.name} onChange={c.onNameChange} style={editInput} /> : <div style={{ fontWeight: 600 }}>{c.name}</div>}
            {c.editing ? <input value={c.category} onChange={c.onCategoryChange} style={editInput} /> : <div style={{ color: '#8b94a3' }}>{c.category}</div>}
            {c.editing ? (
              <input type="number" value={c.qty} onChange={c.onQtyChange} style={editInput} />
            ) : (
              <div>
                {c.qty} {c.unit}
              </div>
            )}
            {c.editing ? <input type="number" value={c.threshold} onChange={c.onThresholdChange} style={editInput} /> : <div style={{ color: '#8b94a3' }}>{c.threshold}</div>}
            <div style={{ color: c.statusColor, fontWeight: 700 }}>{c.statusLabel}</div>
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
              <button style={iconBtn('#2f3644', '#e9edf2', '1px solid #3a4150')} onClick={c.onDec}>
                −5
              </button>
              <button style={iconBtn('#2f3644', '#e9edf2', '1px solid #3a4150')} onClick={c.onInc}>
                +5
              </button>
              <button style={iconBtn('#3a4150', '#e9edf2')} onClick={c.onToggleEdit}>
                {c.editLabel}
              </button>
              <button style={iconBtn('#e0555f', '#fff')} onClick={c.onDelete}>
                ลบ
              </button>
            </div>
          </div>
        ))}
        </ScrollX>
      </div>

      <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 10 }}>เพิ่มรายการวัสดุสิ้นเปลืองใหม่</div>
      <div style={{ ...card, padding: 16, display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'flex-end' }}>
        <AddField w={100} label="รหัส" value={s.newConsumableCode} onChange={(e) => setState({ newConsumableCode: e.target.value })} />
        <AddField grow label="ชื่อรายการ" value={s.newConsumableName} onChange={(e) => setState({ newConsumableName: e.target.value })} />
        <AddField grow label="หมวด" value={s.newConsumableCategory} onChange={(e) => setState({ newConsumableCategory: e.target.value })} />
        <AddField w={80} label="หน่วย" value={s.newConsumableUnit} onChange={(e) => setState({ newConsumableUnit: e.target.value })} />
        <AddField w={80} label="จำนวน" type="number" value={s.newConsumableQty} onChange={(e) => setState({ newConsumableQty: e.target.value })} />
        <AddField w={80} label="ขั้นต่ำ" type="number" value={s.newConsumableThreshold} onChange={(e) => setState({ newConsumableThreshold: e.target.value })} />
        <button disabled={disabled} style={enabledBtn(disabled)} onClick={api.addConsumable}>
          + เพิ่ม
        </button>
      </div>
    </>
  );
}

function AssetsTab({ vals }) {
  const { s, api, setState } = vals;
  const grid = { display: 'grid', gridTemplateColumns: '0.6fr 0.8fr 1fr 1.1fr 1fr 1.3fr 1.6fr', gap: 8 };
  const disabled = vals.newAssetDisabled;

  return (
    <>
      <div style={{ ...card, marginBottom: 18 }}>
        <ScrollX minWidth={760}>
        <div style={{ ...grid, padding: '12px 16px', background: '#2a303c', fontSize: 11.5, color: '#8b94a3', fontWeight: 700 }}>
          <div>รูป</div>
          <div>รหัส</div>
          <div>ประเภท</div>
          <div>รุ่น/ยี่ห้อ</div>
          <div>สถานะ</div>
          <div>อยู่กับ/หน่วยงาน</div>
          <div>จัดการ</div>
        </div>
        {vals.assetsAdminView.map((a) => (
          <div key={a.id} style={{ ...grid, padding: '10px 16px', borderTop: '1px solid #333b48', fontSize: 12.5, alignItems: 'center' }}>
            <PhotoCell id={a.photoInputId} photo={a.photo} onChange={a.onPhotoChange} />
            <div style={{ fontWeight: 700 }}>{a.code}</div>
            {a.editing ? <input value={a.category} onChange={a.onCategoryChange} style={editInput} /> : <div>{a.category}</div>}
            {a.editing ? <input value={a.name} onChange={a.onNameChange} style={editInput} /> : <div style={{ color: '#8b94a3' }}>{a.name}</div>}
            {a.editing ? (
              <select value={a.status} onChange={a.onStatusChange} style={{ ...editInput, fontSize: 12 }}>
                <option value="available">พร้อมเบิก</option>
                <option value="in_use">ใช้งานอยู่</option>
                <option value="repair">ส่งซ่อม</option>
                <option value="damaged">ชำรุด</option>
                <option value="lost">หาย</option>
              </select>
            ) : (
              <div style={{ color: a.statusColor, fontWeight: 700 }}>{a.statusLabel}</div>
            )}
            <div style={{ color: '#8b94a3', fontSize: 11.5 }}>{a.holderSiteText}</div>
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
              <button style={iconBtn('#3a4150', '#e9edf2')} onClick={a.onToggleEdit}>
                {a.editLabel}
              </button>
              <button style={iconBtn('#e0555f', '#fff')} onClick={a.onDelete}>
                ลบ
              </button>
            </div>
          </div>
        ))}
        </ScrollX>
      </div>

      <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 10 }}>เพิ่มทรัพย์สินใหม่</div>
      <div style={{ ...card, padding: 16, display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'flex-end' }}>
        <AddField w={110} label="รหัส" value={s.newAssetCode} onChange={(e) => setState({ newAssetCode: e.target.value })} />
        <AddField grow label="ประเภท" placeholder="เช่น สกัด, ปั๊มน้ำ" value={s.newAssetCategory} onChange={(e) => setState({ newAssetCategory: e.target.value })} />
        <AddField grow label="รุ่น/ยี่ห้อ" value={s.newAssetName} onChange={(e) => setState({ newAssetName: e.target.value })} />
        <button disabled={disabled} style={enabledBtn(disabled)} onClick={api.addAsset}>
          + เพิ่ม
        </button>
      </div>
    </>
  );
}

function StaffTab({ vals }) {
  const { s, api, setState } = vals;
  const grid = { display: 'grid', gridTemplateColumns: '0.6fr 1.3fr 1.1fr 1.1fr 1.4fr', gap: 8 };
  const disabled = vals.newStaffDisabled;

  return (
    <>
      <div style={{ ...card, marginBottom: 18 }}>
        <ScrollX minWidth={560}>
        <div style={{ ...grid, padding: '12px 16px', background: '#2a303c', fontSize: 12, color: '#8b94a3', fontWeight: 700 }}>
          <div>รูป</div>
          <div>ชื่อ</div>
          <div>เบอร์โทร</div>
          <div>ตำแหน่ง</div>
          <div>จัดการ</div>
        </div>
        {vals.staffView.map((st) => (
          <div key={st.id} style={{ ...grid, padding: '10px 16px', borderTop: '1px solid #333b48', fontSize: 13, alignItems: 'center' }}>
            <PhotoCell id={st.photoInputId} photo={st.photo} onChange={st.onPhotoChange} />
            {st.editing ? <input value={st.name} onChange={st.onNameChange} style={{ ...editInput, fontSize: 13 }} /> : <div style={{ fontWeight: 600 }}>{st.name}</div>}
            {st.editing ? <input value={st.phone} onChange={st.onPhoneChange} style={{ ...editInput, fontSize: 13 }} /> : <div style={{ color: '#8b94a3' }}>{st.phone}</div>}
            {st.editing ? <input value={st.position} onChange={st.onPositionChange} style={{ ...editInput, fontSize: 13 }} /> : <div style={{ color: '#8b94a3' }}>{st.position}</div>}
            <div style={{ display: 'flex', gap: 6 }}>
              <button style={{ ...iconBtn('#3a4150', '#e9edf2'), padding: '0 10px', height: 30, fontSize: 12 }} onClick={st.onToggleEdit}>
                {st.editLabel}
              </button>
              <button style={{ ...iconBtn('#e0555f', '#fff'), padding: '0 10px', height: 30, fontSize: 12 }} onClick={st.onDelete}>
                ลบ
              </button>
            </div>
          </div>
        ))}
        </ScrollX>
      </div>

      <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 10 }}>เพิ่มพนักงานใหม่</div>
      <div style={{ ...card, padding: 16, display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'flex-end' }}>
        <AddField grow label="ชื่อ-สกุล" value={s.newStaffName} onChange={(e) => setState({ newStaffName: e.target.value })} />
        <AddField w={150} label="เบอร์โทร" value={s.newStaffPhone} onChange={(e) => setState({ newStaffPhone: e.target.value })} />
        <AddField grow label="ตำแหน่ง" value={s.newStaffPosition} onChange={(e) => setState({ newStaffPosition: e.target.value })} />
        <button disabled={disabled} style={enabledBtn(disabled)} onClick={api.addStaff}>
          + เพิ่ม
        </button>
      </div>
    </>
  );
}

function PhotoCell({ id, photo, onChange }) {
  return (
    <div>
      <label htmlFor={id} style={{ cursor: 'pointer', display: 'block' }}>
        <Thumb size={40} photo={photo} />
      </label>
      <input id={id} type="file" accept="image/*" onChange={onChange} style={{ display: 'none' }} />
    </div>
  );
}

function AddField({ label, value, onChange, type = 'text', placeholder, w, grow }) {
  return (
    <div style={grow ? { flex: 1, minWidth: 130 } : { width: w }}>
      <div style={smallLabel}>{label}</div>
      <input type={type} placeholder={placeholder} value={value} onChange={onChange} style={smallFieldStyle} />
    </div>
  );
}
