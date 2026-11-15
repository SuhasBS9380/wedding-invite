import { invite } from '../data/invite'
import { prefersReducedMotion } from '../anim/motion'

/** Is the steady auto-scroll on? (`invite.autoScroll.enabled`, overridden by `?auto=0` / `?auto=1`) */
export function autoScrollOn() {
  if (typeof window === 'undefined' || prefersReducedMotion()) return false
  const q = new URLSearchParams(location.search).get('auto')
  return q === null ? invite.autoScroll.enabled : q !== '0'
}
