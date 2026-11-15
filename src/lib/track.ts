import { invite } from '../data/invite'

/**
 * Private guest log. Each event becomes one row in the admin's own Google Sheet (see scripts/guest-log.gs).
 * Guests see and type nothing: the row is sent in the background with navigator.sendBeacon, which never
 * blocks the page. Nothing personal is collected (no names, numbers, cookies or location); a random
 * visitor code in localStorage only tells repeat opens from the same browser apart.
 *
 * Off when `invite.trackUrl` is empty, on localhost, and on the admin's own devices
 * (open the site once with `?me` to mark a device; `?me=off` to unmark it).
 */
export type TrackEvent = 'opened' | 'tapped open' | 'saw details' | 'directions'

const store = {
  get(k: string) {
    try {
      return localStorage.getItem(k)
    } catch {
      return null
    }
  },
  set(k: string, v: string) {
    try {
      localStorage.setItem(k, v)
    } catch {
      /* private mode etc.: fine, the row just won't link repeat visits */
    }
  },
}

function enabled() {
  if (!invite.trackUrl) return false
  const me = new URLSearchParams(location.search).get('me')
  if (me !== null) store.set('invite-admin', me === 'off' ? '0' : '1')
  if (store.get('invite-admin') === '1') return false
  const local = /^(localhost|127\.|192\.168\.)/.test(location.hostname)
  return !local || store.get('invite-track-test') === '1' // (the test flag lets a local check run)
}

const visitor = () => {
  let id = store.get('invite-visitor')
  if (!id) {
    id = 'v-' + Math.random().toString(36).slice(2, 7)
    store.set('invite-visitor', id)
  }
  return id
}

let visitNo = 0
const nextVisit = () => {
  const n = Number(store.get('invite-visits') || 0) + 1
  store.set('invite-visits', String(n))
  return n
}

function describe() {
  const ua = navigator.userAgent
  const touch = navigator.maxTouchPoints > 0
  const w = Math.min(screen.width, screen.height)
  const device = touch ? (w >= 600 ? 'Tablet' : 'Phone') : 'Laptop / desktop'
  const system = /Android/i.test(ua) ? 'Android' : /iPhone|iPad|iPod/i.test(ua) ? 'iPhone / iPad' : /Windows/i.test(ua) ? 'Windows' : /Mac OS/i.test(ua) ? 'Mac' : /Linux/i.test(ua) ? 'Linux' : 'Other'
  const browser = /EdgA?\//.test(ua) ? 'Edge' : /SamsungBrowser/.test(ua) ? 'Samsung Internet' : /OPR\/|Opera/.test(ua) ? 'Opera' : /Firefox|FxiOS/.test(ua) ? 'Firefox' : /CriOS|Chrome/.test(ua) ? 'Chrome' : /Safari/.test(ua) ? 'Safari' : 'Other'
  const app = /WhatsApp/i.test(ua) ? 'WhatsApp' : /Instagram/i.test(ua) ? 'Instagram' : /FBAN|FBAV/i.test(ua) ? 'Facebook' : ''
  let from = app
  if (!from && document.referrer) {
    try {
      const host = new URL(document.referrer).hostname
      from = host === location.hostname ? '' : host.replace(/^www\./, '')
    } catch {
      /* ignore */
    }
  }
  return {
    device,
    system,
    browser,
    from: from || 'Direct link (e.g. WhatsApp chat)',
    screen: `${screen.width}x${screen.height}`,
    language: navigator.language,
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
  }
}

export function track(event: TrackEvent) {
  try {
    if (!enabled()) return
    if (event === 'opened') visitNo = nextVisit()
    const row = { event, visitor: visitor(), visit: visitNo || Number(store.get('invite-visits') || 1), ...describe() }
    const body = JSON.stringify(row)
    // text/plain needs no CORS preflight; Apps Script reads the raw body
    const blob = new Blob([body], { type: 'text/plain;charset=utf-8' })
    if (!navigator.sendBeacon?.(invite.trackUrl, blob)) {
      fetch(invite.trackUrl, { method: 'POST', body, mode: 'no-cors', keepalive: true }).catch(() => {})
    }
  } catch {
    /* tracking must never break the invitation */
  }
}

/** Fire `event` the first time only (per page load). */
const sent = new Set<TrackEvent>()
export function trackOnce(event: TrackEvent) {
  if (sent.has(event)) return
  sent.add(event)
  track(event)
}
