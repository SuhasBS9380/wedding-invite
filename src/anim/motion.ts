/** Shared motion constants. Tweak here to retune the whole invite. */
export const EASE_OUT = 'out(4)'
export const EASE_SOFT = 'out(3)'
export const EASE_INOUT = 'inOut(2)'

export const REVEAL = {
  duration: 1100,
  distance: 28, // px the element rises while fading in
  /** a block starts revealing when its top is this share of the viewport above the bottom edge */
  trigger: 0.09,
}

/**
 * Scroll-linked timelines are locked to the scroll position, so the page and its animations always move
 * together (smoothing the animations separately made them lag the page at section edges). The scroll
 * itself is eased by Lenis on laptops and native on phones (src/components/Scroller.tsx).
 */
export const SCROLL_SYNC = true

export const prefersReducedMotion = () =>
  typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches

/** A mouse or trackpad (hover exists), as opposed to a touch screen. */
export const canHover = () => typeof window !== 'undefined' && window.matchMedia('(hover: hover) and (pointer: fine)').matches

/** Phone-sized screen (the layout's phone breakpoint). */
export const isPhone = () => typeof window !== 'undefined' && window.matchMedia('(max-width: 899px)').matches
