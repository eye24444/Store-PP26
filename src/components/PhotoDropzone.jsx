import Thumb from './Thumb.jsx';

// Reusable "tap to take/select a photo" dropzone used by the request/return
// forms and the scrap-return recorder.
export default function PhotoDropzone({ id, photo, label, hint = 'แตะเพื่อถ่ายภาพ / เลือกรูป', onChange, capture = true, previewSize = 52 }) {
  return (
    <>
      <label
        htmlFor={id}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 12,
          cursor: 'pointer',
          padding: 12,
          border: '1.5px dashed #4a5262',
          borderRadius: 10,
          background: '#2a303c',
        }}
      >
        {photo ? <Thumb size={previewSize} photo={photo} showNoPhoto={false} /> : null}
        <div>
          <div style={{ fontSize: 13, fontWeight: 600 }}>{label}</div>
          <div style={{ fontSize: 11, color: '#8b94a3' }}>{hint}</div>
        </div>
      </label>
      <input
        id={id}
        type="file"
        accept="image/*"
        {...(capture ? { capture: 'environment' } : {})}
        onChange={onChange}
        style={{ display: 'none' }}
      />
    </>
  );
}
