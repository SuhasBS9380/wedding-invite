/**
 * The invitation starts "gated" behind the cloud intro (src/components/CloudGate.tsx). Opening it
 * (one tap) unlocks scrolling, starts the hero entrance and shows the music button.
 * `<html>` carries `gated` until then (set in index.html) and `opened` after, for CSS.
 */
import { track } from './track'

const EVT = 'invite:open'
let opened = false

export const isOpened = () => opened

export function openInvite() {
  if (opened) return
  opened = true
  document.documentElement.classList.remove('gated')
  document.documentElement.classList.add('opened')
  window.dispatchEvent(new Event(EVT))
  track('tapped open')
}

/** Runs `cb` once the invite is opened (immediately if it already is). Returns an unsubscribe. */
export function onOpen(cb: () => void): () => void {
  if (opened) {
    cb()
    return () => {}
  }
  window.addEventListener(EVT, cb, { once: true })
  return () => window.removeEventListener(EVT, cb)
}
