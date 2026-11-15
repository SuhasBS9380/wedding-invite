import { useEffect, useState } from 'react'
import { useLang } from '../i18n/lang'
import { onOpen } from '../lib/intro'
import { isPhone } from '../anim/motion'
import { autoScrollOn } from '../lib/autoScroll'

/** How long the page has to stand still before the hint comes back. */
const IDLE_MS = 2000

/**
 * The "Swipe up" hint, brought back whenever the page has stood still for 2 s with more still below: after a
 * touch has paused the auto-scroll, or when a guest simply stops scrolling part way. It fades as soon as the
 * page moves again and never shows at the end. Fixed to the screen, so it works over every section.
 */
export function ScrollNudge() {
  const { invite, t } = useLang()
  // a number, so the effect is not re-bound when the language (and with it the invite object) changes
  const startAfterMs = invite.autoScroll.startAfterMs
  const [shown, setShown] = useState(false)

  useEffect(() => {
    const scroller = document.querySelector<HTMLElement>('.scroller')
    if (!scroller) return
    const auto = autoScrollOn()
    let lastMove = performance.now()
    // not during the opening: the names come in first (and without auto-scroll the hero has its own hint)
    let enableAt = Infinity
    const onScroll = () => {
      lastMove = performance.now()
      setShown(false)
    }
    // a touch that pauses the auto-scroll starts the 2 s count too
    const onTouch = () => (lastMove = performance.now())
    scroller.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('pointerdown', onTouch, { passive: true })
    const offOpen = onOpen(() => {
      lastMove = performance.now()
      enableAt = lastMove + Math.max(startAfterMs, 4500)
    })
    const id = window.setInterval(() => {
      const now = performance.now()
      const left = scroller.scrollHeight - scroller.clientHeight - scroller.scrollTop
      // (without auto-scroll the first screen already has the hero's own hint)
      const heroHint = !auto && scroller.scrollTop < scroller.clientHeight * 0.1
      setShown(now > enableAt && now - lastMove > IDLE_MS && left > 40 && !heroHint)
    }, 250)
    return () => {
      scroller.removeEventListener('scroll', onScroll)
      window.removeEventListener('pointerdown', onTouch)
      offOpen()
      window.clearInterval(id)
    }
  }, [startAfterMs])

  return (
    <div className={`nudge${shown ? ' is-shown' : ''}`} aria-hidden="true">
      <span className="hero__chev nudge__chev">
        <i />
        <i />
        <i />
      </span>
      <span className="hero__cue-pill">{isPhone() ? t.swipeUp : t.scroll}</span>
    </div>
  )
}
