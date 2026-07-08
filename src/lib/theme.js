// Design tokens + style helpers, ported 1:1 from the Store PP26.dc.html prototype.

export const STATUS_META = {
  available: { label: 'พร้อมเบิก', color: '#34c471' },
  in_use: { label: 'กำลังถูกเบิกใช้', color: '#f5a623' },
  repair: { label: 'ส่งซ่อม', color: '#4a90d9' },
  damaged: { label: 'ชำรุด', color: '#e0555f' },
  lost: { label: 'หาย', color: '#9b6bea' },
};

export const COND_COLORS = { ok: '#34c471', repair: '#4a90d9', damaged: '#e0555f' };
export const COND_LABELS = { ok: 'ปกติ', repair: 'ส่งซ่อม', damaged: 'ชำรุด' };

// Diagonal-hatch placeholder used wherever a photo may be missing.
export function thumbStyleBase(size) {
  return {
    width: size,
    height: size,
    borderRadius: 8,
    flexShrink: 0,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: 8.5,
    color: '#8b94a3',
    textAlign: 'center',
    fontFamily: 'monospace',
    lineHeight: 1.2,
    background:
      'repeating-linear-gradient(135deg, #2a303c, #2a303c 6px, #313947 6px, #313947 12px)',
    border: '1px solid #3a4150',
  };
}

// When a photo exists, overlay it as a cover background.
export function photoStyle(size, photo) {
  const base = thumbStyleBase(size);
  if (photo) {
    return {
      ...base,
      background: `url(${photo}) center/cover`,
      border: '1px solid #4a5262',
    };
  }
  return base;
}

// --- button style factories (from renderVals) ---
export const activeBtn = (active) => ({
  border: 'none',
  cursor: 'pointer',
  padding: '9px 16px',
  borderRadius: 9,
  fontSize: 13.5,
  fontWeight: 700,
  fontFamily: 'inherit',
  whiteSpace: 'nowrap',
  background: active ? '#f5a623' : 'transparent',
  color: active ? '#1e2430' : '#c3cad4',
});

export const navBtn = (active) => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  gap: 8,
  border: 'none',
  cursor: 'pointer',
  padding: '10px 12px',
  borderRadius: 9,
  fontSize: 13.5,
  fontWeight: 600,
  fontFamily: 'inherit',
  textAlign: 'left',
  background: active ? '#f5a623' : 'transparent',
  color: active ? '#1e2430' : '#c3cad4',
});

export const toggleBtn = (active) => ({
  flex: 1,
  border: 'none',
  cursor: 'pointer',
  padding: '7px 4px',
  borderRadius: 8,
  fontSize: 12,
  fontWeight: 600,
  fontFamily: 'inherit',
  background: active ? '#f5a623' : 'transparent',
  color: active ? '#1e2430' : '#c3cad4',
});

export const chipBtn = (active, color) => ({
  border: `1px solid ${active ? color : '#3a4150'}`,
  cursor: 'pointer',
  padding: '7px 14px',
  borderRadius: 999,
  fontSize: 12.5,
  fontWeight: 600,
  fontFamily: 'inherit',
  background: active ? color + '22' : 'transparent',
  color: active ? color : '#c3cad4',
});

export const smallToggleBtn = (active) => ({
  cursor: 'pointer',
  padding: '8px 14px',
  borderRadius: 9,
  fontSize: 12.5,
  fontWeight: 700,
  fontFamily: 'inherit',
  background: active ? '#f5a623' : '#262c38',
  color: active ? '#1e2430' : '#c3cad4',
  border: `1px solid ${active ? '#f5a623' : '#333b48'}`,
});

export const enabledBtn = (disabled) => ({
  border: 'none',
  cursor: disabled ? 'not-allowed' : 'pointer',
  padding: '10px 16px',
  borderRadius: 9,
  fontWeight: 700,
  fontSize: 13,
  fontFamily: 'inherit',
  background: disabled ? '#3a4150' : '#f5a623',
  color: disabled ? '#7d8592' : '#1e2430',
});

export const reqTypeBtn = (active) => ({
  border: `1px solid ${active ? '#f5a623' : '#3a4150'}`,
  cursor: 'pointer',
  padding: '9px 16px',
  borderRadius: 9,
  fontSize: 13,
  fontWeight: 700,
  fontFamily: 'inherit',
  background: active ? '#f5a62322' : '#2a303c',
  color: active ? '#f5a623' : '#c3cad4',
});

export const submitBtn = (disabled) => ({
  border: 'none',
  cursor: disabled ? 'not-allowed' : 'pointer',
  padding: 13,
  borderRadius: 10,
  fontSize: 14.5,
  fontWeight: 700,
  fontFamily: 'inherit',
  background: disabled ? '#3a4150' : '#f5a623',
  color: disabled ? '#7d8592' : '#1e2430',
});

// Shared field style for text inputs / selects.
export const fieldStyle = {
  width: '100%',
  padding: '11px 12px',
  borderRadius: 9,
  background: '#2f3644',
  border: '1px solid #3a4150',
  color: '#e9edf2',
  fontFamily: 'inherit',
  fontSize: 14,
};

export const smallFieldStyle = {
  width: '100%',
  padding: '9px 10px',
  borderRadius: 8,
  background: '#2f3644',
  border: '1px solid #3a4150',
  color: '#e9edf2',
  fontFamily: 'inherit',
  fontSize: 13,
};
