import { useEffect, type RefObject } from 'react'
import { createScope } from 'animejs'
import { useScroller } from '../components/Scroller'

export interface AnimeCtx {
  root: HTMLElement
  /** the scroll container (pass as `container` to onScroll) */
  scroller: HTMLElement
}

type Setup = (ctx: AnimeCtx) => void | (() => void)

/**
 * Runs `setup` inside an Anime.js scope rooted at `rootRef`, once the scroller exists, and reverts
 * everything (animations + scroll observers + inline styles) on unmount. StrictMode-safe: the dev
 * double-mount reverts the first run before the second starts. `setup` may return a cleanup function.
 */
export function useAnimeScope(rootRef: RefObject<HTMLElement | null>, setup: Setup) {
  const scroller = useScroller()
  useEffect(() => {
    const root = rootRef.current
    if (!root || !scroller) return
    let cleanup: void | (() => void)
    const scope = createScope({ root }).add(() => {
      cleanup = setup({ root, scroller })
    })
    return () => {
      scope.revert()
      if (cleanup) cleanup()
    }
    // `setup` is a module-level function in every caller, so it is stable
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [scroller, rootRef])
}
