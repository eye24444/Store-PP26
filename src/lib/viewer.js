import { useCallback, useEffect, useState } from 'react';
import { SHEET_ENDPOINT, HIDDEN_COLS } from './config.js';

// คอลัมน์ที่ควรแสดง (ตัดคอลัมน์เทคนิคออก) — รองรับคอลัมน์ใหม่ที่ผู้ใช้เพิ่มเองอัตโนมัติ
export function visibleHeaders(headers) {
  return (headers || []).filter((h) => h && !HIDDEN_COLS.includes(h));
}

const LS_URL = 'store_pp26_sheet_url';

// ลิงก์ปลายทาง: ใช้ค่าใน config ก่อน ถ้าว่างค่อยใช้ค่าที่ผู้ใช้วางไว้ (localStorage)
export function getEndpoint() {
  if (SHEET_ENDPOINT) return SHEET_ENDPOINT;
  try {
    return localStorage.getItem(LS_URL) || '';
  } catch {
    return '';
  }
}
export function setEndpoint(url) {
  try {
    if (url) localStorage.setItem(LS_URL, url);
    else localStorage.removeItem(LS_URL);
  } catch {
    /* ignore */
  }
}

// map สถานะทั้งไทยและคีย์ภายใน -> ป้ายไทย + สี
const STATUS_LABEL = {
  available: 'พร้อมเบิก', in_use: 'กำลังถูกเบิกใช้', repair: 'ส่งซ่อม', damaged: 'ชำรุด', lost: 'หาย',
  'พร้อมเบิก': 'พร้อมเบิก', 'กำลังถูกเบิกใช้': 'กำลังถูกเบิกใช้', 'ใช้งานอยู่': 'กำลังถูกเบิกใช้', 'มีคนถือ': 'กำลังถูกเบิกใช้',
  'ส่งซ่อม': 'ส่งซ่อม', 'ชำรุด': 'ชำรุด', 'หาย': 'หาย',
};
const STATUS_COLOR = {
  'พร้อมเบิก': '#34c471', 'กำลังถูกเบิกใช้': '#f5a623', 'ส่งซ่อม': '#4a90d9', 'ชำรุด': '#e0555f', 'หาย': '#9b6bea',
};
export function statusMeta(raw) {
  const label = STATUS_LABEL[String(raw || '').trim()] || (raw ? String(raw) : '—');
  return { label, color: STATUS_COLOR[label] || '#8b94a3' };
}

export function toNum(v) {
  const n = Number(String(v).replace(/,/g, ''));
  return isNaN(n) ? 0 : n;
}

// ดึงข้อมูลสดจาก Google Sheet
export function useLiveData() {
  const [state, setState] = useState({ status: 'idle', tables: null, updatedAt: null, error: '' });

  const load = useCallback(async () => {
    const url = getEndpoint();
    if (!url) {
      setState({ status: 'noconfig', tables: null, updatedAt: null, error: '' });
      return;
    }
    setState((s) => ({ ...s, status: s.tables ? 'refreshing' : 'loading', error: '' }));
    try {
      const res = await fetch(url + (url.includes('?') ? '&' : '?') + 'action=load&t=' + Date.now());
      if (!res.ok) throw new Error('HTTP ' + res.status);
      const json = await res.json();
      setState({ status: 'ready', tables: json.tables || {}, updatedAt: json.updatedAt || null, error: '' });
    } catch (e) {
      setState((s) => ({ ...s, status: 'error', error: e.message || 'โหลดข้อมูลไม่สำเร็จ' }));
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  return { ...state, reload: load };
}

// บันทึกการเบิก/คืน → สร้าง Requisition + Inventory ใน Google Sheet
// payload: { status:'Stock Out'|'Stock In', by, vendor, lines:[{itemId, amount}] }
export async function submitMovement(payload) {
  const url = getEndpoint();
  if (!url) throw new Error('ยังไม่ได้ตั้งค่าลิงก์ Google Sheet');
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'text/plain;charset=utf-8' },
    body: JSON.stringify({ action: 'movement', data: payload }),
  });
  if (!res.ok) throw new Error('HTTP ' + res.status);
  return res.json().catch(() => ({ ok: true }));
}
