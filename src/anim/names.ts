import { createTimeline, stagger, type Timeline } from 'animejs'
import type { AnimeCtx } from './useAnimeScope'
import { prefersReducedMotion } from './motion'
import { inView } from './inView'

/**
 * Bride & groom reveal. Each `[data-couple]` block plays its own timeline once when it scrolls into view:
 * the flourish draws, the name's letters rise out of a mask from the centre outwards and catch a glint,
 * the parents' line follows; the "&" pops in while its hairlines grow from the middle.
 * Hidden start states live in arch.css (`html.js .couple …`), so nothing flashes before JS runs.
 */
export function setupNames({ root, scroller }: AnimeCtx) {
  if (prefersReducedMotion()) return

  const tls = new Map<HTMLElement, Timeline>()
  // phones: no letter-spacing animation on the parents' lines (it re-lays the text out every frame)
  const phone = window.matchMedia('(max-width: 899px)').matches

  root.querySelectorAll<HTMLElement>('[data-couple]').forEach((el) => {
    const tl = createTimeline({ autoplay: false, defaults: { ease: 'out(4)' } })
    const chars = el.querySelectorAll('.couple__ch')
    const flourish = el.querySelector('.couple__flourish path')
    const parents = el.querySelector('.couple__parents')
    const and = el.querySelector('.couple__and')
    const lines = el.querySelectorAll('.couple__line')
    // the bride's block has its flourish last, so it closes the composition instead of opening it
    const flourishLast = !!flourish && el.lastElementChild?.contains(flourish)

    if (flourish && !flourishLast) {
      tl.add(flourish, { strokeDashoffset: [1, 0], opacity: [0, 1], duration: 900, ease: 'inOut(3)' }, 0)
    }
    if (chars.length) {
      tl.add(
        chars,
        {
          y: ['115%', '0%'],
          rotate: [7, 0],
          opacity: [0, 1],
          duration: 1000,
          delay: stagger(55, { from: 'center' }),
        },
        flourish && !flourishLast ? 250 : 0,
      )
      // a glint travelling across the letters once they have landed
      tl.add(
        chars,
        {
          filter: ['brightness(1)', 'brightness(1.45)', 'brightness(1)'],
          duration: 700,
          delay: stagger(45),
          ease: 'inOut(2)',
        },
        '-=350',
      )
    }
    if (parents) {
      tl.add(parents, { opacity: [0, 1], y: [16, 0], ...(phone ? {} : { letterSpacing: ['0.08em', '0em'] }), duration: 900 }, chars.length ? 650 : 0)
    }
    if (flourish && flourishLast) {
      tl.add(flourish, { strokeDashoffset: [1, 0], opacity: [0, 1], duration: 900, ease: 'inOut(3)' }, 900)
    }
    if (and) {
      tl.add(and, { scale: [0.3, 1], rotate: [-12, 0], opacity: [0, 1], duration: 900, ease: 'outBack(1.8)' }, 0)
      tl.add(lines, { scaleX: [0, 1], opacity: [0, 1], duration: 800, ease: 'out(3)' }, 150)
    }

    tls.set(el, tl)
  })

  // play each block as it enters; jumping past one (End key, anchor link, reload mid-page) finishes it
  return inView(scroller, tls.keys(), (el) => tls.get(el)?.play(), (el) => tls.get(el)?.complete(), 0.14)
}
