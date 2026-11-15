import { animate, createTimeline, onScroll, stagger } from 'animejs'
import type { AnimeCtx } from './useAnimeScope'
import { SCROLL_SYNC, isPhone, prefersReducedMotion } from './motion'
import { onOpen } from '../lib/intro'
import { autoScrollOn } from '../lib/autoScroll'

const must = <T extends Element>(root: ParentNode, sel: string): T => {
  const el = root.querySelector<T>(sel)
  if (!el) throw new Error(`hero: missing ${sel}`)
  return el
}

/** Share of the tower art above the gopuram's finials (empty sky), measured from temple.webp. */
const TOWER_TIP = 0.08
/** How much of the gopuram shows above the bottom edge on the names screen, as a share of the screen
 *  (0: hidden, its tip waiting right at the edge, so it rises into view the moment scrolling starts). */
const PEEK = 0

/**
 * Scroll-linked hero choreography. The timeline's progress IS the scroll progress through the hero
 * section, measured in "svh of scroll" units: 0–100 first screen, then the long rise.
 * The sticky stage is released when the section ends, so the temple stays glued to the arch below.
 *
 * Laptops: the long rise is 200 units (the section is 400svh) and the tower's travel happens to be about
 * as long, so it moves with the scroll. Phones: the tower is only ~1.35 screens tall, so over 200 units it
 * crawled at ~0.18x the scroll. There, the long rise gets exactly as much scroll as the tower travels
 * (1:1) and the section is sized to match; rebuilt on rotation / resize.
 */
export function setupHeroScroll({ root, scroller }: AnimeCtx) {
  const skyImg = must(root, '.hero__sky img')
  const title = must(root, '.hero__title')
  const temple = must(root, '.hero__temple')
  const tower = must<HTMLElement>(root, '.tower-group')
  const cue = must(root, '.hero__cue')
  const stick = must<HTMLElement>(root, '.hero__stick')

  /**
   * Where the temple starts, in px below its final place: with the gopuram's tip right at the bottom edge
   * (the top 8% of the tower art is empty sky), so it rises into view the moment scrolling starts instead of
   * after a stretch of bare sky. (+2px keeps the very tip of the finial off screen.)
   */
  const startY = () => {
    const v = stick.clientHeight
    return Math.max(0, v - tower.offsetHeight * TOWER_TIP - v * PEEK + 2)
  }

  const build = (rise: number) =>
    createTimeline({
      defaults: { ease: 'linear' },
      autoplay: onScroll({ container: scroller, target: root, enter: 'start start', leave: 'end end', sync: SCROLL_SYNC }),
    })
      // first screen: sky drifts, title lifts away, the temple rises in from below
      .add(skyImg, { y: ['0%', '-6%'], duration: 100 }, 0)
      .add(title, { y: ['0%', '-7%'], duration: 100 }, 0)
      .add(must(root, '.hero__cloud--a'), { y: ['0%', '-12%'], duration: 100 }, 0)
      .add(must(root, '.hero__cloud--b'), { y: ['0%', '-22%'], duration: 100 }, 0)
      .add(title, { opacity: [1, 0], duration: 34, ease: 'inOut(2)' }, 62)
      .add(cue, { opacity: [1, 0], duration: 10 }, 0)
      .add(temple, { y: [`${startY()}px`, '0px'], duration: 100, ease: 'linear' }, 0)
      // long rise: the tower travels top→bottom of its art
      .add(tower, { '--travel': [0, 1], duration: rise }, 100)

  if (!isPhone()) {
    build(200)
    return
  }

  // phones: 1 unit = 1% of the stage height; the long rise = the tower's travel in those units
  let tl: ReturnType<typeof build> | null = null
  const fit = () => {
    tl?.revert()
    const v = stick.clientHeight
    const travel = Math.max(1, tower.offsetHeight - v)
    root.style.height = `${2 * v + travel}px` // stage + rise-in (1 screen) + long rise, all 1:1
    tl = build((travel / v) * 100)
  }
  fit()
  let t = 0
  const onResize = () => {
    window.clearTimeout(t)
    t = window.setTimeout(fit, 150)
  }
  window.addEventListener('resize', onResize)
  return () => {
    window.removeEventListener('resize', onResize)
    window.clearTimeout(t)
    tl?.revert()
    root.style.height = ''
  }
}

/**
 * Entrance, played when the cloud gate opens (src/lib/intro.ts): the sky settles, the monogram appears,
 * each name's letters rise out of a mask while drifting in from a wider spacing and coming into focus,
 * "weds" opens between its hairlines, the flourish draws, and a warm light sweeps once across both names.
 * Afterwards the light sweeps again now and then, and the cloud corners keep drifting.
 */
export function setupHeroIntro({ root, scroller }: AnimeCtx) {
  if (prefersReducedMotion()) return
  // phones skip the focus blur: blurring ~20 letters every frame is costly for a phone GPU
  const phone = window.matchMedia('(max-width: 899px)').matches
  const names = [...root.querySelectorAll('.hn')]
  const allCh = root.querySelectorAll('.hn__ch')
  const white = root.querySelectorAll('.hn__ch:not(.hn__ch--gold)')
  const gold = root.querySelectorAll('.hn__ch--gold')
  const clouds = root.querySelectorAll('.hero__cloud')
  const GOLD_SHADOW = 'drop-shadow(0 2px 10px rgba(6, 40, 110, 0.4))'

  // Phones: the letters run as native Web Animations (GPU compositor), started when the invite opens.
  // They play while the cloud canvas is still parting on the main thread, so JS-driven letters would stutter.
  const phoneIntro: (() => void)[] = []

  /** letters of one name: rise + converge from a wider tracking + focus (blur only on the plain letters) */
  const nameIn = (tl: ReturnType<typeof createTimeline>, name: Element, at: number) => {
    const chars = [...name.querySelectorAll<HTMLElement>('.hn__ch')]
    const mid = (chars.length - 1) / 2
    if (phone) {
      // each letter rises out of its mask, drifting in from a wider spacing and settling from a hair larger;
      // the centre letters lead, the ends follow (same choreography as on laptops, minus the blur)
      phoneIntro.push(() =>
        chars.forEach((c, i) => {
          const fromCentre = Math.abs(i - mid)
          c.animate(
            [
              { transform: `translate(${(i - mid) * 0.09}em, 105%) scale(1.06)`, opacity: 0 },
              { transform: 'translate(0, 0) scale(1)', opacity: 1 },
            ],
            { duration: 1500, delay: at + fromCentre * 38, easing: 'cubic-bezier(0.16, 1, 0.3, 1)', fill: 'both' },
          )
        }),
      )
      return
    }
    const spread = (_?: unknown, i = 0) => [`${(i - mid) * 0.09}em`, '0em']
    tl.add(chars, { y: ['105%', '0%'], x: spread, opacity: [0, 1], duration: 1500, delay: stagger(38, { from: 'center' }), ease: 'out(4)' }, at)
    const plain = chars.filter((c) => !c.classList.contains('hn__ch--gold'))
    tl.add(plain, {
      filter: ['blur(7px)', 'blur(0px)'],
      duration: 1300,
      delay: stagger(38, { from: 'center' }),
      ease: 'out(3)',
      onComplete: () => plain.forEach((c) => (c.style.filter = '')),
    }, at)
  }

  const tl = createTimeline({ autoplay: false, defaults: { ease: 'out(4)' } })
    .add(must(root, '.hero__sky'), { scale: [1.12, 1], duration: 3200, ease: 'out(3)' }, 0)
    .add(must(root, '.hero__cloud--a'), { opacity: [0, 1], x: ['-14%', '0%'], duration: 2600, ease: 'out(3)' }, 0)
    .add(must(root, '.hero__cloud--b'), { opacity: [0, 1], x: ['14%', '0%'], duration: 2600, ease: 'out(3)' }, 0)
    .add(must(root, '.title__mono'), { opacity: [0, 1], scale: [0.82, 1], y: [10, 0], duration: 1600, ease: 'out(3)' }, 250)
  nameIn(tl, names[0], 650)
  tl.add(root.querySelectorAll('.title__line'), { opacity: [0, 1], scaleX: [0, 1], duration: 1100, ease: 'inOut(3)' }, 1300)
    .add(must(root, '.title__weds em'), { opacity: [0, 1], y: [8, 0], ...(phone ? {} : { filter: ['blur(5px)', 'blur(0px)'] }), duration: 1100, ease: 'out(3)' }, 1400)
  nameIn(tl, names[1], 1550)
  tl.add(must(root, '.title__flourish path'), { opacity: [0, 1], strokeDashoffset: [1, 0], duration: 1300, ease: 'inOut(3)' }, 2500)
    // (phones: no letter-spacing animation, it re-lays the line out every frame)
    .add(must(root, '.title__sub'), { opacity: [0, 1], y: [8, 0], ...(phone ? {} : { letterSpacing: ['0.6em', '0.24em'] }), duration: 1600, ease: 'out(3)' }, 2700)
  // the swipe hint comes once the music button's "Now playing" has closed, so the two don't compete
  // (not with auto-scroll: the page is already moving by itself)
  const auto = autoScrollOn()
  if (!auto) tl.add(must(root, '.hero__cue-in'), { opacity: [0, 1], y: [12, 0], duration: 1000, ease: 'out(3)' }, CUE_AT)

  // a warm light passing across the names letter by letter, first once the names have landed, then every
  // few seconds (plain letters warm up; the gold initials brighten, keeping their shadow)
  const SWEEP = { duration: 900, loop: true, loopDelay: 6500, ease: 'inOut(2)', autoplay: false } as const
  const loops = [
    animate(white, { ...SWEEP, color: ['#ffffff', '#ffe6a6', '#ffffff'], delay: stagger(45, { start: 3000 }) }),
    animate(gold, {
      ...SWEEP,
      filter: [`${GOLD_SHADOW} brightness(1)`, `${GOLD_SHADOW} brightness(1.5)`, `${GOLD_SHADOW} brightness(1)`],
      delay: stagger(45 * (allCh.length / Math.max(1, gold.length)), { start: 3000 }),
    }),
    // the cloud corners drift as whole layers, mask and all (native animation of `translate`, which the
    // scroll timeline's `transform` doesn't touch). Moving the photo inside its soft mask instead made
    // phones re-draw the mask every frame.
    ...[...clouds].map((cloud, i) => {
      const a = cloud.animate([{ translate: '0 0' }, { translate: `${i ? -4 : 4}% 0` }], {
        duration: 42000 + i * 9000,
        iterations: Infinity,
        direction: 'alternate',
        easing: 'ease-in-out',
      })
      a.pause()
      return a
    }),
    // the swipe hint: a light runs up the chevrons, bottom one first, then a pause
    ...[...root.querySelectorAll('.hero__chev i')].map((chev, i, all) => {
      const a = chev.animate(
        [
          { opacity: 0.5, transform: 'translateY(5px) rotate(45deg)', offset: 0 },
          { opacity: 1, transform: 'translateY(-3px) rotate(45deg)', offset: 0.22 },
          { opacity: 0.5, transform: 'translateY(-6px) rotate(45deg)', offset: 0.5 },
          { opacity: 0.5, transform: 'translateY(5px) rotate(45deg)', offset: 1 },
        ],
        { duration: 1700, delay: (all.length - 1 - i) * 170, iterations: Infinity, easing: 'ease-in-out' },
      )
      a.pause()
      return a
    }),
  ]

  // the loops only run while the hero is on screen (off screen they would cost every frame for nothing)
  let opened = false
  let visible = true
  const sync = () => loops.forEach((l) => (opened && visible ? l.play() : l.pause()))
  onScroll({
    container: scroller,
    target: root,
    onEnter: () => ((visible = true), sync()),
    onLeave: () => ((visible = false), sync()),
  })
  let peekTimer = 0
  let stopPeek: (() => void) | undefined
  const offOpen = onOpen(() => {
    opened = true
    tl.play()
    phoneIntro.forEach((start) => start())
    sync()
    // phones: if nobody has scrolled a little after the hint appears, show what scrolling does, once
    if (phone && !auto) peekTimer =window.setTimeout(() => (stopPeek = peek(scroller)), CUE_AT + 3000)
  })
  return () => {
    offOpen()
    window.clearTimeout(peekTimer)
    stopPeek?.()
  }
}

/** When the swipe hint appears, in ms after the invitation opens ("Now playing" closes at ~5.6 s). */
const CUE_AT = 5800

/**
 * A light demo scroll: the page glides up a little (the temple starts to rise) and settles back.
 * Skipped if the visitor has already scrolled; any touch, wheel or key hands control straight back.
 */
function peek(scroller: HTMLElement) {
  if (scroller.scrollTop > 2) return
  const UP = 64
  const DURATION = 1600
  const events = ['touchstart', 'pointerdown', 'wheel', 'keydown'] as const
  let raf = 0
  let t0 = 0
  const stop = () => {
    cancelAnimationFrame(raf)
    events.forEach((e) => window.removeEventListener(e, stop))
  }
  const step = (now: number) => {
    t0 ||= now
    const k = Math.min(1, (now - t0) / DURATION)
    // quick rise, gentle settle: sin over an eased clock
    const e = k < 0.5 ? 2 * k * k : 1 - (-2 * k + 2) ** 2 / 2
    scroller.scrollTop = UP * Math.sin(Math.PI * e)
    if (k < 1) raf = requestAnimationFrame(step)
    else stop()
  }
  events.forEach((e) => window.addEventListener(e, stop, { passive: true }))
  raf = requestAnimationFrame(step)
  return stop
}
