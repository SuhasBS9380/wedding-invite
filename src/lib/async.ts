/** Small promise helpers, so slow downloads never hold the invitation up. */

export const sleep = (ms: number) => new Promise<void>((resolve) => window.setTimeout(resolve, ms))

/** Waits for `p`, but never longer than `ms` (then carries on; `p` keeps running and finishes on its own). */
export const withTimeout = <T>(p: Promise<T>, ms: number): Promise<T | undefined> => Promise.race([p, sleep(ms).then(() => undefined)])

/** Resolves when the browser has a quiet moment (at most `timeout` ms later). */
export const whenIdle = (timeout = 1500) =>
  new Promise<void>((resolve) => {
    // (older Safari has no requestIdleCallback)
    if (typeof requestIdleCallback === 'function') requestIdleCallback(() => resolve(), { timeout })
    else setTimeout(resolve, 120)
  })

/** Resolves once the page's own load event has fired (immediately if it already has). */
export const pageLoaded = () =>
  new Promise<void>((resolve) => {
    if (document.readyState === 'complete') resolve()
    else window.addEventListener('load', () => resolve(), { once: true })
  })
