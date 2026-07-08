/**
 * Store PP26 — Google Sheet backend (free, no server needed).
 *
 * This Google Apps Script Web App gives the app a shared cloud store: the app
 * pushes a full JSON snapshot of its data and can pull it back on another
 * device. Data is stored as a single JSON blob in a sheet named "data".
 *
 * SETUP: see google-sheet/README.md.
 */

var SHEET_NAME = 'data';
var CELL = 'A1';

function getSheet_() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName(SHEET_NAME);
  if (!sheet) sheet = ss.insertSheet(SHEET_NAME);
  return sheet;
}

function json_(obj) {
  return ContentService
    .createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}

// GET ?action=load  ->  { ok: true, data: {...} | null }
function doGet(e) {
  var action = (e && e.parameter && e.parameter.action) || 'load';
  if (action === 'load') {
    var raw = getSheet_().getRange(CELL).getValue();
    var data = null;
    if (raw) {
      try { data = JSON.parse(raw); } catch (err) { data = null; }
    }
    return json_({ ok: true, data: data });
  }
  return json_({ ok: false, error: 'unknown action' });
}

// POST { action: 'save', data: {...} }  ->  { ok: true }
function doPost(e) {
  var body = {};
  try { body = JSON.parse(e.postData.contents); } catch (err) { body = {}; }

  if (body.action === 'save') {
    getSheet_().getRange(CELL).setValue(JSON.stringify(body.data || {}));
    return json_({ ok: true });
  }
  return json_({ ok: false, error: 'unknown action' });
}
