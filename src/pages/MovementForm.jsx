import { useState } from 'react';
import { card, pageTitle, pageSub, fieldLabel } from '../components/ui.js';
import { fieldStyle, reqTypeBtn, enabledBtn, submitBtn } from '../lib/theme.js';
import { TABS, COLS } from '../lib/config.js';
import { submitMovement } from '../lib/viewer.js';

// ฟอร์มเบิก (Stock Out) / คืน (Stock In) → สร้าง Requisition + Inventory ใน Sheet
export default function MovementForm({ tables, onDone }) {
  const [mode, setMode] = useState('out'); // 'out' = เบิก, 'in' = คืน
  const [by, setBy] = useState(''); // staff id (เบิก)
  const [vendor, setVendor] = useState(''); // store id (คืน)
  const [item, setItem] = useState(''); // เก็บ "ชื่อของ" (ให้ตรงกับที่ AppSheet เก็บ)
  const [amount, setAmount] = useState(1);
  const [cart, setCart] = useState([]);
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(null);

  const items = (tables[TABS.item] || { rows: [] }).rows;
  const staff = (tables[TABS.staff] || { rows: [] }).rows;
  const stores = (tables[TABS.store] || { rows: [] }).rows;

  const addLine = () => {
    if (!item || Number(amount) <= 0) return;
    setCart((c) => [...c, { item, amount: Number(amount) }]);
    setItem('');
    setAmount(1);
  };
  const removeLine = (i) => setCart((c) => c.filter((_, idx) => idx !== i));

  const whoOk = mode === 'out' ? !!by : !!vendor;
  const canSubmit = whoOk && cart.length && !busy;

  const submit = async () => {
    if (!canSubmit) return;
    setBusy(true);
    try {
      const payload = {
        status: mode === 'out' ? 'Stock Out' : 'Stock In',
        by: mode === 'out' ? by : '',
        vendor: mode === 'in' ? vendor : '',
        lines: cart,
      };
      const res = await submitMovement(payload);
      setDone({ reqNo: res.reqNo || '', count: cart.length, mode });
      setCart([]); setBy(''); setVendor('');
      if (onDone) onDone();
    } catch (e) {
      alert('บันทึกไม่สำเร็จ: ' + e.message);
    } finally {
      setBusy(false);
    }
  };

  if (done) {
    return (
      <div style={{ maxWidth: 560 }}>
        <div style={pageTitle}>{done.mode === 'out' ? 'เบิกของ' : 'คืนของ'}</div>
        <div style={{ ...card, padding: 28, textAlign: 'center', marginTop: 10 }}>
          <div style={{ fontSize: 46 }}>✅</div>
          <div style={{ fontSize: 18, fontWeight: 800, margin: '8px 0 4px' }}>บันทึกเรียบร้อย</div>
          <div style={{ color: '#8b94a3', fontSize: 14 }}>
            {done.mode === 'out' ? 'เบิก' : 'คืน'} {done.count} รายการ · เลขที่ {done.reqNo || '—'}
          </div>
          <button style={{ ...enabledBtn(false), marginTop: 18 }} onClick={() => setDone(null)}>ทำรายการใหม่</button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 640 }}>
      <div style={pageTitle}>เบิก / คืนของ</div>
      <div style={pageSub}>บันทึกการเบิก-คืน ระบบจะออกเลขที่ให้ + ตัด/เพิ่มสต็อกอัตโนมัติ</div>

      {/* เลือกโหมด */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
        <button style={reqTypeBtn(mode === 'out')} onClick={() => setMode('out')}>เบิกของ (Stock Out)</button>
        <button style={reqTypeBtn(mode === 'in')} onClick={() => setMode('in')}>คืนของ (Stock In)</button>
      </div>

      {/* ใคร/ที่ไหน */}
      <div style={{ ...card, padding: 18, marginBottom: 16 }}>
        {mode === 'out' ? (
          <div>
            <div style={fieldLabel}>ผู้เบิก (By) *</div>
            <select value={by} onChange={(e) => setBy(e.target.value)} style={fieldStyle}>
              <option value="">-- เลือกพนักงาน --</option>
              {staff.map((s, i) => (
                <option key={i} value={s[COLS.staffId]}>{s[COLS.staffNick] || s[COLS.staffName] || s[COLS.staffId]}</option>
              ))}
            </select>
          </div>
        ) : (
          <div>
            <div style={fieldLabel}>คืนที่ / จาก (Store) *</div>
            <select value={vendor} onChange={(e) => setVendor(e.target.value)} style={fieldStyle}>
              <option value="">-- เลือกสโตร์ --</option>
              {stores.map((s, i) => (
                <option key={i} value={s[COLS.storeId]}>{s[COLS.storeName] || s[COLS.storeId]}</option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* รายการของ */}
      <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 10 }}>รายการของ</div>
      <div style={{ ...card, padding: 18, display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 16 }}>
        <div style={{ display: 'flex', gap: 10, alignItems: 'flex-end', flexWrap: 'wrap' }}>
          <div style={{ flex: 1, minWidth: 220 }}>
            <div style={fieldLabel}>เลือกของ</div>
            <select value={item} onChange={(e) => setItem(e.target.value)} style={fieldStyle}>
              <option value="">-- เลือกรายการ --</option>
              {items.map((r, i) => (
                <option key={i} value={r[COLS.itemName]}>
                  {r[COLS.itemName]}{r[COLS.itemStock] !== undefined ? ` (เหลือ ${r[COLS.itemStock]} ${r[COLS.itemUnit] || ''})` : ''}
                </option>
              ))}
            </select>
          </div>
          <div style={{ width: 100 }}>
            <div style={fieldLabel}>จำนวน</div>
            <input type="number" min="1" value={amount} onChange={(e) => setAmount(e.target.value)} style={fieldStyle} />
          </div>
          <button disabled={!item} style={enabledBtn(!item)} onClick={addLine}>+ เพิ่ม</button>
        </div>

        {cart.length ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {cart.map((l, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, background: '#2a303c', borderRadius: 10, padding: '10px 12px' }}>
                <div style={{ flex: 1, fontWeight: 600, fontSize: 13.5 }}>{l.item}</div>
                <div style={{ fontSize: 12.5, color: mode === 'out' ? '#e0555f' : '#34c471', fontWeight: 700 }}>
                  {mode === 'out' ? '−' : '+'}{l.amount}
                </div>
                <button style={{ border: 'none', background: '#3a4150', color: '#e9edf2', width: 26, height: 26, borderRadius: 7, cursor: 'pointer', fontWeight: 700 }} onClick={() => removeLine(i)}>×</button>
              </div>
            ))}
          </div>
        ) : (
          <div style={{ textAlign: 'center', color: '#8b94a3', fontSize: 12.5, padding: '6px 0' }}>ยังไม่มีรายการ</div>
        )}
      </div>

      <button disabled={!canSubmit} style={submitBtn(!canSubmit)} onClick={submit}>
        {busy ? 'กำลังบันทึก…' : `บันทึก${mode === 'out' ? 'เบิก' : 'คืน'} (${cart.length} รายการ)`}
      </button>
    </div>
  );
}
