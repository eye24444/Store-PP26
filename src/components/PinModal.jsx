import { useState } from 'react';
import { card } from './ui.js';
import { getAdminPin, setAdminPin } from '../lib/storage.js';
import { fieldStyle, enabledBtn } from '../lib/theme.js';

// PIN gate for entering Store (admin) mode. Also lets an authenticated user
// change the 4-digit PIN.
export default function PinModal({ onClose, onSuccess, showToast }) {
  const [mode, setMode] = useState('enter'); // 'enter' | 'change'
  const [pin, setPin] = useState('');
  const [current, setCurrent] = useState('');
  const [next, setNext] = useState('');
  const [error, setError] = useState('');

  const pinField = {
    ...fieldStyle,
    letterSpacing: 8,
    textAlign: 'center',
    fontSize: 22,
    fontWeight: 700,
  };
  const onlyDigits = (v) => v.replace(/\D/g, '').slice(0, 4);

  const submitEnter = () => {
    if (pin === getAdminPin()) {
      onSuccess();
    } else {
      setError('รหัสผ่านไม่ถูกต้อง');
      setPin('');
    }
  };

  const submitChange = () => {
    if (current !== getAdminPin()) {
      setError('รหัสผ่านเดิมไม่ถูกต้อง');
      return;
    }
    if (next.length !== 4) {
      setError('รหัสใหม่ต้องเป็นตัวเลข 4 หลัก');
      return;
    }
    setAdminPin(next);
    showToast('เปลี่ยนรหัสผ่านแล้ว');
    onClose();
  };

  return (
    <div
      onClick={onClose}
      style={{ position: 'fixed', inset: 0, background: '#00000088', zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}
    >
      <div onClick={(e) => e.stopPropagation()} style={{ ...card, padding: 24, maxWidth: 380, width: '100%' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 6 }}>
          <div style={{ fontSize: 18, fontWeight: 800 }}>{mode === 'enter' ? 'รหัสผ่านผู้ดูแลสโตร์' : 'เปลี่ยนรหัสผ่าน'}</div>
          <button onClick={onClose} style={{ border: 'none', background: '#3a4150', color: '#e9edf2', width: 30, height: 30, borderRadius: 8, cursor: 'pointer', fontWeight: 700 }}>
            ×
          </button>
        </div>

        {mode === 'enter' ? (
          <>
            <div style={{ fontSize: 12.5, color: '#8b94a3', marginBottom: 16 }}>ใส่รหัส 4 หลักเพื่อเข้าโหมดผู้ดูแล (อนุมัติการเบิก / จัดการข้อมูล)</div>
            <input
              type="password"
              inputMode="numeric"
              autoFocus
              value={pin}
              onChange={(e) => {
                setPin(onlyDigits(e.target.value));
                setError('');
              }}
              onKeyDown={(e) => e.key === 'Enter' && submitEnter()}
              placeholder="••••"
              style={pinField}
            />
            {error ? <div style={{ color: '#e0555f', fontSize: 12.5, marginTop: 8 }}>{error}</div> : null}
            <button style={{ ...enabledBtn(pin.length !== 4), width: '100%', marginTop: 16 }} disabled={pin.length !== 4} onClick={submitEnter}>
              ยืนยัน
            </button>
            <button
              onClick={() => {
                setMode('change');
                setError('');
              }}
              style={{ border: 'none', background: 'transparent', color: '#8b94a3', cursor: 'pointer', fontSize: 12.5, marginTop: 12, width: '100%', fontFamily: 'inherit' }}
            >
              เปลี่ยนรหัสผ่าน
            </button>
          </>
        ) : (
          <>
            <div style={{ fontSize: 12, color: '#8b94a3', marginBottom: 6, marginTop: 8 }}>รหัสผ่านเดิม</div>
            <input type="password" inputMode="numeric" value={current} onChange={(e) => { setCurrent(onlyDigits(e.target.value)); setError(''); }} placeholder="••••" style={pinField} />
            <div style={{ fontSize: 12, color: '#8b94a3', marginBottom: 6, marginTop: 14 }}>รหัสผ่านใหม่ (4 หลัก)</div>
            <input type="password" inputMode="numeric" value={next} onChange={(e) => { setNext(onlyDigits(e.target.value)); setError(''); }} placeholder="••••" style={pinField} />
            {error ? <div style={{ color: '#e0555f', fontSize: 12.5, marginTop: 8 }}>{error}</div> : null}
            <button style={{ ...enabledBtn(false), width: '100%', marginTop: 16 }} onClick={submitChange}>
              บันทึกรหัสใหม่
            </button>
            <button
              onClick={() => { setMode('enter'); setError(''); }}
              style={{ border: 'none', background: 'transparent', color: '#8b94a3', cursor: 'pointer', fontSize: 12.5, marginTop: 12, width: '100%', fontFamily: 'inherit' }}
            >
              ย้อนกลับ
            </button>
          </>
        )}
      </div>
    </div>
  );
}
