import { useEffect } from 'react'
import { onOpen } from '../lib/intro'
import { createWakeLock } from '../lib/wakeLock'

/** Within this many px of the bottom counts as "reached the end" (same test as ScrollNudge). */
const END_PX = 40

/**
 * Keeps the screen on from the moment the invitation is opened until the guest reaches the end of it, so the
 * phone never times out mid-way (with auto-scroll running nobody touches the screen). At the end the lock is
 * released and the phone sleeps as normal; scrolling back up takes it again. Renders nothing.
 */
export function KeepAwake() {
  useEffect(() => {
    const scroller = document.querySelector<HTMLElement>('.scroller')
    if (!scroller) return
    const lock = createWakeLock()
    let raf = 0
    let opened = false
    const update = () => {
      raf = 0
      if (!opened) return
      const left = scroller.scrollHeight - scroller.clientHeight - scroller.scrollTop
      if (left > END_PX) lock.on()
      else lock.off()
    }
    const schedule = () => {
      if (!raf) raf = requestAnimationFrame(update)
    }
    scroller.addEventListener('scroll', schedule, { passive: true })
    const offOpen = onOpen(() => {
      opened = true
      update()
    })
    return () => {
      offOpen()
      scroller.removeEventListener('scroll', schedule)
      cancelAnimationFrame(raf)
      lock.destroy()
    }
  }, [])
  return null
}
