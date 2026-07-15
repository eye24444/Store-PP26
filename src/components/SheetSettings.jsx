import { useState } from 'react';
import { card } from './ui.js';
import { getSheetUrl, setSheetUrl, pushToSheet, pullFromSheet } from '../lib/storage.js';
import { fieldStyle, enabledBtn } from '../lib/theme.js';

// Optional Google Sheet sync configuration. Free path: a Google Apps Script
// Web App (see google-sheet/Code.gs) acts as the read/write endpoint.
export default function SheetSettings({ onClose, state, onPulled, showToast, onReset }) {
  const [url, setUrl] = useState(getSheetUrl());
  const [busy, setBusy] = useState('');

  const save = () => {
    setSheetUrl(url.trim());
    showToast('บันทึกลิงก์ Google Sheet แล้ว');
  };

  const doPush = async () => {
    if (!url.trim()) return showToast('กรุณาใส่ลิงก์ Web App ก่อน');
    setSheetUrl(url.trim());
    setBusy('push');
    try {
      await pushToSheet(url.trim(), state);
      showToast('ส่งข้อมูลขึ้น Google Sheet แล้ว');
    } catch (e) {
      showToast('ส่งข้อมูลไม่สำเร็จ: ' + e.message);
    } finally {
      setBusy('');
    }
  };

  const doPull = async () => {
    if (!url.trim()) return showToast('กรุณาใส่ลิงก์ Web App ก่อน');
    setSheetUrl(url.trim());
    setBusy('pull');
    try {
      const data = await pullFromSheet(url.trim());
      if (data) {
        onPulled(data);
        showToast('ดึงข้อมูลจาก Google Sheet แล้ว');
        onClose();
      } else {
        showToast('ยังไม่มีข้อมูลใน Google Sheet');
      }
    } catch (e) {
      showToast('ดึงข้อมูลไม่สำเร็จ: ' + e.message);
    } finally {
      setBusy('');
    }
  };

  return (
    <div
      onClick={onClose}
      style={{ position: 'fixed', inset: 0, background: '#00000088', zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}
    >
      <div onClick={(e) => e.stopPropagation()} style={{ ...card, padding: 24, maxWidth: 520, width: '100%', maxHeight: '90vh', overflowY: 'auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 6 }}>
          <div style={{ fontSize: 18, fontWeight: 800 }}>เชื่อมข้อมูล Google Sheet</div>
          <button onClick={onClose} style={{ border: 'none', background: '#3a4150', color: '#e9edf2', width: 30, height: 30, borderRadius: 8, cursor: 'pointer', fontWeight: 700 }}>
            ×
          </button>
        </div>
        <div style={{ fontSize: 12.5, color: '#8b94a3', marginBottom: 16, lineHeight: 1.6 }}>
          ข้อมูลถูกเก็บในเบราว์เซอร์ (localStorage) อยู่แล้ว รีเฟรชแล้วไม่หาย หากต้องการแชร์ข้อมูลข้ามเครื่อง/หลายคน ให้เชื่อมกับ
          Google Sheet ผ่าน Google Apps Script Web App (ฟรี) — ดูวิธีตั้งค่าในไฟล์ <code style={{ color: '#f5a623' }}>google-sheet/README.md</code>
        </div>

        <div style={{ fontSize: 12, color: '#8b94a3', marginBottom: 6 }}>ลิงก์ Web App (ลงท้ายด้วย /exec)</div>
        <input
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="https://script.google.com/macros/s/..../exec"
          style={{ ...fieldStyle, marginBottom: 14 }}
        />

        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          <button style={{ ...enabledBtn(false), background: '#3a4150', color: '#e9edf2' }} onClick={save}>
            บันทึกลิงก์
          </button>
          <button style={enabledBtn(busy === 'push')} disabled={busy === 'push'} onClick={doPush}>
            {busy === 'push' ? 'กำลังส่ง…' : 'ส่งข้อมูลขึ้น Sheet'}
          </button>
          <button style={enabledBtn(busy === 'pull')} disabled={busy === 'pull'} onClick={doPull}>
            {busy === 'pull' ? 'กำลังดึง…' : 'ดึงข้อมูลจาก Sheet'}
          </button>
        </div>

        {/* Danger zone: clear all sample/mock data to start fresh */}
        <div style={{ marginTop: 22, paddingTop: 16, borderTop: '1px solid #333b48' }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: '#e0555f', marginBottom: 4 }}>ล้างข้อมูลตัวอย่าง</div>
          <div style={{ fontSize: 12, color: '#8b94a3', marginBottom: 12, lineHeight: 1.6 }}>
            ลบข้อมูลตัวอย่างทั้งหมด (ของ ทรัพย์สิน พนักงาน ประวัติ ใบขอใช้ ฯลฯ) เพื่อเริ่มกรอกข้อมูลจริงจากศูนย์ —
            ทำแล้วย้อนกลับไม่ได้ ถ้าเชื่อม Sheet ไว้ ข้อมูลใน Sheet จะถูกล้างตามด้วย
          </div>
          <button
            onClick={() => {
              if (window.confirm('ยืนยันล้างข้อมูลทั้งหมด? เริ่มจากศูนย์ (ย้อนกลับไม่ได้)')) {
                onReset();
                onClose();
              }
            }}
            style={{ border: '1px solid #e0555f', background: 'transparent', color: '#e0555f', borderRadius: 9, padding: '10px 16px', cursor: 'pointer', fontWeight: 700, fontSize: 13, fontFamily: 'inherit' }}
          >
            ล้างข้อมูลทั้งหมด เริ่มใหม่
          </button>
        </div>
      </div>
    </div>
  );
}
