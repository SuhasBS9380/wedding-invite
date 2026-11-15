import { createContext, useContext, useEffect, useRef, useState, type ReactNode } from 'react'
import Lenis from 'lenis'
import { scrollContainers } from 'animejs/events'
import { onOpen } from '../lib/intro'

const ScrollerContext = createContext<HTMLDivElement | null>(null)

/** The scroll container element (null until mounted). Anime.js scroll observers use it as `container`. */
export const useScroller = () => useContext(ScrollerContext)

/**
 * The fixed full-screen scroll container. Wheel/keyboard scrolling is eased with Lenis
 * (touch stays native); Anime.js reads the resulting real scrollTop (see src/anim).
 */
export function Scroller({ children }: { children: ReactNode }) {
  const [el, setEl] = useState<HTMLDivElement | null>(null)
  const content = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!el || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    // Laptops: the wheel is eased by Lenis (lower wheelMultiplier = slower, calmer scrolling).
    // Phones: touch scrolling stays NATIVE. The phone's own scrolling runs on the GPU with the OS's fling
    // momentum, which is faster and more even on real devices than any JavaScript-driven touch scroll
    // (that competes with the page's work and came out uneven). The scroll-linked animations are locked to
    // the scroll position (SCROLL_SYNC), so sections still hand over cleanly.
    const lenis = new Lenis({
      wrapper: el,
      content: content.current ?? undefined,
      lerp: 0.07,
      wheelMultiplier: 0.65,
      smoothWheel: true,
      syncTouch: false,
    })
    // locked behind the cloud gate until the invitation is opened
    lenis.stop()
    const offOpen = onOpen(() => lenis.start())
    let raf = 0
    const loop = (time: number) => {
      lenis.raf(time)
      raf = requestAnimationFrame(loop)
    }
    raf = requestAnimationFrame(loop)

    // in-page anchors ("Back to the beginning") glide instead of jumping
    const onClick = (e: MouseEvent) => {
      const a = (e.target as HTMLElement).closest<HTMLAnchorElement>('a[href^="#"]')
      const target = a && document.querySelector(a.getAttribute('href')!)
      if (!a || !target) return
      e.preventDefault()
      lenis.scrollTo(target as HTMLElement, { duration: 1.6 })
    }
    el.addEventListener('click', onClick)

    return () => {
      el.removeEventListener('click', onClick)
      offOpen()
      cancelAnimationFrame(raf)
      lenis.destroy()
    }
  }, [el])

  // Sections above a scroll-linked scene change height after webfonts and images load. Anime.js only
  // re-measures its scroll ranges when the scroll container itself resizes, so re-measure them whenever
  // the content height changes; otherwise a scene would start animating before it reaches the screen.
  useEffect(() => {
    if (!el || !content.current) return
    let last = content.current.offsetHeight
    let t = 0
    const remeasure = () => scrollContainers.get(el)?.refresh()
    const ro = new ResizeObserver(() => {
      const h = content.current?.offsetHeight ?? last
      if (Math.abs(h - last) < 2) return
      last = h
      window.clearTimeout(t)
      t = window.setTimeout(remeasure, 60)
    })
    ro.observe(content.current)
    document.fonts?.ready.then(remeasure)
    window.addEventListener('load', remeasure)
    return () => {
      ro.disconnect()
      window.clearTimeout(t)
      window.removeEventListener('load', remeasure)
    }
  }, [el])

  return (
    <div ref={setEl} className="scroller">
      <div ref={content} className="scroller__content">
        <ScrollerContext.Provider value={el}>{children}</ScrollerContext.Provider>
      </div>
    </div>
  )
}
