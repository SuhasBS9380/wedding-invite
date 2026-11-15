/**
 * Wedding invite – private guest log.
 *
 * Paste this into your Google Sheet: Extensions → Apps Script → replace everything → Save.
 * Then Deploy → New deployment → type "Web app" → Execute as: Me, Who has access: Anyone → Deploy.
 * Send the Web app URL to be put in src/data/invite.ts (trackUrl).
 *
 * The invitation sends one small message per event; this adds one row per message to the first sheet.
 * Only you (the sheet's owner) can see the rows: the web app accepts new rows but never returns any data.
 */
const HEADERS = ['Time (IST)', 'What happened', 'Visitor', 'Visit no.', 'Device', 'System', 'Browser', 'Opened from', 'Screen', 'Language', 'Time zone']
const EVENTS = { 'opened': 'Opened the link', 'tapped open': 'Tapped open the invitation', 'saw details': 'Saw the Muhurtham & venue', 'directions': 'Tapped Directions' }

function doPost(e) {
  const lock = LockService.getScriptLock()
  lock.tryLock(10000)
  try {
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheets()[0]
    if (sheet.getLastRow() === 0) {
      sheet.appendRow(HEADERS)
      sheet.getRange(1, 1, 1, HEADERS.length).setFontWeight('bold').setBackground('#f3e6c8')
      sheet.setFrozenRows(1)
    }
    const d = JSON.parse((e && e.postData && e.postData.contents) || '{}')
    const clip = (v) => String(v == null ? '' : v).slice(0, 120) // keep junk out
    sheet.appendRow([
      Utilities.formatDate(new Date(), 'Asia/Kolkata', 'dd MMM yyyy, hh:mm:ss a'),
      EVENTS[d.event] || clip(d.event),
      clip(d.visitor),
      Number(d.visit) || '',
      clip(d.device),
      clip(d.system),
      clip(d.browser),
      clip(d.from),
      clip(d.screen),
      clip(d.language),
      clip(d.timezone),
    ])
  } catch (err) {
    // ignore malformed messages
  } finally {
    lock.releaseLock()
  }
  return ContentService.createTextOutput('ok')
}

function doGet() {
  return ContentService.createTextOutput('ok')
}
