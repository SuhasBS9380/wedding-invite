import { useEffect, useRef, useState } from 'react'
import { onOpen } from '../lib/intro'
import { SECTION_COLORS, setThemeColor } from '../lib/themeColor'

/**
 * A thin gold rail on the right edge that fills as the page is scrolled, so guests can see how much is left.
 * The fill is a scaleY transform (compositor only), updated at most once per frame. The same scroll listener
 * keeps the browser's top bar colour matched to the section at the top of the screen (src/lib/themeColor.ts).
 */
export function ScrollProgress() {
  const fill = useRef<HTMLSpanElement>(null)
  const [shown, setShown] = useState(false)

  useEffect(() => {
    const scroller = document.querySelector<HTMLElement>('.scroller')
    if (!scroller) return
    const sections = [...scroller.querySelectorAll<HTMLElement>('section[id]')].filter((s) => s.id in SECTION_COLORS)
    let raf = 0
    let opened = false
    const update = () => {
      raf = 0
      const max = scroller.scrollHeight - scroller.clientHeight
      const p = max > 0 ? Math.min(1, Math.max(0, scroller.scrollTop / max)) : 0
      if (fill.current) fill.current.style.transform = `scaleY(${p})`
      if (!opened) return
      // the section covering the top of the screen (sections are in page order)
      const top = scroller.scrollTop + 1
      const at = sections.filter((s) => s.offsetTop <= top).pop()
      if (at) setThemeColor(SECTION_COLORS[at.id])
    }
    const schedule = () => {
      if (!raf) raf = requestAnimationFrame(update)
    }
    scroller.addEventListener('scroll', schedule, { passive: true })
    // the hero and scene heights are set from JS on phones and change on rotation
    const ro = new ResizeObserver(schedule)
    ro.observe(scroller.firstElementChild ?? scroller)
    const offOpen = onOpen(() => {
      opened = true
      setShown(true)
      update()
    })
    update()
    return () => {
      scroller.removeEventListener('scroll', schedule)
      ro.disconnect()
      offOpen()
      cancelAnimationFrame(raf)
    }
  }, [])

  return (
    <div className={`progress${shown ? ' is-shown' : ''}`} aria-hidden="true">
      <span ref={fill} className="progress__fill" />
    </div>
  )
}
