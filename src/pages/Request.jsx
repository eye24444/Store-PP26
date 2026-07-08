import { card, pageTitle, pageSub, fieldLabel } from '../components/ui.js';
import { fieldStyle, reqTypeBtn, enabledBtn, submitBtn } from '../lib/theme.js';
import Thumb from '../components/Thumb.jsx';
import PhotoDropzone from '../components/PhotoDropzone.jsx';

export default function Request({ vals }) {
  const { s, api, setState } = vals;

  return (
    <div style={{ maxWidth: 720 }}>
      <div style={pageTitle}>เบิกของ</div>
      <div style={pageSub}>เบิกได้หลายรายการต่อครั้ง ผสมทรัพย์สินและของสิ้นเปลืองได้ ทุกครั้งต้องแนบรูปหลักฐาน</div>

      {/* header fields */}
      <div style={{ ...card, padding: 20, display: 'flex', flexDirection: 'column', gap: 14, marginBottom: 18 }}>
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
          <div style={{ flex: 1, minWidth: 180 }}>
            <div style={fieldLabel}>ผู้เบิก (สตาฟ)</div>
            <select value={s.reqStaffId} onChange={(e) => setState({ reqStaffId: e.target.value })} style={fieldStyle}>
              <option value="">-- เลือกสตาฟ --</option>
              {vals.staffList.map((st) => (
                <option key={st.id} value={st.id}>
                  {st.name} ({st.position})
                </option>
              ))}
            </select>
          </div>
          <div style={{ flex: 1, minWidth: 160 }}>
            <div style={fieldLabel}>ใช้ในงาน / หน่วยงาน</div>
            <input type="text" placeholder="เช่น Base Slab" value={s.reqJob} onChange={(e) => setState({ reqJob: e.target.value })} style={fieldStyle} />
          </div>
          <div style={{ width: 130 }}>
            <div style={fieldLabel}>Cost Code</div>
            <input type="text" placeholder="CC-001" value={s.reqCostCode} onChange={(e) => setState({ reqCostCode: e.target.value })} style={fieldStyle} />
          </div>
        </div>
      </div>

      {/* add line */}
      <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 10 }}>เพิ่มรายการที่จะเบิก</div>
      <div style={{ ...card, padding: 18, display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 18 }}>
        <div style={{ display: 'flex', gap: 8 }}>
          <button style={reqTypeBtn(s.reqDraftType === 'asset')} onClick={() => setState({ reqDraftType: 'asset' })}>
            ทรัพย์สิน / ครุภัณฑ์
          </button>
          <button style={reqTypeBtn(s.reqDraftType === 'consumable')} onClick={() => setState({ reqDraftType: 'consumable' })}>
            ของสิ้นเปลือง
          </button>
        </div>

        <div style={{ display: 'flex', gap: 10, alignItems: 'flex-end', flexWrap: 'wrap' }}>
          {s.reqDraftType === 'asset' ? (
            <div style={{ flex: 1, minWidth: 220 }}>
              <div style={fieldLabel}>เลือกทรัพย์สิน (พร้อมเบิกเท่านั้น)</div>
              <select value={s.reqDraftAssetId} onChange={(e) => setState({ reqDraftAssetId: e.target.value })} style={fieldStyle}>
                <option value="">-- เลือกรหัสทรัพย์สิน --</option>
                {vals.availableAssetsForDraft.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.code} — {a.category} ({a.name})
                  </option>
                ))}
              </select>
            </div>
          ) : (
            <>
              <div style={{ flex: 1, minWidth: 200 }}>
                <div style={fieldLabel}>เลือกของสิ้นเปลือง</div>
                <select value={s.reqDraftConsumableId} onChange={(e) => setState({ reqDraftConsumableId: e.target.value })} style={fieldStyle}>
                  <option value="">-- เลือกรายการ --</option>
                  {vals.consumablesForDraft.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.category} · {c.name} (คงเหลือ {c.qty} {c.unit})
                    </option>
                  ))}
                </select>
              </div>
              <div style={{ width: 100 }}>
                <div style={fieldLabel}>จำนวน</div>
                <input type="number" min="1" value={s.reqDraftQty} onChange={(e) => setState({ reqDraftQty: e.target.value })} style={fieldStyle} />
              </div>
            </>
          )}
          <button disabled={vals.reqAddDisabled} style={enabledBtn(vals.reqAddDisabled)} onClick={api.addReqLine}>
            + เพิ่มรายการ
          </button>
        </div>

        {vals.reqCartView.length > 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 4 }}>
            {vals.reqCartView.map((line) => (
              <CartLine key={line.key} line={line}>
                <div style={{ fontSize: 11.5, color: '#8b94a3' }}>
                  {line.typeLabel} · {line.qtyText}
                </div>
              </CartLine>
            ))}
          </div>
        ) : (
          <div style={{ textAlign: 'center', color: '#8b94a3', fontSize: 12.5, padding: '8px 0' }}>ยังไม่มีรายการในคำขอนี้</div>
        )}
      </div>

      {/* photo + submit */}
      <div style={{ ...card, padding: 20, display: 'flex', flexDirection: 'column', gap: 14 }}>
        <div>
          <div style={fieldLabel}>ถ่ายรูปหลักฐานการเบิก (ทั้งชุด)</div>
          <PhotoDropzone id="reqPhotoInput" photo={s.reqPhoto} label={s.reqPhoto ? 'แนบรูปแล้ว' : 'ยังไม่ได้แนบรูป (จำเป็น)'} onChange={(e) => api.handlePhoto(e, 'reqPhoto')} />
        </div>
        <button disabled={vals.reqSubmitDisabled} style={submitBtn(vals.reqSubmitDisabled)} onClick={api.submitRequest}>
          ส่งคำขอเบิก ({vals.reqCartView.length} รายการ)
        </button>
      </div>
    </div>
  );
}

export function CartLine({ line, children }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12, background: '#2a303c', borderRadius: 10, padding: '10px 12px' }}>
      <Thumb size={36} photo={line.photo} />
      <div style={{ flex: 1 }}>
        <div style={{ fontWeight: 600, fontSize: 13.5 }}>{line.label}</div>
        {children}
      </div>
      <button style={{ border: 'none', background: '#3a4150', color: '#e9edf2', width: 26, height: 26, borderRadius: 7, cursor: 'pointer', fontWeight: 700 }} onClick={line.onRemove}>
        ×
      </button>
    </div>
  );
}
