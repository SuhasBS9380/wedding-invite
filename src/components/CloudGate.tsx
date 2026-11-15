import { useEffect, useRef, useState, type TouchEvent, type WheelEvent } from 'react'
import { animate, createTimeline, stagger } from 'animejs'
import { useLang } from '../i18n/lang'
import { asset } from '../lib/asset'
import { openInvite } from '../lib/intro'
import { createCloudBank, type CloudBank } from '../anim/clouds'
import { prefersReducedMotion } from '../anim/motion'
import { sleep, withTimeout } from '../lib/async'

/** The faces the opening needs: its label ("Tap to open", "the invitation") and the names right after it. */
const GATE_FONTS_EN = ['italic 500 34px "Cormorant Garamond"', '500 13px Jost', '500 40px "Cormorant Garamond"']
const GATE_FONTS_KN = ['500 30px "Noto Serif Kannada"', '500 14px "Noto Serif Kannada"', '600 40px "Noto Serif Kannada"']

/**
 * Opening screen: the sky is covered by a bank of real clouds with a gold "tap to open" seal.
 * One tap (also the gesture that lets the music start) ripples the seal, parts the clouds and reveals
 * the hero underneath, which starts its entrance (src/lib/intro.ts).
 */
export function CloudGate() {
  const [gone, setGone] = useState(false)
  // once the clouds have parted the gate unmounts, which stops its canvas loop and seal animations
  return gone ? null : <Gate onDone={() => setGone(true)} />
}

function Gate({ onDone }: { onDone: () => void }) {
  const { lang, t } = useLang()
  const root = useRef<HTMLDivElement>(null)
  const canvas = useRef<HTMLCanvasElement>(null)
  const bank = useRef<CloudBank | null>(null)
  const opening = useRef(false)

  useEffect(() => {
    if (!canvas.current || !root.current) return
    const b = createCloudBank(canvas.current)
    bank.current = b
    const r = root.current
    // the soft white placeholder (CSS) covers the screen from the first frame; it fades as the clouds fade in
    b.ready.then(() => r.classList.add('is-ready'))
    if (prefersReducedMotion()) return () => b.destroy()
    // the seal settles in, then breathes; its outer hairline keeps pulsing outwards
    const intro = createTimeline({ defaults: { ease: 'out(3)' } })
      .add(r.querySelector('.gate__glow')!, { opacity: [0, 1], scale: [0.85, 1], duration: 1800 }, 0)
      .add(r.querySelector('.gate__disc')!, { opacity: [0, 1], scale: [0.86, 1], duration: 1400 }, 300)
      .add(r.querySelector('.gate__mono')!, { opacity: [0, 1], y: [6, 0], duration: 1200 }, 650)
    // "Tap to open" appears once its fonts are in (it never rises in a fallback font and then swaps), at the
    // earliest 0.9 s in, at the latest ~2 s in. Waiting also fetches the names' font before the first tap.
    let cancelled = false
    let label: { pause(): void } | undefined
    void (async () => {
      const t0 = performance.now()
      const faces = lang === 'kn' ? GATE_FONTS_KN : GATE_FONTS_EN
      await withTimeout(Promise.all(faces.map((f) => document.fonts.load(f))), 2000)
      await sleep(900 - (performance.now() - t0))
      if (cancelled || opening.current) return
      label = animate(r.querySelector('.gate__label')!, { opacity: [0, 1], y: [8, 0], duration: 1100, ease: 'out(3)' })
    })()
    const pulse = animate(r.querySelector('.gate__pulse')!, {
      scale: [1, 1.42],
      opacity: [0.7, 0],
      duration: 2600,
      loop: true,
      ease: 'out(2)',
    })
    const float = animate(r.querySelector('.gate__seal')!, { y: [0, -5], duration: 2800, loop: true, alternate: true, ease: 'inOut(2)' })
    return () => {
      cancelled = true
      label?.pause()
      intro.pause()
      pulse.pause()
      float.pause()
      b.destroy()
    }
  }, [lang])

  const open = () => {
    if (!root.current || !bank.current) return
    // a second tap while the clouds are parting hurries them along
    if (opening.current) return bank.current.hurry()
    opening.current = true
    const r = root.current
    r.classList.add('is-ready')
    // once the invitation is showing, touches pass through the drifting clouds to the page (scroll right away)
    const reveal = () => {
      r.classList.add('is-revealed')
      openInvite()
    }
    if (prefersReducedMotion()) {
      reveal()
      animate(r, { opacity: 0, duration: 600, ease: 'linear', onComplete: onDone })
      return
    }
    // gold ripple from the seal, the seal lifts away, then the clouds part
    animate(r.querySelectorAll('.gate__ripple'), {
      scale: [1, 7],
      opacity: [0.8, 0],
      duration: 2400,
      delay: stagger(260),
      ease: 'out(2.5)',
    })
    animate(r.querySelector('.gate__seal')!, { opacity: 0, scale: 1.06, y: -10, duration: 1400, ease: 'inOut(2)' })
    animate(r.querySelector('.gate__glow')!, { opacity: 0, scale: 1.25, duration: 1600, ease: 'inOut(2)' })
    bank.current.open(reveal).then(onDone)
  }

  // trying to scroll the closed invitation (a swipe, a wheel turn) opens it too
  const touchY = useRef(0)
  const onTouchStart = (e: TouchEvent) => (touchY.current = e.touches[0].clientY)
  const onTouchMove = (e: TouchEvent) => {
    if (!opening.current && Math.abs(e.touches[0].clientY - touchY.current) > 24) open()
  }
  const onWheel = (e: WheelEvent) => {
    if (!opening.current && Math.abs(e.deltaY) > 4) open()
  }

  const mono = `url(${asset('assets/monogram.webp')})`
  return (
    <div ref={root} className="gate" onClick={open} onTouchStart={onTouchStart} onTouchMove={onTouchMove} onWheel={onWheel}>
      <canvas ref={canvas} className="gate__sky" aria-hidden="true" />
      {/* sunlight breaking through the clouds behind the seal: lifts the text off the clouds, no hard box */}
      <i className="gate__glow" aria-hidden="true" />
      <i className="gate__ripple" aria-hidden="true" />
      <i className="gate__ripple" aria-hidden="true" />
      <button type="button" className="gate__seal" aria-label={t.gateOpen}>
        <span className="gate__pulse" aria-hidden="true" />
        <span className="gate__disc">
          <span className="gate__mono" style={{ WebkitMaskImage: mono, maskImage: mono }} />
        </span>
        <span className="gate__label">
          <span className="gate__tap">{t.gateTap}</span>
          <span className="gate__sub">
            <i aria-hidden="true" />
            {t.gateSub}
            <i aria-hidden="true" />
          </span>
        </span>
      </button>
    </div>
  )
}
