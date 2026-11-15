import type { ReactNode, Ref } from 'react'

interface ArchPageProps {
  /** Sits inside the arch cap (top of the frame). */
  top?: ReactNode
  /** Flows in the middle; the pillars repeat down both sides to fit its height. */
  children: ReactNode
  /** Sits just above the temple base at the bottom of the frame. */
  bottom?: ReactNode
  id?: string
  sectionRef?: Ref<HTMLElement>
}

/**
 * Edge-to-edge temple arch built from three slices (see scripts/slice-arch.mjs):
 * cap (top) + seamless pillar tile (middle, repeats) + temple base (bottom).
 * All type inside scales with the page width via container query units.
 */
export function ArchPage({ id, top, children, bottom, sectionRef }: ArchPageProps) {
  return (
    <section id={id} ref={sectionRef} className="archpage">
      <div className="archpage__top">{top}</div>
      <div className="archpage__mid">{children}</div>
      <div className="archpage__bottom">{bottom}</div>
    </section>
  )
}
