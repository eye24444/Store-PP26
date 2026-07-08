import { card, pageTitle, pageSub, fieldLabel } from '../components/ui.js';
import { fieldStyle, chipBtn, enabledBtn, submitBtn } from '../lib/theme.js';
import PhotoDropzone from '../components/PhotoDropzone.jsx';
import { CartLine } from './Request.jsx';

export default function Return({ vals }) {
  const { s, api, setState } = vals;

  return (
    <div style={{ maxWidth: 720 }}>
      <div style={pageTitle}>คืนของ</div>
      <div style={pageSub}>เลือกทรัพย์สินที่ถืออยู่ได้หลายชิ้น แนบรูปถ่ายสภาพของ แล้วส่งคืนพร้อมกัน</div>

      <div style={{ ...card, padding: 18, display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 18 }}>
        <div style={{ display: 'flex', gap: 10, alignItems: 'flex-end', flexWrap: 'wrap' }}>
          <div style={{ flex: 1, minWidth: 220 }}>
            <div style={fieldLabel}>เลือกทรัพย์สินที่จะคืน</div>
            <select value={s.retDraftAssetId} onChange={(e) => setState({ retDraftAssetId: e.target.value })} style={fieldStyle}>
              <option value="">-- เลือกรหัสทรัพย์สิน --</option>
              {vals.heldAssetsForDraft.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.code} — {a.name} (อยู่กับ {a.holderName})
                </option>
              ))}
            </select>
          </div>
          <div style={{ minWidth: 220 }}>
            <div style={fieldLabel}>สภาพเมื่อคืน</div>
            <div style={{ display: 'flex', gap: 8 }}>
              <button style={chipBtn(s.retDraftCondition === 'ok', '#34c471')} onClick={() => setState({ retDraftCondition: 'ok' })}>
                ปกติ
              </button>
              <button style={chipBtn(s.retDraftCondition === 'repair', '#4a90d9')} onClick={() => setState({ retDraftCondition: 'repair' })}>
                ส่งซ่อม
              </button>
              <button style={chipBtn(s.retDraftCondition === 'damaged', '#e0555f')} onClick={() => setState({ retDraftCondition: 'damaged' })}>
                ชำรุด
              </button>
            </div>
          </div>
          <button disabled={vals.retAddDisabled} style={enabledBtn(vals.retAddDisabled)} onClick={api.addRetLine}>
            + เพิ่มรายการ
          </button>
        </div>
        <div>
          <div style={fieldLabel}>หมายเหตุรายการนี้ (ถ้ามี)</div>
          <input type="text" placeholder="เช่น สายไฟหลุดลุ่ย ต้องเปลี่ยน" value={s.retDraftNote} onChange={(e) => setState({ retDraftNote: e.target.value })} style={fieldStyle} />
        </div>

        {vals.retCartView.length > 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 4 }}>
            {vals.retCartView.map((line) => (
              <CartLine key={line.key} line={line}>
                <div style={{ fontSize: 11.5, color: '#8b94a3' }}>
                  {line.holderName} · <span style={{ color: line.condColor }}>{line.condLabel}</span>
                </div>
              </CartLine>
            ))}
          </div>
        ) : (
          <div style={{ textAlign: 'center', color: '#8b94a3', fontSize: 12.5, padding: '8px 0' }}>ยังไม่มีรายการที่จะคืน</div>
        )}
      </div>

      <div style={{ ...card, padding: 20, display: 'flex', flexDirection: 'column', gap: 14 }}>
        <div>
          <div style={fieldLabel}>ถ่ายรูปหลักฐานการคืน (ทั้งชุด)</div>
          <PhotoDropzone id="retPhotoInput" photo={s.retPhoto} label={s.retPhoto ? 'แนบรูปแล้ว' : 'ยังไม่ได้แนบรูป (จำเป็น)'} onChange={(e) => api.handlePhoto(e, 'retPhoto')} />
        </div>
        <button disabled={vals.retSubmitDisabled} style={submitBtn(vals.retSubmitDisabled)} onClick={api.submitReturn}>
          ส่งคืนของ ({vals.retCartView.length} รายการ)
        </button>
      </div>
    </div>
  );
}
