import { card, pageTitle, pageSub, sectionTitle, smallLabel, fieldLabel } from '../components/ui.js';
import { fieldStyle, smallFieldStyle, enabledBtn } from '../lib/theme.js';
import Thumb from '../components/Thumb.jsx';
import PhotoDropzone from '../components/PhotoDropzone.jsx';
import ScrollX from '../components/ScrollX.jsx';

export default function Central({ vals }) {
  const { s, api, setState, isAdminRole } = vals;
  const createReqDisabled = !s.newReqDocNo || !s.newReqLines.length;

  return (
    <div>
      <div style={pageTitle}>รับเข้า / คืนสโตร์กลาง</div>
      <div style={pageSub}>ติดตามใบขอใช้จากสโตร์กลาง การรับเข้าของ และการส่งคืนเศษเหล็ก</div>

      <div style={sectionTitle}>ใบขอใช้จากสโตร์กลาง</div>

      {isAdminRole && (
        <div style={{ ...card, padding: 18, marginBottom: 18, display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div style={{ fontSize: 13, fontWeight: 700 }}>สร้างใบขอใช้ใหม่</div>
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            <div style={{ width: 160 }}>
              <div style={smallLabel}>เลขที่เอกสาร</div>
              <input placeholder="104-001" value={s.newReqDocNo} onChange={(e) => setState({ newReqDocNo: e.target.value })} style={smallFieldStyle} />
            </div>
            <div style={{ width: 140 }}>
              <div style={smallLabel}>วันที่</div>
              <input value={s.newReqDate} onChange={(e) => setState({ newReqDate: e.target.value })} style={smallFieldStyle} />
            </div>
          </div>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'flex-end' }}>
            <div style={{ flex: 1, minWidth: 140 }}>
              <div style={smallLabel}>ชื่อรายการ</div>
              <input placeholder="เช่น นั่งร้าน" value={s.newReqLineName} onChange={(e) => setState({ newReqLineName: e.target.value })} style={smallFieldStyle} />
            </div>
            <div style={{ flex: 1, minWidth: 120 }}>
              <div style={smallLabel}>ประเภท</div>
              <input value={s.newReqLineCategory} onChange={(e) => setState({ newReqLineCategory: e.target.value })} style={smallFieldStyle} />
            </div>
            <div style={{ width: 80 }}>
              <div style={smallLabel}>หน่วย</div>
              <input value={s.newReqLineUnit} onChange={(e) => setState({ newReqLineUnit: e.target.value })} style={smallFieldStyle} />
            </div>
            <div style={{ width: 90 }}>
              <div style={smallLabel}>จำนวนขอ</div>
              <input type="number" value={s.newReqLineQty} onChange={(e) => setState({ newReqLineQty: e.target.value })} style={smallFieldStyle} />
            </div>
            <button style={{ border: 'none', cursor: 'pointer', padding: '10px 14px', borderRadius: 8, fontWeight: 700, fontSize: 12.5, fontFamily: 'inherit', background: '#3a4150', color: '#e9edf2' }} onClick={api.addReqLineDraft}>
              + เพิ่มรายการ
            </button>
          </div>
          {s.newReqLines.length > 0 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {s.newReqLines.map((l, idx) => (
                <div key={l.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#2a303c', borderRadius: 8, padding: '8px 12px', fontSize: 12.5 }}>
                  <div>
                    {l.name} · {l.category} · {l.qtyRequested} {l.unit}
                  </div>
                  <button style={{ border: 'none', background: '#3a4150', color: '#e9edf2', width: 24, height: 24, borderRadius: 6, cursor: 'pointer' }} onClick={() => api.removeReqLineDraft(idx)}>
                    ×
                  </button>
                </div>
              ))}
            </div>
          )}
          <button disabled={createReqDisabled} style={enabledBtn(createReqDisabled)} onClick={api.createRequisition}>
            สร้างใบขอใช้
          </button>
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: 14, marginBottom: 28 }}>
        {vals.requisitionsView.map((rq) => (
          <div key={rq.id} style={card}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 18px', background: '#2a303c' }}>
              <div>
                <div style={{ fontWeight: 800, fontSize: 14.5 }}>ใบขอใช้เลขที่ {rq.docNo}</div>
                <div style={{ fontSize: 11.5, color: '#8b94a3' }}>วันที่ {rq.date}</div>
              </div>
              <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                <div style={{ color: rq.statusColor, fontWeight: 700, fontSize: 13 }}>{rq.status}</div>
                {isAdminRole && (
                  <button
                    onClick={() => { if (window.confirm('ลบใบขอใช้เลขที่ ' + rq.docNo + ' ?')) rq.onDelete(); }}
                    style={{ border: 'none', background: '#e0555f', color: '#fff', borderRadius: 7, padding: '5px 10px', height: 28, cursor: 'pointer', fontSize: 11.5, fontFamily: 'inherit' }}
                  >
                    ลบ
                  </button>
                )}
              </div>
            </div>
            <ScrollX minWidth={620}>
            <div style={{ ...reqGrid, padding: '10px 18px', fontSize: 11.5, color: '#8b94a3', fontWeight: 700, borderTop: '1px solid #333b48' }}>
              <div>รายการ</div>
              <div>ประเภท</div>
              <div>ขอไว้</div>
              <div>รับแล้ว</div>
              <div>ค้างส่ง</div>
              <div>จัดการ</div>
            </div>
            {rq.lines.map((ln) => (
              <div key={ln.id} style={{ borderTop: '1px solid #2c323e', padding: '10px 18px' }}>
                <div style={{ ...reqGrid, alignItems: 'center', fontSize: 13 }}>
                  <div style={{ fontWeight: 600 }}>{ln.name}</div>
                  <div style={{ color: '#8b94a3' }}>{ln.category}</div>
                  <div>
                    {ln.qtyRequested} {ln.unit}
                  </div>
                  <div style={{ color: '#34c471' }}>
                    {ln.received} {ln.unit}
                  </div>
                  <div style={{ color: ln.remainColor, fontWeight: 700 }}>
                    {ln.remaining} {ln.unit}
                  </div>
                  <div>
                    {isAdminRole && (
                      <button style={{ border: 'none', cursor: 'pointer', padding: '7px 12px', borderRadius: 7, fontSize: 11.5, fontWeight: 700, fontFamily: 'inherit', background: '#3a4150', color: '#e9edf2' }} onClick={ln.onStartRecord}>
                        + บันทึกรับเข้า
                      </button>
                    )}
                  </div>
                </div>
                {ln.isRecording && (
                  <div style={{ marginTop: 8, background: '#2a303c', borderRadius: 9, padding: '10px 12px', display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
                    <div style={{ width: 90 }}>
                      <input type="number" min="1" value={s.deliveryDraftQty} onChange={(e) => setState({ deliveryDraftQty: e.target.value })} style={{ ...smallFieldStyle, padding: '8px 9px', borderRadius: 7 }} />
                    </div>
                    <label htmlFor="deliveryPhotoInput" style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', padding: '8px 10px', border: '1px dashed #4a5262', borderRadius: 8, fontSize: 12, color: '#c3cad4' }}>
                      {s.deliveryDraftPhoto ? <Thumb size={30} photo={s.deliveryDraftPhoto} showNoPhoto={false} /> : null}
                      <span>{s.deliveryDraftPhoto ? 'แนบรูปแล้ว' : 'แนบรูป (ไม่บังคับ)'}</span>
                    </label>
                    <input id="deliveryPhotoInput" type="file" accept="image/*" onChange={(e) => api.handlePhoto(e, 'deliveryDraftPhoto')} style={{ display: 'none' }} />
                    <button style={{ border: 'none', background: '#34c471', color: '#12271a', fontWeight: 700, padding: '8px 14px', borderRadius: 8, cursor: 'pointer', fontSize: 12.5, fontFamily: 'inherit' }} onClick={ln.onConfirmRecord}>
                      บันทึก
                    </button>
                    <button style={{ border: 'none', background: '#3a4150', color: '#e9edf2', padding: '8px 14px', borderRadius: 8, cursor: 'pointer', fontSize: 12.5, fontFamily: 'inherit' }} onClick={api.cancelRecordDelivery}>
                      ยกเลิก
                    </button>
                  </div>
                )}
              </div>
            ))}
            </ScrollX>
          </div>
        ))}
      </div>

      <div style={sectionTitle}>ส่งคืนเศษเหล็กแก่สโตร์กลาง</div>
      <div style={{ fontSize: 12.5, color: '#8b94a3', marginBottom: 14 }}>
        ตอนส่งคืนจะยังไม่ทราบรายการ/จำนวน มีแค่รูปถ่ายเป็นหลักฐาน — ต้องติดตามจนกว่าจะได้รับใบส่งคืนจากสโตร์กลาง
      </div>

      {isAdminRole && (
        <div style={{ ...card, padding: 18, marginBottom: 18, display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div style={{ fontSize: 13, fontWeight: 700 }}>บันทึกส่งคืนเศษเหล็ก</div>
          <div>
            <PhotoDropzone id="scrapPhotoInput" photo={s.scrapDraftPhoto} label={s.scrapDraftPhoto ? 'แนบรูปแล้ว' : 'ยังไม่ได้แนบรูป (จำเป็น)'} onChange={(e) => api.handlePhoto(e, 'scrapDraftPhoto')} />
          </div>
          <input placeholder="หมายเหตุ (ถ้ามี) เช่น มาจากงานอะไร" value={s.scrapDraftNote} onChange={(e) => setState({ scrapDraftNote: e.target.value })} style={fieldStyle} />
          <button disabled={!s.scrapDraftPhoto} style={enabledBtn(!s.scrapDraftPhoto)} onClick={api.addScrapReturn}>
            บันทึกส่งคืนเศษเหล็ก
          </button>
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {vals.scrapReturnsView.map((sr) => (
          <div key={sr.id} style={{ ...card, padding: '16px 18px', display: 'flex', gap: 16, alignItems: 'flex-start', flexWrap: 'wrap' }}>
            <Thumb size={64} photo={sr.photo} showNoPhoto={false} />
            <div style={{ flex: 1, minWidth: 200 }}>
              <div style={{ display: 'flex', gap: 10, alignItems: 'center', marginBottom: 4 }}>
                <div style={{ fontWeight: 700, fontSize: 13.5 }}>ส่งคืนวันที่ {sr.date}</div>
                <div style={{ color: sr.statusColor, fontWeight: 700, fontSize: 12 }}>{sr.statusLabel}</div>
              </div>
              <div style={{ fontSize: 12.5, color: '#8b94a3' }}>{sr.note}</div>
              {sr.isReceived && (
                <div style={{ fontSize: 12, color: '#8b94a3', marginTop: 6 }}>
                  เลขที่ใบส่งคืน: {sr.slipNo} · วันที่รับ: {sr.slipDate}
                </div>
              )}
            </div>
            {isAdminRole && sr.isAwaiting && (
              <>
                {!sr.editing ? (
                  <button style={{ border: 'none', cursor: 'pointer', padding: '9px 14px', borderRadius: 9, fontWeight: 700, fontSize: 12.5, fontFamily: 'inherit', background: '#3a4150', color: '#e9edf2' }} onClick={sr.onToggleEdit}>
                    บันทึกว่าได้รับใบส่งคืนแล้ว
                  </button>
                ) : (
                  <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
                    <input placeholder="เลขที่ใบส่งคืน" value={sr.slipNo} onChange={sr.onSlipNoChange} style={{ padding: '8px 10px', borderRadius: 7, background: '#2f3644', border: '1px solid #3a4150', color: '#e9edf2', fontFamily: 'inherit', fontSize: 12.5, width: 130 }} />
                    <input placeholder="วันที่รับ" value={sr.slipDate} onChange={sr.onSlipDateChange} style={{ padding: '8px 10px', borderRadius: 7, background: '#2f3644', border: '1px solid #3a4150', color: '#e9edf2', fontFamily: 'inherit', fontSize: 12.5, width: 110 }} />
                    <button style={{ border: 'none', cursor: 'pointer', padding: '8px 14px', borderRadius: 8, fontWeight: 700, fontSize: 12, fontFamily: 'inherit', background: '#34c471', color: '#12271a' }} onClick={sr.onConfirmSlip}>
                      ยืนยัน
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

const reqGrid = { display: 'grid', gridTemplateColumns: '1.3fr 0.9fr 0.8fr 0.8fr 0.8fr 1.4fr', gap: 8 };
