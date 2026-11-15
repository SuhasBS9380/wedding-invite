import type { HTMLAttributes, ReactNode } from 'react'
import { asset } from '../lib/asset'

/** The ornate temple-arch frame (frame 1) with a text area positioned over its cream centre. */
export function ArchCard({
  children,
  className = '',
  ...rest
}: { children: ReactNode; className?: string } & HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={`arch ${className}`.trim()} {...rest}>
      <img className="arch__img" src={asset('assets/frame1.webp')} alt="" />
      <div className="arch__body">{children}</div>
    </div>
  )
}
