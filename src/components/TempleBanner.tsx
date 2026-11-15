import type { ReactNode } from 'react'

/** Small gold motifs for the top of each banner. */
export const Lotus = () => (
  <svg className="banner__motif" viewBox="0 0 48 28" aria-hidden="true">
    <path d="M24 2c4 5 5 11 0 22-5-11-4-17 0-22Z" />
    <path d="M24 24c-3-7-8-11-15-12 1 7 7 12 15 12Zm0 0c3-7 8-11 15-12-1 7-7 12-15 12Z" />
    <path d="M24 25c-6-2-13-2-21 1 7 2 14 2 21-1Zm0 0c6-2 13-2 21 1-7 2-14 2-21-1Z" />
  </svg>
)

export const Gopuram = () => (
  <svg className="banner__motif" viewBox="0 0 48 30" aria-hidden="true">
    <path d="M24 1l2 3h-4l2-3Zm-5 5h10l1 4H18l1-4Zm-2 6h14l1.5 5h-17L17 12Zm-2.5 7h19l1.5 5h-22l1.5-5Zm-3 7h25v3H11.5v-3Z" />
  </svg>
)

/**
 * A silk temple banner hanging from a brass rod: maroon cloth with a gold zari border, a pointed hem and a
 * tassel with a tiny bell. `.banner__swing` sways around the rod; inside the (static) clip of
 * `.banner__unfurl`, `.banner__roll` slides down from behind the rod (src/anim/scene.ts). Only transforms
 * move, and the shadow is a pre-blurred shape inside the cloth's layer, so nothing is repainted per frame.
 */
export function TempleBanner({ side, label, children }: { side: 'left' | 'right'; label: string; children: ReactNode }) {
  return (
    <section className={`banner banner--${side}`} aria-label={label}>
      <div className="banner__rod" aria-hidden="true" />
      <div className="banner__swing">
        <div className="banner__unfurl">
          <div className="banner__roll">
            <i className="banner__shade" aria-hidden="true" />
            <div className="banner__cloth">
              <i className="banner__zari" aria-hidden="true" />
              <div className="banner__body">{children}</div>
            </div>
            <div className="banner__tassel" aria-hidden="true">
              <i className="banner__cord" />
              <i className="banner__cap" />
              <i className="banner__fringe" />
              <i className="banner__bell" />
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
