import { useEffect, useState } from 'react'

export interface TimeLeft {
  days: number
  hours: number
  minutes: number
  seconds: number
}

export const timeLeft = (target: number, now = Date.now()): TimeLeft => {
  const ms = Math.max(0, target - now)
  const s = Math.floor(ms / 1000)
  return {
    days: Math.floor(s / 86400),
    hours: Math.floor((s % 86400) / 3600),
    minutes: Math.floor((s % 3600) / 60),
    seconds: s % 60,
  }
}

export function useCountdown(targetISO: string): TimeLeft {
  const target = new Date(targetISO).getTime()
  const [left, setLeft] = useState(() => timeLeft(target))
  useEffect(() => {
    const id = setInterval(() => setLeft(timeLeft(target)), 1000)
    return () => clearInterval(id)
  }, [target])
  return left
}

/**
 * The current time, re-rendering only when the minute changes (for displays without seconds, so phones
 * don't re-render every second). Wakes just after each minute boundary.
 */
export function useMinuteClock(): number {
  const [now, setNow] = useState(() => Date.now())
  useEffect(() => {
    let t = 0
    const tick = () => {
      setNow(Date.now())
      t = window.setTimeout(tick, 60000 - (Date.now() % 60000) + 50)
    }
    t = window.setTimeout(tick, 60000 - (Date.now() % 60000) + 50)
    return () => window.clearTimeout(t)
  }, [])
  return now
}
