import { animate, type JSAnimation } from 'animejs'
import type { AnimeCtx } from './useAnimeScope'
import { EASE_OUT, REVEAL, prefersReducedMotion } from './motion'
import { inView } from './inView'

/**
 * Fade-and-rise for every `[data-anim]` element, played once when it scrolls into view.
 * `data-delay="120"` offsets an element (used to stagger blocks that enter together).
 */
export function setupReveals({ root, scroller }: AnimeCtx) {
  if (prefersReducedMotion()) return

  const anims = new Map<HTMLElement, JSAnimation>()
  root.querySelectorAll<HTMLElement>('[data-anim]').forEach((el) => {
    anims.set(el, animate(el, {
      opacity: [0, 1],
      y: [REVEAL.distance, 0],
      duration: REVEAL.duration,
      delay: Number(el.dataset.delay ?? 0),
      ease: EASE_OUT,
      autoplay: false,
    }))
  })
  // play each block as it enters; finish (no animation) any block the visitor jumped past
  return inView(scroller, anims.keys(), (el) => anims.get(el)?.play(), (el) => anims.get(el)?.complete(), REVEAL.trigger)
}
