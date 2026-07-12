import { card, pageTitle, pageSub, sectionTitle, fieldLabel, smallLabel } from '../components/ui.js';
import { fieldStyle, smallFieldStyle, reqTypeBtn, enabledBtn, submitBtn } from '../lib/theme.js';
import PhotoDropzone from '../components/PhotoDropzone.jsx';

export default function GoodsIn({ vals }) {
  const { s, api, setState, isAdminRole } = vals;

  return (
    <div style={{ maxWidth: 760 }}>
      <div style={pageTitle}>รับของเข้า</div>
      <div style={pageSub}>บันทึกของที่รับเข้าสโตร์ (ทรัพย์สิน + วัสดุสิ้นเปลือง) — สต็อกจะเพิ่มให้อัตโนมัติ</div>

      {/* ---- record form (admin only) ---- */}
      {isAdminRole ? (
        <>
          <div style={{ ...card, padding: 18, display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 18 }}>
            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
              <div style={{ width: 160 }}>
                <div style={fieldLabel}>วันที่รับเข้า</div>
                <input value={s.rcDate} onChange={(e) => setState({ rcDate: e.target.value })} style={fieldStyle} />
              </div>
              <div style={{ flex: 1, minWidth: 200 }}>
                <div style={fieldLabel}>หมายเหตุ (ถ้ามี)</div>
                <input placeholder="เช่น รับจากสโตร์กลาง / ผู้ขาย ABC" value={s.rcNote} onChange={(e) => setState({ rcNote: e.target.value })} style={fieldStyle} />
              </div>
            </div>

            <div style={{ display: 'flex', gap: 8 }}>
              <button style={reqTypeBtn(s.rcDraftType === 'consumable')} onClick={() => setState({ rcDraftType: 'consumable' })}>
                ของสิ้นเปลือง
              </button>
              <button style={reqTypeBtn(s.rcDraftType === 'asset')} onClick={() => setState({ rcDraftType: 'asset' })}>
                ทรัพย์สิน / ครุภัณฑ์
              </button>
            </div>

            {s.rcDraftType === 'consumable' ? (
              <div style={{ display: 'flex', gap: 10, alignItems: 'flex-end', flexWrap: 'wrap' }}>
                <div style={{ flex: 1, minWidth: 200 }}>
                  <div style={fieldLabel}>เลือกรายการวัสดุ</div>
                  <select value={s.rcDraftConsumableId} onChange={(e) => setState({ rcDraftConsumableId: e.target.value })} style={fieldStyle}>
                    <option value="">-- เลือกรายการ --</option>
                    {s.consumables.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.category} · {c.name} (คงเหลือ {c.qty} {c.unit})
                      </option>
                    ))}
                  </select>
                </div>
                <div style={{ width: 110 }}>
                  <div style={fieldLabel}>จำนวนรับเข้า</div>
                  <input type="number" min="1" value={s.rcDraftQty} onChange={(e) => setState({ rcDraftQty: e.target.value })} style={fieldStyle} />
                </div>
                <button disabled={vals.rcAddDisabled} style={enabledBtn(vals.rcAddDisabled)} onClick={api.addReceiptLine}>
                  + เพิ่มรายการ
                </button>
              </div>
            ) : (
              <div style={{ display: 'flex', gap: 10, alignItems: 'flex-end', flexWrap: 'wrap' }}>
                <div style={{ flex: 1, minWidth: 140 }}>
                  <div style={fieldLabel}>ประเภท</div>
                  <input placeholder="เช่น สกัด, ปั๊มน้ำ" value={s.rcDraftAssetCategory} onChange={(e) => setState({ rcDraftAssetCategory: e.target.value })} style={fieldStyle} />
                </div>
                <div style={{ flex: 1, minWidth: 150 }}>
                  <div style={fieldLabel}>รุ่น/ยี่ห้อ</div>
                  <input placeholder="เช่น Hilti TE1000" value={s.rcDraftAssetName} onChange={(e) => setState({ rcDraftAssetName: e.target.value })} style={fieldStyle} />
                </div>
                <div style={{ width: 110 }}>
                  <div style={fieldLabel}>จำนวน (ชิ้น)</div>
                  <input type="number" min="1" value={s.rcDraftAssetQty} onChange={(e) => setState({ rcDraftAssetQty: e.target.value })} style={fieldStyle} />
                </div>
                <button disabled={vals.rcAddDisabled} style={enabledBtn(vals.rcAddDisabled)} onClick={api.addReceiptLine}>
                  + เพิ่มรายการ
                </button>
              </div>
            )}
            <div style={{ fontSize: 11.5, color: '#8b94a3' }}>
              💡 ทรัพย์สินจะถูกสร้างเป็นชิ้น ๆ พร้อมออกรหัสให้อัตโนมัติ (เปลี่ยนรหัสภายหลังได้ในหน้าผู้ดูแลสโตร์)
            </div>

            {vals.rcCartView.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {vals.rcCartView.map((line) => (
                  <div key={line.key} style={{ display: 'flex', alignItems: 'center', gap: 12, background: '#2a303c', borderRadius: 10, padding: '10px 12px' }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 600, fontSize: 13.5 }}>{line.label}</div>
                      <div style={{ fontSize: 11.5, color: '#8b94a3' }}>
                        {line.typeLabel} · รับเข้า {line.qtyText}
                      </div>
                    </div>
                    <button style={{ border: 'none', background: '#3a4150', color: '#e9edf2', width: 26, height: 26, borderRadius: 7, cursor: 'pointer', fontWeight: 700 }} onClick={line.onRemove}>
                      ×
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div style={{ textAlign: 'center', color: '#8b94a3', fontSize: 12.5, padding: '8px 0' }}>ยังไม่มีรายการรับเข้า</div>
            )}

            <div>
              <div style={fieldLabel}>รูปหลักฐาน (ถ้ามี)</div>
              <PhotoDropzone id="rcPhotoInput" photo={s.rcPhoto} label={s.rcPhoto ? 'แนบรูปแล้ว' : 'แนบรูป (ไม่บังคับ)'} onChange={(e) => api.handlePhoto(e, 'rcPhoto')} />
            </div>

            <button disabled={vals.rcSubmitDisabled} style={submitBtn(vals.rcSubmitDisabled)} onClick={api.submitReceipt}>
              บันทึกรับของเข้า ({vals.rcCartView.length} รายการ)
            </button>
          </div>
        </>
      ) : (
        <div style={{ background: '#262c38', border: '1px dashed #3a4150', borderRadius: 14, padding: 18, marginBottom: 18, color: '#8b94a3', fontSize: 13 }}>
          การบันทึกรับของเข้าทำได้เฉพาะโหมดผู้ดูแลสโตร์ (กด Store 🔒 แล้วใส่รหัส) — ด้านล่างคือประวัติการรับเข้า
        </div>
      )}

      {/* ---- history ---- */}
      <div style={sectionTitle}>ประวัติการรับของเข้า</div>
      {vals.receiptsView.length > 0 ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {vals.receiptsView.map((r) => (
            <div key={r.id} style={card}>
              <div onClick={r.onToggle} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 18px', cursor: 'pointer', gap: 12 }}>
                <div>
                  <div style={{ fontWeight: 700, fontSize: 14 }}>รับเข้าวันที่ {r.date}</div>
                  {r.note ? <div style={{ fontSize: 11.5, color: '#8b94a3' }}>{r.note}</div> : null}
                </div>
                <div style={{ display: 'flex', gap: 14, alignItems: 'center' }}>
                  <div style={{ fontSize: 12.5, color: '#34c471', fontWeight: 600 }}>{r.lineCountText}</div>
                  <div style={{ fontSize: 12, color: '#8b94a3' }}>{r.totalText}</div>
                  <div style={{ color: '#8b94a3', fontSize: 13 }}>{r.arrow}</div>
                </div>
              </div>
              {r.expanded ? (
                <div style={{ borderTop: '1px solid #333b48' }}>
                  {r.lines.map((l, i) => (
                    <div key={i} style={{ display: 'flex', justifyContent: 'space-between', gap: 12, padding: '10px 18px', borderTop: i ? '1px solid #2c323e' : 'none', fontSize: 13 }}>
                      <div>
                        <span style={{ color: '#8b94a3', fontSize: 11.5, marginRight: 8 }}>{l.type}</span>
                        {l.label}
                        {l.codesText ? <div style={{ fontSize: 11, color: '#8b94a3', marginTop: 2 }}>รหัส: {l.codesText}</div> : null}
                      </div>
                      <div style={{ color: '#34c471', fontWeight: 700, whiteSpace: 'nowrap' }}>+{l.qtyText}</div>
                    </div>
                  ))}
                </div>
              ) : null}
            </div>
          ))}
        </div>
      ) : (
        <div style={{ background: '#262c38', border: '1px dashed #3a4150', borderRadius: 14, padding: 24, textAlign: 'center', color: '#8b94a3', fontSize: 13 }}>ยังไม่มีประวัติการรับของเข้า</div>
      )}
    </div>
  );
}
