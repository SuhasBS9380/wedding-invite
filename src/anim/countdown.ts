import { animate, onScroll } from 'animejs'
import type { AnimeCtx } from './useAnimeScope'
import { EASE_SOFT, prefersReducedMotion } from './motion'

/**
 * When the countdown section scrolls into view, ramp a 0→1 factor so the numbers count up from zero
 * to the live values. Calls `onProgress(k)` every frame and `onDone()` once it finishes.
 */
export function setupCountUp(
  { scroller }: AnimeCtx,
  target: HTMLElement,
  onProgress: (k: number) => void,
  onDone: () => void,
) {
  if (prefersReducedMotion()) {
    onDone()
    return
  }
  const state = { k: 0 }
  onScroll({
    container: scroller,
    target,
    enter: 'bottom-=22% start',
    repeat: false,
    onEnter: () => {
      animate(state, {
        k: 1,
        duration: 1900,
        delay: 250,
        ease: EASE_SOFT,
        onUpdate: () => onProgress(state.k),
        onComplete: onDone,
      })
    },
  })
}

/** Small "roll in" for a digit that just changed. */
export function rollDigit(el: HTMLElement) {
  if (prefersReducedMotion()) return
  animate(el, { y: ['38%', '0%'], opacity: [0.2, 1], duration: 340, ease: EASE_SOFT })
}
