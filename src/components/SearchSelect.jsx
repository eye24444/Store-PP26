import { useEffect, useRef, useState } from 'react';
import { fieldStyle } from '../lib/theme.js';

// ช่องเลือกแบบพิมพ์ค้นหาได้ (typeahead) — เหมาะกับรายการเยอะบนมือถือ
// props: options = [{ value, label }], value, onChange(value), placeholder
export default function SearchSelect({ options, value, onChange, placeholder }) {
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false);
  const boxRef = useRef(null);
  const blurTimer = useRef(null);

  const selected = options.find((o) => String(o.value) === String(value));
  const display = open ? query : selected ? selected.label : '';
  const q = query.trim().toLowerCase();
  const filtered = q ? options.filter((o) => String(o.label).toLowerCase().includes(q)) : options;

  useEffect(() => () => clearTimeout(blurTimer.current), []);

  const pick = (o) => {
    onChange(o.value);
    setQuery('');
    setOpen(false);
  };

  return (
    <div ref={boxRef} style={{ position: 'relative' }}>
      <input
        value={display}
        placeholder={placeholder}
        onFocus={() => { setOpen(true); setQuery(''); }}
        onBlur={() => { blurTimer.current = setTimeout(() => setOpen(false), 150); }}
        onChange={(e) => { setQuery(e.target.value); setOpen(true); }}
        style={fieldStyle}
      />
      {open ? (
        <div
          style={{ position: 'absolute', zIndex: 60, top: 'calc(100% + 4px)', left: 0, right: 0, background: '#2f3644', border: '1px solid #3a4150', borderRadius: 9, maxHeight: 260, overflowY: 'auto', boxShadow: '0 12px 34px rgba(0,0,0,.45)' }}
        >
          {filtered.length ? (
            filtered.map((o, i) => (
              <div
                key={String(o.value) + i}
                onMouseDown={(e) => { e.preventDefault(); pick(o); }}
                style={{ padding: '11px 12px', cursor: 'pointer', fontSize: 14, borderTop: i ? '1px solid #3a4150' : 'none', background: String(o.value) === String(value) ? '#3a4150' : 'transparent' }}
              >
                {o.label}
              </div>
            ))
          ) : (
            <div style={{ padding: '11px 12px', color: '#8b94a3', fontSize: 13 }}>ไม่พบรายการ</div>
          )}
        </div>
      ) : null}
    </div>
  );
}
