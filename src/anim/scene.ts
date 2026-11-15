import { createTimeline, onScroll, stagger } from 'animejs'
import type { AnimeCtx } from './useAnimeScope'
import { SCROLL_SYNC, canHover, isPhone, prefersReducedMotion } from './motion'
import { trackOnce } from '../lib/track'

const must = <T extends Element>(root: ParentNode, sel: string): T => {
  const el = root.querySelector<T>(sel)
  if (!el) throw new Error(`scene: missing ${sel}`)
  return el
}

const rand = (min: number, max: number) => min + Math.random() * (max - min)

/** Fired when a guest opens the map from the venue banner (src/sections/Scene.tsx); retires the hint. */
export const MAP_OPENED = 'invite:map-opened'

/**
 * Muhurtham scene. The sticky stage stays put while the section scrolls (progress 0→100):
 * the full-width temple canvas travels from its towers down to the courtyard, the kund appears and the
 * bride and groom come in from either side, then the two silk banners roll down from their rods and
 * their words appear. Anime.js drives this from scroll.
 *
 * Everything here animates only transform / opacity, on elements that are their own GPU layers, so phones
 * never have to repaint the banners (with their shadows) or the big temple image while you scroll.
 * The ambient loops (fire glow, embers, the couple's lean, banner sway, petals) are native Web Animations:
 * they run on the compositor thread, off the main thread that is busy with scrolling.
 */
export function setupScene({ root, scroller }: AnimeCtx) {
  const canvas = must<HTMLElement>(root, '.scene__canvas')
  const stick = must<HTMLElement>(root, '.scene__stick')

  /**
   * "Tap to open in Google Maps": once the banners' words are shown, a bubble pops up over the QR every few
   * seconds, the QR's ring pulses and a shine runs across the maps button, until the guest opens the map.
   * `is-hint` on the section shows the bubble statically when motion is reduced (scene.css).
   */
  const hint = { shown: false, visible: false, done: false, cls: false, anims: [] as Animation[] }
  const syncHint = () => {
    const on = hint.shown && !hint.done
    hint.anims.forEach((a) => (on && hint.visible ? a.play() : a.cancel()))
    if (on !== hint.cls) root.classList.toggle('is-hint', (hint.cls = on))
  }
  const onMapOpened = () => {
    hint.done = true
    syncHint()
  }
  window.addEventListener(MAP_OPENED, onMapOpened)
  const offHint = () => {
    window.removeEventListener(MAP_OPENED, onMapOpened)
    hint.anims.forEach((a) => a.cancel())
  }

  /**
   * The choreography in 0–100 units. `P` maps a unit position to the timeline position and `U` scales
   * stagger delays: laptops use units as they are (P = identity, U = 1).
   */
  const build = (P: (p: number) => number, U: number, travelEase: string) => {
    const at = (from: number, dur: number) => [P(from), P(from + dur) - P(from)] as const
    const tw = (from: number, dur: number) => at(from, dur)[1]
    // where the words start (the banner rods come at 58): auto-scroll eases back to its normal speed here
    // (src/components/AutoScroll.tsx). Stored as a share of the section's scroll range.
    root.dataset.textAt = String(P(56) / P(100))
    return createTimeline({
      defaults: { ease: 'out(3)' },
      autoplay: onScroll({ container: scroller, target: root, enter: 'start start', leave: 'end end', sync: SCROLL_SYNC }),
      // guest log: the banners and their words are fully shown from ~85% of the scene
      // (and the maps hint starts then; scrolling back up hides it)
      onUpdate: (self) => {
        if (self.progress > 0.85) {
          trackOnce('saw details')
          if (!hint.shown) {
            hint.shown = true
            syncHint()
          }
        } else if (self.progress < 0.8 && hint.shown) {
          hint.shown = false
          syncHint()
        }
      },
    })
      // scroll down through the temple: towers on sky → courtyard
      .add(canvas, { '--travel': [0, 1], duration: tw(0, 54), ease: travelEase }, P(0))
      .add(must(root, '.homa-kund'), { opacity: [0, 1], y: ['18%', '0%'], scale: [0.9, 1], duration: tw(42, 14) }, P(42))
      .add(must(root, '.homa-group__shadow'), { opacity: [0, 1], duration: tw(44, 14), ease: 'linear' }, P(44))
      .add(must(root, '.homa-fig--girl'), { opacity: [0, 1], x: ['-45%', '0%'], duration: tw(48, 18) }, P(48))
      .add(must(root, '.homa-fig--boy'), { opacity: [0, 1], x: ['45%', '0%'], duration: tw(50, 18) }, P(50))
      .add(must(root, '.homa-glow-wrap'), { opacity: [0, 1], duration: tw(54, 12), ease: 'linear' }, P(54))
      // the silk banners: rods slide down, then each cloth rolls down from behind its rod, then the words
      .add(root.querySelectorAll('.banner__rod'), { opacity: [0, 1], y: [-40, 0], duration: tw(58, 8), delay: stagger(3 * U) }, P(58))
      .add(root.querySelectorAll('.banner__roll'), { y: ['-101%', '0%'], duration: tw(61, 16), delay: stagger(3 * U), ease: 'inOut(2)' }, P(61))
      .add(root.querySelectorAll('[data-s="when"]'), { opacity: [0, 1], y: [14, 0], duration: tw(68, 10), delay: stagger(1.6 * U) }, P(68))
      .add(root.querySelectorAll('[data-s="where"]'), { opacity: [0, 1], y: [14, 0], duration: tw(71, 10), delay: stagger(1.8 * U) }, P(71))
      // hold the finished composition for the last part of the scroll
      .add({ duration: tw(98, 2) }, P(98))
  }

  let offFit: (() => void) | undefined
  if (!isPhone()) {
    build((p) => p, 1, 'inOut(1.4)')
  } else {
    // Phones: the canvas is only ~1.3 screens tall, so over 54% of the 340svh section it crawled at ~0.2x the
    // scroll. Here the travel gets exactly as much scroll as the canvas moves (1:1, linear) and everything
    // after it keeps today's scroll length; the section is sized to fit. Rebuilt on rotation / resize.
    let tl: ReturnType<typeof build> | null = null
    const fit = () => {
      tl?.revert()
      const v = stick.clientHeight
      const travel = Math.max(1, canvas.offsetHeight - v * 1.11) // (phone CSS stops 11% of a screen early)
      const u = (2.4 * v) / 100 // px of scroll per unit after the travel, as today (240svh / 100 units)
      const P = (p: number) => (p <= 54 ? (p / 54) * travel : travel + (p - 54) * u)
      root.style.height = `${v + P(100)}px`
      tl = build(P, u, 'linear')
    }
    fit()
    let t = 0
    const onResize = () => {
      window.clearTimeout(t)
      t = window.setTimeout(fit, 150)
    }
    window.addEventListener('resize', onResize)
    offFit = () => {
      window.removeEventListener('resize', onResize)
      window.clearTimeout(t)
      tl?.revert()
      root.style.height = ''
    }
  }

  if (prefersReducedMotion()) {
    return () => {
      offHint()
      offFit?.()
    }
  }

  // the maps hint (touch screens): a hand slides in over the QR, presses it (a gold ripple spreads from the
  // fingertip), presses again, then lifts away; every ~3.4 s. With a mouse the QR stays still and a bubble
  // shows on hover instead (scene.css).
  const hintAnim = (sel: string, frames: Keyframe[], opts: KeyframeAnimationOptions) => {
    const a = must(root, sel).animate(frames, { iterations: Infinity, ...opts })
    a.cancel()
    hint.anims.push(a)
  }
  if (!canHover()) {
    const TAP = { duration: 3400, delay: 400 }
    hintAnim('.seal__hand', [
      { opacity: 0, transform: 'translate(14px, 18px) scale(1)', offset: 0, easing: 'cubic-bezier(0.2, 0.8, 0.3, 1)' },
      { opacity: 1, transform: 'translate(0, 0) scale(1)', offset: 0.16 },
      { opacity: 1, transform: 'translate(0, 0) scale(0.82)', offset: 0.22, easing: 'ease-out' }, // press
      { opacity: 1, transform: 'translate(0, 0) scale(1)', offset: 0.3 },
      { opacity: 1, transform: 'translate(0, 0) scale(0.82)', offset: 0.38, easing: 'ease-out' }, // press again
      { opacity: 1, transform: 'translate(0, 0) scale(1)', offset: 0.46 },
      { opacity: 1, transform: 'translate(0, 0) scale(1)', offset: 0.62, easing: 'ease-in' },
      { opacity: 0, transform: 'translate(10px, 14px) scale(1)', offset: 0.74 },
      { opacity: 0, transform: 'translate(10px, 14px) scale(1)', offset: 1 },
    ], TAP)
    // each press (at 22% and 38% of the cycle) sends out a ripple...
    const ripple = (from: number, to: number) =>
      [0.22, 0.38].flatMap((p) => [
        { opacity: 0, transform: `scale(${from})`, offset: p - 0.005 },
        { opacity: 0.95, transform: `scale(${from})`, offset: p + 0.01, easing: 'cubic-bezier(0.2, 0.7, 0.3, 1)' },
        { opacity: 0, transform: `scale(${to})`, offset: p + 0.15 },
      ])
    const rippleAnim = (sel: string, from: number, to: number) =>
      hintAnim(sel, [{ opacity: 0, transform: `scale(${from})`, offset: 0 }, ...ripple(from, to), { opacity: 0, transform: `scale(${to})`, offset: 1 }], TAP)
    rippleAnim('.seal__tap-ring:not(.seal__tap-ring--soft)', 0.4, 1.7)
    rippleAnim('.seal__tap-ring--soft', 0.6, 2.3)
    // ...and a little burst of gold sparks flying out from the fingertip
    root.querySelectorAll<HTMLElement>('.seal__spark').forEach((spark, i, all) => {
      const a = (360 / all.length) * i + 15
      const at = (d: number) => `rotate(${a}deg) translateY(${-d}px)`
      const frames: Keyframe[] = [{ opacity: 0, transform: at(8), offset: 0 }]
      for (const p of [0.22, 0.38]) {
        frames.push(
          { opacity: 0, transform: at(8), offset: p },
          { opacity: 1, transform: at(12), offset: p + 0.02, easing: 'ease-out' },
          { opacity: 0, transform: at(22), offset: p + 0.1 },
        )
      }
      frames.push({ opacity: 0, transform: at(22), offset: 1 })
      const anim = spark.animate(frames, { iterations: Infinity, ...TAP })
      anim.cancel()
      hint.anims.push(anim)
    })
  }
  hintAnim('.bn__shine', [
    { transform: 'translateX(-130%) skewX(-20deg)', offset: 0, easing: 'ease-in-out' },
    { transform: 'translateX(330%) skewX(-20deg)', offset: 0.3 },
    { transform: 'translateX(330%) skewX(-20deg)', offset: 1 },
  ], { duration: 3400, delay: 1200 })

  const loops: Animation[] = []
  const loop = (el: Element, frames: Keyframe[], opts: KeyframeAnimationOptions) => {
    const a = el.animate(frames, { iterations: Infinity, ...opts })
    a.pause()
    loops.push(a)
  }
  const sway = 'cubic-bezier(0.45, 0, 0.55, 1)'

  // the light the fire throws: a slow flicker of its size (wrapped, so the timeline's fade above and this
  // flicker animate different elements)
  loop(must(root, '.homa-glow'), [{ transform: 'scale(0.92)' }, { transform: 'scale(1.1)' }], {
    duration: 380,
    direction: 'alternate',
    easing: 'ease-in-out',
  })
  // embers drift up and die out; the pause between rises is baked into each iteration
  root.querySelectorAll<HTMLElement>('.ember').forEach((ember) => {
    ember.style.left = `${rand(30, 70)}%`
    const rise = rand(1400, 2800)
    const rest = rand(100, 900)
    const end = rise / (rise + rest)
    const dx = rand(-36, 36)
    const dy = rand(-90, -190)
    loop(ember, [
      { transform: 'translate(0, 0) scale(1)', opacity: 0, offset: 0 },
      { opacity: 1, offset: end * 0.2 },
      { opacity: 0.8, offset: end * 0.6 },
      { transform: `translate(${dx}px, ${dy}px) scale(0.3)`, opacity: 0, offset: end },
      { transform: `translate(${dx}px, ${dy}px) scale(0.3)`, opacity: 0, offset: 1 },
    ], { duration: rise + rest, delay: rand(0, 2000), easing: 'ease-out' })
  })
  // the bride and groom lean in very slightly, as if pouring
  root.querySelectorAll('.homa-fig img').forEach((img, i) => {
    const r = i === 0 ? 1.4 : -1.4
    loop(img, [{ transform: 'rotate(0deg)' }, { transform: `rotate(${r}deg)` }], {
      duration: 1700 + i * 260,
      direction: 'alternate',
      easing: sway,
    })
  })
  // the banners sway gently on their rods (each its own rhythm); the tassels lag behind
  root.querySelectorAll('.banner__swing').forEach((sw, i) => {
    const r = i ? -0.9 : 0.9
    loop(sw, [{ transform: `rotate(${-r}deg)` }, { transform: `rotate(${r}deg)` }], {
      duration: 3400 + i * 600,
      direction: 'alternate',
      easing: sway,
    })
  })
  root.querySelectorAll('.banner__tassel').forEach((t, i) => {
    const r = i ? -4 : 4
    loop(t, [{ transform: `rotate(${-r}deg)` }, { transform: `rotate(${r}deg)` }], {
      duration: 3400 + i * 600,
      delay: 500,
      direction: 'alternate',
      easing: sway,
    })
  })
  // petals drift down, turning; each waits a moment off screen before falling again
  root.querySelectorAll<HTMLElement>('.petal').forEach((petal) => {
    const size = rand(9, 17)
    petal.style.left = `${rand(2, 98)}%`
    petal.style.width = `${size}px`
    petal.style.height = `${size * 0.72}px`
    const fall = rand(7000, 12000)
    const rest = rand(200, 2500)
    const end = fall / (fall + rest)
    const dx = rand(-90, 90)
    const r0 = rand(0, 180)
    const r1 = rand(360, 900)
    const at = (k: number) => `translate(${dx * k}px, calc(-8svh + ${116 * k}svh)) rotate(${r0 + (r1 - r0) * k}deg)`
    loop(petal, [
      { transform: at(0), opacity: 0, offset: 0 },
      { transform: at(0.25), opacity: 0.9, offset: end * 0.25 },
      { transform: at(0.75), opacity: 0.9, offset: end * 0.75 },
      { transform: at(1), opacity: 0, offset: end },
      { transform: at(1), opacity: 0, offset: 1 },
    ], { duration: fall + rest, delay: rand(0, 7000), easing: 'linear' })
  })

  // only run the loops while the scene is on screen
  onScroll({
    container: scroller,
    target: root,
    onEnter: () => {
      loops.forEach((l) => l.play())
      hint.visible = true
      syncHint()
    },
    onLeave: () => {
      loops.forEach((l) => l.pause())
      hint.visible = false
      syncHint()
    },
  })
  return () => {
    loops.forEach((l) => l.cancel())
    offHint()
    offFit?.()
  }
}
