import { useState } from 'react';
import { card, pageTitle, pageSub, fieldLabel } from '../components/ui.js';
import { fieldStyle, enabledBtn, submitBtn } from '../lib/theme.js';
import { TABS, COLS } from '../lib/config.js';
import { submitRequest } from '../lib/viewer.js';

// ฟอร์มส่งคำขอเบิกแบบทันสมัย (อยู่ในแอป ไม่ใช่ Google Form) → บันทึกลงแท็บ "คำขอเบิก"
export default function RequestForm({ tables, onDone }) {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [job, setJob] = useState('');
  const [costCode, setCostCode] = useState('');
  const [note, setNote] = useState('');
  const [item, setItem] = useState('');
  const [qty, setQty] = useState(1);
  const [cart, setCart] = useState([]);
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);

  // ตัวเลือกของ = วัสดุ + ทรัพย์สิน จาก Sheet
  const cons = (tables[TABS.consumables] || { rows: [] }).rows.map((r) => ({
    label: `${r[COLS.cName] || r[COLS.cCode]}${r[COLS.cQty] !== undefined ? ` (เหลือ ${r[COLS.cQty]} ${r[COLS.cUnit] || ''})` : ''}`,
    value: r[COLS.cName] || r[COLS.cCode],
  }));
  const assets = (tables[TABS.assets] || { rows: [] }).rows.map((r) => ({
    label: `${r[COLS.aCode] || ''} ${r[COLS.aName] || ''}`.trim(),
    value: `${r[COLS.aCode] || ''} ${r[COLS.aName] || ''}`.trim(),
  }));

  const addLine = () => {
    if (!item) return;
    setCart((c) => [...c, { item, qty: Number(qty) || 1 }]);
    setItem('');
    setQty(1);
  };
  const removeLine = (i) => setCart((c) => c.filter((_, idx) => idx !== i));

  const canSubmit = name && cart.length && !busy;

  const submit = async () => {
    if (!canSubmit) return;
    setBusy(true);
    try {
      await submitRequest({ name, phone, job, costCode, note, lines: cart });
      setDone(true);
      setCart([]); setName(''); setPhone(''); setJob(''); setCostCode(''); setNote('');
      if (onDone) onDone();
    } catch (e) {
      alert('ส่งคำขอไม่สำเร็จ: ' + e.message);
    } finally {
      setBusy(false);
    }
  };

  if (done) {
    return (
      <div style={{ maxWidth: 560 }}>
        <div style={pageTitle}>ส่งคำขอเบิก</div>
        <div style={{ ...card, padding: 28, textAlign: 'center', marginTop: 10 }}>
          <div style={{ fontSize: 46 }}>✅</div>
          <div style={{ fontSize: 18, fontWeight: 800, margin: '8px 0 4px' }}>ส่งคำขอเรียบร้อย</div>
          <div style={{ color: '#8b94a3', fontSize: 14 }}>คำขอถูกบันทึกลง Google Sheet แล้ว รอผู้ดูแลสโตร์อนุมัติ</div>
          <button style={{ ...enabledBtn(false), marginTop: 18 }} onClick={() => setDone(false)}>ส่งคำขอใหม่</button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 640 }}>
      <div style={pageTitle}>ส่งคำขอเบิก</div>
      <div style={pageSub}>กรอกคำขอเบิกของ ระบบจะบันทึกลง Google Sheet ให้ผู้ดูแลสโตร์อนุมัติ</div>

      <div style={{ ...card, padding: 20, display: 'flex', flexDirection: 'column', gap: 14, marginBottom: 16 }}>
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
          <div style={{ flex: 1, minWidth: 180 }}>
            <div style={fieldLabel}>ชื่อผู้เบิก *</div>
            <input value={name} onChange={(e) => setName(e.target.value)} placeholder="ชื่อ-สกุล" style={fieldStyle} />
          </div>
          <div style={{ width: 160 }}>
            <div style={fieldLabel}>เบอร์โทร</div>
            <input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="08x-xxx-xxxx" style={fieldStyle} />
          </div>
        </div>
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
          <div style={{ flex: 1, minWidth: 180 }}>
            <div style={fieldLabel}>ใช้ในงาน / หน่วยงาน</div>
            <input value={job} onChange={(e) => setJob(e.target.value)} placeholder="เช่น Base Slab" style={fieldStyle} />
          </div>
          <div style={{ width: 160 }}>
            <div style={fieldLabel}>Cost Code</div>
            <input value={costCode} onChange={(e) => setCostCode(e.target.value)} placeholder="CC-001" style={fieldStyle} />
          </div>
        </div>
      </div>

      <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 10 }}>รายการที่จะเบิก</div>
      <div style={{ ...card, padding: 18, display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 16 }}>
        <div style={{ display: 'flex', gap: 10, alignItems: 'flex-end', flexWrap: 'wrap' }}>
          <div style={{ flex: 1, minWidth: 220 }}>
            <div style={fieldLabel}>เลือกของ</div>
            <select value={item} onChange={(e) => setItem(e.target.value)} style={fieldStyle}>
              <option value="">-- เลือกรายการ --</option>
              {cons.length ? <optgroup label="วัสดุสิ้นเปลือง">{cons.map((o, i) => <option key={'c' + i} value={o.value}>{o.label}</option>)}</optgroup> : null}
              {assets.length ? <optgroup label="ทรัพย์สิน">{assets.map((o, i) => <option key={'a' + i} value={o.value}>{o.label}</option>)}</optgroup> : null}
            </select>
          </div>
          <div style={{ width: 100 }}>
            <div style={fieldLabel}>จำนวน</div>
            <input type="number" min="1" value={qty} onChange={(e) => setQty(e.target.value)} style={fieldStyle} />
          </div>
          <button disabled={!item} style={enabledBtn(!item)} onClick={addLine}>+ เพิ่ม</button>
        </div>

        {cart.length ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {cart.map((l, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, background: '#2a303c', borderRadius: 10, padding: '10px 12px' }}>
                <div style={{ flex: 1, fontWeight: 600, fontSize: 13.5 }}>{l.item}</div>
                <div style={{ fontSize: 12.5, color: '#8b94a3' }}>จำนวน {l.qty}</div>
                <button style={{ border: 'none', background: '#3a4150', color: '#e9edf2', width: 26, height: 26, borderRadius: 7, cursor: 'pointer', fontWeight: 700 }} onClick={() => removeLine(i)}>×</button>
              </div>
            ))}
          </div>
        ) : (
          <div style={{ textAlign: 'center', color: '#8b94a3', fontSize: 12.5, padding: '6px 0' }}>ยังไม่มีรายการ</div>
        )}
      </div>

      <div style={{ ...card, padding: 18, display: 'flex', flexDirection: 'column', gap: 12 }}>
        <div>
          <div style={fieldLabel}>หมายเหตุ (ถ้ามี)</div>
          <input value={note} onChange={(e) => setNote(e.target.value)} placeholder="รายละเอียดเพิ่มเติม" style={fieldStyle} />
        </div>
        <button disabled={!canSubmit} style={submitBtn(!canSubmit)} onClick={submit}>
          {busy ? 'กำลังส่ง…' : `ส่งคำขอเบิก (${cart.length} รายการ)`}
        </button>
      </div>
    </div>
  );
}
