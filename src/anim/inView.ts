/**
 * Calls `onEnter(el)` once, when `el` scrolls into view (its top passes `triggerFromBottom` of the screen),
 * or immediately-complete via `onSkipped(el)` if the visitor jumped past it (End key, anchor link, reload
 * mid-page) so it never stays hidden.
 *
 * Uses one IntersectionObserver for all elements: the browser checks visibility off the scroll path, so
 * nothing runs on each scroll frame (a scroll watcher per element did, which cost phones every frame).
 */
export function inView(
  scroller: HTMLElement,
  els: Iterable<HTMLElement>,
  onEnter: (el: HTMLElement) => void,
  onSkipped: (el: HTMLElement) => void,
  triggerFromBottom = 0.1,
) {
  const io = new IntersectionObserver(
    (entries) => {
      for (const e of entries) {
        const el = e.target as HTMLElement
        if (e.isIntersecting) {
          io.unobserve(el)
          onEnter(el)
        } else if (e.rootBounds && e.boundingClientRect.bottom < e.rootBounds.top) {
          io.unobserve(el)
          onSkipped(el)
        }
      }
    },
    { root: scroller, rootMargin: `0px 0px -${Math.round(triggerFromBottom * 100)}% 0px` },
  )
  for (const el of els) io.observe(el)
  return () => io.disconnect()
}
