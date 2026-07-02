/**
 * My Health School — Diabetes Reversal Landing Page
 * Google Apps Script Web App: receives lead-form submissions from the
 * landing page and appends each one as a row in the bound Google Sheet.
 *
 * HOW TO USE:
 *   1. Open your Google Sheet.
 *   2. Extensions -> Apps Script.
 *   3. Delete any sample code, paste THIS file in, and Save.
 *   4. Deploy -> New deployment -> Web app
 *        Execute as:      Me
 *        Who has access:  Anyone
 *   5. Copy the /exec URL it gives you and paste it into index.html
 *      (the SCRIPT_URL constant near the bottom of the file).
 *
 * The sheet columns will be: Name | Age | Phone | HbA1c | Duration | Timestamp
 */

const SHEET_NAME = 'Leads';
const HEADERS = ['Name', 'Age', 'Phone', 'HbA1c', 'Duration', 'Timestamp'];
const PHONE_COL = 3; // 1-indexed column for Phone within HEADERS

/** Handles the POST request sent by the landing-page form. */
function doPost(e) {
  // Lock so two simultaneous submissions can't write to the same row.
  const lock = LockService.getScriptLock();
  lock.waitLock(30000);

  try {
    const data = JSON.parse((e && e.postData && e.postData.contents) || '{}');
    const sheet = getSheet_();

    // Phone numbers must be unique. If this one is already in the sheet,
    // reject the submission instead of creating a duplicate lead row.
    if (findRowByPhone_(sheet, normalizePhone_(data.phone))) {
      return json_({ result: 'duplicate' });
    }

    sheet.appendRow([
      data.name     || '',
      data.age      || '',
      data.phone    || '',
      data.hba1c    || '',
      data.duration || '',
      new Date()                // authoritative server-side timestamp
    ]);

    return json_({ result: 'success' });
  } catch (err) {
    return json_({ result: 'error', message: String(err) });
  } finally {
    lock.releaseLock();
  }
}

/** Strips everything but digits, then keeps the last 10 — collapses +91 / 91 / 0 prefixes to the same key. */
function normalizePhone_(phone) {
  const digits = String(phone || '').replace(/\D/g, '');
  return digits.slice(-10);
}

/** Returns the 1-indexed sheet row whose Phone matches, or null if no match / no phone. */
function findRowByPhone_(sheet, normalizedPhone) {
  if (!normalizedPhone) return null;
  const lastRow = sheet.getLastRow();
  if (lastRow < 2) return null; // header row only, or empty sheet

  const phones = sheet.getRange(2, PHONE_COL, lastRow - 1, 1).getValues();
  for (let i = 0; i < phones.length; i++) {
    if (normalizePhone_(phones[i][0]) === normalizedPhone) {
      return i + 2; // +2: 1-indexed sheet row, offset by the header row
    }
  }
  return null;
}

/** Optional: opening the /exec URL in a browser confirms the app is live. */
function doGet() {
  return json_({ result: 'ok', message: 'Diabetes Reversal lead endpoint is live.' });
}

/** Returns the "Leads" sheet, creating it with a header row if it doesn't exist. */
function getSheet_() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName(SHEET_NAME);
  if (!sheet) sheet = ss.insertSheet(SHEET_NAME);

  if (sheet.getLastRow() === 0) {
    sheet.appendRow(HEADERS);
    sheet.getRange(1, 1, 1, HEADERS.length).setFontWeight('bold');
    sheet.setFrozenRows(1);
  }
  return sheet;
}

/** Builds a JSON response with the correct mime type. */
function json_(obj) {
  return ContentService
    .createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}
