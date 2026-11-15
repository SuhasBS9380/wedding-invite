import { useEffect } from 'react'
import { invite } from '../data/invite'
import { onOpen } from '../lib/intro'
import { isPhone } from '../anim/motion'
import { autoScrollOn } from '../lib/autoScroll'

/**
 * Experiment: after the invitation opens and the names have landed, the page glides down until the end.
 * It moves at a steady speed, a little faster (`templeBoost`) through the temple scenes that carry no words,
 * easing back to the normal speed before the invitation card and the banners. The guest stays in charge: any
 * touch, wheel, click or key pauses it at once, and it carries on from wherever they are after a few seconds
 * without input. Renders nothing.
 *
 * The position is kept as a float and advanced by real elapsed time each frame, so the speed stays even
 * whatever the frame rate; the scroll-linked scenes follow it as they follow a finger.
 */
export function AutoScroll() {
  useEffect(() => {
    if (!autoScrollOn()) return
    const scroller = document.querySelector<HTMLElement>('.scroller')
    if (!scroller) return
    const { pxPerSecond, templeBoost, startAfterMs, resumeAfterMs } = invite.autoScroll
    const base = isPhone() ? pxPerSecond.phone : pxPerSecond.laptop
    const card = document.getElementById('invite')
    const scene = document.getElementById('scene')

    /** Is this scroll position in a temple stretch with no words on screen? */
    const inTemple = (y: number) => {
      const vh = scroller.clientHeight
      // the tower rising, from once the names have mostly gone until the invitation card is coming up
      if (card && y > vh * 0.4 && y < card.offsetTop - vh * 0.6) return true
      // the temple courtyard, from once the card has scrolled away until a little before the banners
      if (scene) {
        const textAt = Number(scene.dataset.textAt ?? 0.5)
        const words = scene.offsetTop + textAt * (scene.offsetHeight - vh)
        if (y >= scene.offsetTop && y < words - vh * 0.15) return true
      }
      return false
    }

    let raf = 0
    let last = 0
    let pos = 0
    let speed = base
    let timer = 0
    let poll = 0
    let done = false
    let lastActivity = 0 // the guest's last touch / key, or the page's last movement while paused

    const step = (now: number) => {
      const dt = last ? Math.min(0.1, (now - last) / 1000) : 0 // (a long gap, e.g. a background tab, never jumps)
      last = now
      // glide between the normal and the temple speed (~0.6 s), never a sudden change
      const target = inTemple(pos) ? base * templeBoost : base
      speed += (target - speed) * (1 - Math.exp(-dt / 0.6))
      const max = scroller.scrollHeight - scroller.clientHeight
      pos = Math.min(max, pos + speed * dt)
      scroller.scrollTop = pos
      if (pos >= max - 0.5) {
        done = true // reached the end: stays stopped
        return
      }
      raf = requestAnimationFrame(step)
    }
    const run = () => {
      window.clearInterval(poll)
      poll = 0
      if (done || raf) return
      pos = scroller.scrollTop // carry on from wherever the guest has got to
      speed = inTemple(pos) ? base * templeBoost : base
      last = 0
      raf = requestAnimationFrame(step)
    }
    const pause = () => {
      cancelAnimationFrame(raf)
      raf = 0
    }
    // The guest touched / scrolled / pressed something: hand over. It comes back only once the page has
    // stood completely still for `resumeAfterMs` (a swipe's momentum counts as moving): the "Swipe up" hint
    // shows after 2 s of stillness (ScrollNudge), so it stays up for a few seconds before the page moves.
    const onInput = () => {
      pause()
      lastActivity = performance.now()
      if (!poll && !done) {
        poll = window.setInterval(() => {
          if (performance.now() - lastActivity >= resumeAfterMs) run()
        }, 200)
      }
    }
    const onScroll = () => {
      if (!raf) lastActivity = performance.now() // (its own movement doesn't count)
    }
    const events = ['touchstart', 'touchmove', 'pointerdown', 'wheel', 'keydown'] as const

    const offOpen = onOpen(() => {
      events.forEach((e) => window.addEventListener(e, onInput, { passive: true }))
      scroller.addEventListener('scroll', onScroll, { passive: true })
      timer = window.setTimeout(run, startAfterMs)
    })
    return () => {
      offOpen()
      pause()
      window.clearTimeout(timer)
      window.clearInterval(poll)
      events.forEach((e) => window.removeEventListener(e, onInput))
      scroller.removeEventListener('scroll', onScroll)
    }
  }, [])
  return null
}
