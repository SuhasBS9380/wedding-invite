import { useEffect, useRef, useState } from 'react'
import { invite } from '../data/invite'
import { useCountdown } from '../hooks/useCountdown'
import { asset } from '../lib/asset'
import { useAnimeScope } from '../anim/useAnimeScope'
import { rollDigit, setupCountUp } from '../anim/countdown'

const pad = (n: number) => String(n).padStart(2, '0')

/** A number box that rolls in whenever its value changes (after the intro count-up has finished). */
function Digit({ value, roll }: { value: string; roll: boolean }) {
  const ref = useRef<HTMLDivElement>(null)
  const prev = useRef(value)
  useEffect(() => {
    if (roll && prev.current !== value && ref.current) rollDigit(ref.current)
    prev.current = value
  }, [value, roll])
  return (
    <div ref={ref} className="count__num">
      {value}
    </div>
  )
}

export function Countdown() {
  const live = useCountdown(invite.weddingStart)
  const root = useRef<HTMLElement>(null)
  const [k, setK] = useState(0) // intro count-up factor 0→1
  const [done, setDone] = useState(false)

  useAnimeScope(root, (ctx) => setupCountUp(ctx, ctx.root, setK, () => setDone(true)))

  const f = done ? 1 : k
  const cells = [
    ['D', live.days],
    ['H', live.hours],
    ['M', live.minutes],
    ['S', live.seconds],
  ] as const

  return (
    <section
      id="countdown"
      ref={root}
      className="pg count"
      style={{ backgroundImage: `url(${asset('assets/countdown.webp')})` }}
    >
      <h2 className="script count__title" data-anim>
        Counting the Days
      </h2>
      <div className="count__cells" data-anim data-delay="150" role="timer" aria-label="Time until the wedding">
        {cells.map(([label, n]) => (
          <div className="count__cell" key={label}>
            <Digit value={pad(Math.round(n * f))} roll={done} />
            <div className="count__lab">{label}</div>
          </div>
        ))}
      </div>
      <p className="count__date" data-anim data-delay="300">
        {invite.muhurtham.dateShort}
      </p>
    </section>
  )
}
