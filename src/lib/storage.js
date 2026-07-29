// Persistence layer.
//
// Data lives in the browser's localStorage so it survives a refresh. If a
// Google Apps Script Web App URL is configured (Settings → เชื่อม Google Sheet),
// the same data snapshot is also pushed to the sheet and can be pulled back,
// giving a free, shared cloud store without any paid backend.
//
// See google-sheet/Code.gs for the matching Apps Script endpoint.

import { DATA_KEYS } from './seed.js';

const DATA_KEY = 'store_pp26_data_v1';
const SHEET_URL_KEY = 'store_pp26_sheet_url';
const PIN_KEY = 'store_pp26_admin_pin';
const DEFAULT_PIN = '2626';

// 4-digit PIN that gates the Store (admin) mode. Stored locally per device so
// it never has to live in the shared/public Google Sheet.
export function getAdminPin() {
  try {
    return localStorage.getItem(PIN_KEY) || DEFAULT_PIN;
  } catch {
    return DEFAULT_PIN;
  }
}

export function setAdminPin(pin) {
  try {
    localStorage.setItem(PIN_KEY, pin);
  } catch {
    /* ignore */
  }
}

export function loadData() {
  try {
    const raw = localStorage.getItem(DATA_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === 'object' ? parsed : null;
  } catch {
    return null;
  }
}

// Pull only the persistable data keys out of the full app state.
export function pickData(state) {
  const out = {};
  for (const k of DATA_KEYS) out[k] = state[k];
  return out;
}

export function saveData(state) {
  try {
    localStorage.setItem(DATA_KEY, JSON.stringify(pickData(state)));
  } catch {
    // Quota errors (e.g. many base64 photos) are non-fatal — the app keeps
    // running from in-memory state.
  }
}

export function clearData() {
  try {
    localStorage.removeItem(DATA_KEY);
  } catch {
    /* ignore */
  }
}

// --- Google Sheet sync config ---
export function getSheetUrl() {
  try {
    return localStorage.getItem(SHEET_URL_KEY) || '';
  } catch {
    return '';
  }
}

export function setSheetUrl(url) {
  try {
    if (url) localStorage.setItem(SHEET_URL_KEY, url);
    else localStorage.removeItem(SHEET_URL_KEY);
  } catch {
    /* ignore */
  }
}

// Push the current data snapshot to the Apps Script Web App.
// Uses text/plain to avoid a CORS preflight against the Apps Script endpoint.
export async function pushToSheet(url, state) {
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'text/plain;charset=utf-8' },
    body: JSON.stringify({ action: 'save', data: pickData(state) }),
  });
  if (!res.ok) throw new Error('HTTP ' + res.status);
  return res.json().catch(() => ({}));
}

// Pull the latest data snapshot back from the sheet.
export async function pullFromSheet(url) {
  const res = await fetch(url + (url.includes('?') ? '&' : '?') + 'action=load', {
    method: 'GET',
  });
  if (!res.ok) throw new Error('HTTP ' + res.status);
  const json = await res.json();
  return json && json.data ? json.data : null;
}
