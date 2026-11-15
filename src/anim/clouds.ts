import { animate, createTimer, type JSAnimation, type Timer } from 'animejs'
import { asset } from '../lib/asset'
import { withTimeout } from '../lib/async'

/**
 * The opening cloud bank, drawn on ONE canvas (a dozen full-screen image layers would cost phones well
 * over 100 MB of GPU memory). Sprites are real cumulus photos keyed out of their sky and re-lit as sunlit
 * clouds (scripts/make-clouds.py). The canvas is transparent: the hero's real sky shows through the gaps.
 *
 * Each cloud is a plain object; Anime.js animates one slow `open` progress (0 → 1) and every cloud derives
 * its position from it with its own speed, delay and slightly curved path, so the bank drifts apart from
 * the centre like weather rather than sliding as one piece. Nearer clouds travel further and grow a little.
 */
// phones get lighter copies of the sprites (c*-sm, 900 px) and a smaller canvas: much faster to load and draw
const PHONE = typeof window !== 'undefined' && window.matchMedia('(max-width: 899px)').matches
const SPRITES = Array.from({ length: 9 }, (_, i) => asset(`assets/clouds/c${i + 1}${PHONE ? '-sm' : ''}.webp`))
const OPEN_MS = 6200

interface Cloud {
  img: HTMLImageElement
  x: number // centre, as a fraction of the viewport
  y: number
  size: number // drawn width, in units of U = max(vw, 0.75·vh)
  depth: number // 0 far … 1 near
  flip: boolean
  dirX: number // unit vector away from the screen centre
  dirY: number
  speed: number
  curve: number // sideways bow of the path
  delay: number // share of the opening before this cloud starts to move
  phase: number
}

/** small deterministic PRNG so the bank looks the same on every load */
function rng(seed: number) {
  return () => {
    seed = (seed * 1664525 + 1013904223) >>> 0
    return seed / 4294967296
  }
}

function buildBank(imgs: HTMLImageElement[], portrait: boolean): Cloud[] {
  const r = rng(11)
  const clouds: Cloud[] = []
  // Size clouds so their whole shape fits on screen (a cloud far wider than the screen only shows a
  // blurry close-up of its middle, which reads as smoke): wide screens use U = their width; tall phone
  // screens use U = 0.75 x their height, so clouds there are scaled down more and there are more of them.
  const z = portrait ? 0.62 : 0.58
  const cols = portrait ? 3 : 4
  const bands = [
    { n: portrait ? 12 : 14, size: [0.6, 0.95], depth: [0, 0.3] },
    { n: portrait ? 12 : 14, size: [0.9, 1.3], depth: [0.35, 0.65] },
    { n: portrait ? 9 : 10, size: [1.2, 1.65], depth: [0.7, 1] },
  ]
  let k = 0
  for (const b of bands) {
    const rows = Math.ceil(b.n / cols)
    for (let i = 0; i < b.n; i++, k++) {
      const x = ((i % cols) + 0.5) / cols + (r() - 0.5) * (0.85 / cols)
      const y = (Math.floor(i / cols) + 0.5) / rows + (r() - 0.5) * (0.85 / rows)
      let dx = x - 0.5
      let dy = (y - 0.5) * (portrait ? 0.75 : 1)
      const len = Math.hypot(dx, dy)
      if (len < 0.08) {
        dx = k % 2 ? 1 : -1 // clouds right in the middle split left / right
        dy = (r() - 0.5) * 0.4
      }
      const l = Math.hypot(dx, dy)
      clouds.push({
        img: imgs[(k * 5 + 3) % imgs.length],
        x,
        y,
        size: (b.size[0] + r() * (b.size[1] - b.size[0])) * z,
        depth: b.depth[0] + r() * (b.depth[1] - b.depth[0]),
        flip: r() > 0.5,
        dirX: dx / l,
        dirY: dy / l,
        speed: 0.8 + r() * 0.45,
        curve: (r() - 0.5) * 0.16,
        delay: Math.min(0.3, len * 0.42 + r() * 0.08), // the middle opens first
        phase: r() * Math.PI * 2,
      })
    }
  }
  return clouds.sort((a, b) => a.depth - b.depth)
}

const smooth = (a: number, b: number, t: number) => {
  const x = Math.min(1, Math.max(0, (t - a) / (b - a)))
  return x * x * (3 - 2 * x)
}

export interface CloudBank {
  /** resolves once the sprites are decoded and the bank starts fading in */
  ready: Promise<void>
  /** part the clouds; resolves when they are gone. `onReveal` fires once the middle has opened up. */
  open(onReveal: () => void): Promise<void>
  /** speed up a parting already under way (an impatient second tap) */
  hurry(): void
  destroy(): void
}

export function createCloudBank(canvas: HTMLCanvasElement): CloudBank {
  const ctx = canvas.getContext('2d')!
  const imgs = SPRITES.map((src) => {
    const im = new Image()
    im.decoding = 'async'
    im.src = src
    return im
  })
  // Each cloud casts a soft blue-grey shadow on the clouds behind it (the crevices of a real cloud bank).
  // The shadow is the sprite's silhouette at 1/12 resolution: drawn back up it becomes a soft, diffuse
  // darkening with no outline (a sharper silhouette reads as a grey cut-out).
  const shadows = new Map<HTMLImageElement, HTMLCanvasElement>()
  const makeShadow = (im: HTMLImageElement) => {
    const c = document.createElement('canvas')
    c.width = Math.max(1, Math.round(im.naturalWidth / 12))
    c.height = Math.max(1, Math.round(im.naturalHeight / 12))
    const x = c.getContext('2d')!
    x.drawImage(im, 0, 0, c.width, c.height)
    x.globalCompositeOperation = 'source-in'
    x.fillStyle = 'rgb(62, 92, 140)'
    x.fillRect(0, 0, c.width, c.height)
    shadows.set(im, c)
  }
  // When each sprite became drawable (seconds; 0 = there from the start). A sprite that arrives after the bank
  // is already showing fades in on its own instead of popping in.
  const bornAt = new Map<HTMLImageElement, number>()
  const arrive = (im: HTMLImageElement, late: boolean) => {
    if (bornAt.has(im) || !im.naturalWidth) return
    makeShadow(im)
    bornAt.set(im, late ? performance.now() / 1000 : 0)
  }
  // Phones: sprites are drawn only once downloaded AND decoded (decoding inside the draw loop stalls a phone's
  // first frames). The bank waits for all of them so it fades in as one, but never more than 2.5 s: on a slow
  // connection it then fades in with what has arrived and the rest join as they come.
  // Laptops draw each cloud as soon as it has loaded.
  const state = { open: 0, show: PHONE ? 0 : 1 }
  let ready: Promise<void>
  if (PHONE) {
    ready = (async () => {
      const decoded = new Set<HTMLImageElement>()
      let showing = false
      const decodes = imgs.map(async (im) => {
        try {
          await im.decode()
        } catch {
          return // (failed to load: that cloud is simply left out)
        }
        decoded.add(im)
        if (showing) arrive(im, true)
      })
      await withTimeout(Promise.all(decodes), 2500)
      showing = true
      decoded.forEach((im) => arrive(im, false))
      animate(state, { show: 1, duration: 700, ease: 'out(2)' })
    })()
  } else {
    imgs.forEach((im) => (im.complete && im.naturalWidth ? arrive(im, false) : im.addEventListener('load', () => arrive(im, true), { once: true })))
    ready = Promise.resolve()
  }
  let clouds: Cloud[] = []
  let W = 0
  let H = 0
  let dpr = 1

  const resize = () => {
    // phones need 2x: their screens are ~3x, and a lower-resolution canvas stretched up looks like smoke
    dpr = Math.min(window.devicePixelRatio || 1, PHONE ? 2 : 1.5)
    W = window.innerWidth
    H = window.innerHeight
    canvas.width = Math.round(W * dpr)
    canvas.height = Math.round(H * dpr)
    clouds = buildBank(imgs, H > W)
  }
  resize()
  window.addEventListener('resize', resize)

  const draw = () => {
    const t = performance.now() / 1000
    const U = Math.max(W, H * 0.75)
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    ctx.clearRect(0, 0, W, H)
    if (state.show <= 0) return
    for (const c of clouds) {
      const born = bornAt.get(c.img)
      if (born === undefined) continue
      const appear = born ? Math.min(1, (t - born) / 0.8) : 1
      const p = smooth(c.delay, 1, state.open) // this cloud's own (eased) progress
      const travel = (0.6 + c.depth * 0.8) * U * c.speed * p
      const bow = Math.sin(p * Math.PI) * c.curve * U // gentle sideways arc
      const grow = 1 + c.depth * 0.3 * p
      const fade = (1 - smooth(0.72, 1, p)) * state.show * appear // mostly drift out of view, only dissolve at the very end
      if (fade <= 0.001) continue
      // wind: a slow sideways drift and a faint swell, always on
      const driftX = Math.sin(t * 0.045 + c.phase) * 0.018 * U * (0.5 + c.depth) + t * 2.2 * (0.4 + c.depth)
      const driftY = Math.cos(t * 0.032 + c.phase) * 0.006 * U
      const breathe = 1 + Math.sin(t * 0.08 + c.phase) * 0.01
      const w = c.size * U * grow * breathe
      const h = (w * c.img.naturalHeight) / c.img.naturalWidth
      const cx = c.x * W + c.dirX * travel - c.dirY * bow + ((driftX + W) % (W * 3)) - W
      const cy = c.y * H + c.dirY * travel + c.dirX * bow + driftY
      const sh = shadows.get(c.img)
      if (c.flip) ctx.setTransform(-dpr, 0, 0, dpr, cx * dpr, cy * dpr)
      else ctx.setTransform(dpr, 0, 0, dpr, cx * dpr, cy * dpr)
      if (sh && c.depth > 0.33) {
        // (the far layer has only sky behind it, so it casts no visible shadow; skipping it saves phones work)
        // a little larger and lower than the cloud, falling on whatever is behind it
        ctx.globalAlpha = 0.12 * fade
        ctx.drawImage(sh, -w * 0.53, -h * 0.46, w * 1.06, h * 1.08)
      }
      ctx.globalAlpha = fade
      ctx.drawImage(c.img, -w / 2, -h / 2, w, h)
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    }
    ctx.globalAlpha = 1
  }

  const timer: Timer = createTimer({ onUpdate: draw })
  let parting: JSAnimation | null = null

  return {
    ready,
    open(onReveal) {
      return new Promise((resolve) => {
        let revealed = false
        parting = animate(state, {
          open: 1,
          duration: OPEN_MS,
          ease: 'inOut(1.6)',
          onUpdate: () => {
            if (!revealed && state.open > 0.3) {
              revealed = true
              onReveal()
            }
          },
          onComplete: () => {
            if (!revealed) onReveal()
            resolve()
          },
        })
      })
    },
    hurry() {
      if (parting) parting.speed = 3
    },
    destroy() {
      timer.pause()
      window.removeEventListener('resize', resize)
    },
  }
}
