import { asset } from './asset'
import { pageLoaded, whenIdle } from './async'

/** Big images drawn by CSS (the arch slices), so not in the page as <img>. */
const CSS_IMAGES = ['assets/arch-top.webp', 'assets/arch-mid.webp', 'assets/arch-bottom.webp']

/**
 * Decodes the big images ahead of time, in the order guests meet them. A phone otherwise decodes each one
 * the first time it scrolls on screen, which shows as a stutter or a blank moment mid-scroll.
 * Starts after the page has loaded, one image per quiet moment, so it never competes with the opening;
 * decoding itself happens off the main thread. Nothing waits on this: a failure just means the browser
 * decodes that image later, as it would have anyway.
 */
export async function warmImages() {
  await pageLoaded()
  const q = <T extends Element>(sel: string) => [...document.querySelectorAll<T>(sel)]
  const css = CSS_IMAGES.map((src) => {
    const im = new Image()
    im.src = asset(src)
    return im
  })
  const queue: HTMLImageElement[] = [
    ...q<HTMLImageElement>('.hero__temple img'), // the tower and trees: they rise right after the names
    ...css, // the arch around the invitation card
    ...q<HTMLImageElement>('.archpage img'), // Ganesha, the garland couple
    ...q<HTMLImageElement>('.scene img'), // the temple scene, the couple at the homa, the fire
  ]
  for (const im of queue) {
    await whenIdle()
    try {
      await im.decode()
    } catch {
      /* not loaded / not decodable yet: the browser will decode it when it is shown */
    }
  }
}
