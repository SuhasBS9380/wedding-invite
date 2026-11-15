import { useEffect, useRef, useState } from 'react'
import { animate } from 'animejs'
import { useLang } from '../i18n/lang'
import { asset } from '../lib/asset'
import { onOpen } from '../lib/intro'
import { prefersReducedMotion } from '../anim/motion'

/**
 * Background music on a loop. Browsers refuse to start sound until the visitor has interacted with the
 * page, so it tries on load and otherwise starts on the first tap (the cloud gate's tap, normally).
 *
 * A small frosted button (bottom left) shows it is playing: four gold bars that dance while the music plays
 * and lie flat when paused. Tapping it fades the music out / back in. Right after the invitation opens it
 * widens for a moment to say "Now playing".
 */
export function BackgroundMusic() {
  const { invite, t } = useLang()
  const audio = useRef<HTMLAudioElement>(null)
  const btn = useRef<HTMLButtonElement>(null)
  const bars = useRef<Animation[]>([])
  const [playing, setPlaying] = useState(false)
  const [shown, setShown] = useState(false)
  const [note, setNote] = useState(false)
  const userPaused = useRef(false)

  // autoplay on the first gesture; keep the button in sync with the real audio state
  useEffect(() => {
    const a = audio.current
    if (!a) return
    const warm = () => {
      a.preload = 'auto'
    }
    if (document.readyState === 'complete') warm()
    else window.addEventListener('load', warm, { once: true })
    const events = ['pointerdown', 'touchend', 'click', 'keydown'] as const
    const stop = () => events.forEach((e) => window.removeEventListener(e, start))
    // Starting the music never holds anything up: these run on their own (nothing awaits them), and while the
    // song is still downloading the page opens and scrolls as usual; it begins once enough has streamed in.
    const start = async () => {
      if (userPaused.current) return stop()
      try {
        await a.play()
        stop()
      } catch {
        /* not allowed yet (no tap so far): try again on the next gesture */
      }
    }
    void start()
    events.forEach((e) => window.addEventListener(e, start, { passive: true }))
    // coming back to the tab resumes it if the browser paused it
    const onVisible = async () => {
      if (document.hidden || !a.paused || userPaused.current) return
      try {
        await a.play()
      } catch {
        /* ignore */
      }
    }
    const onPlay = () => setPlaying(true)
    const onPause = () => setPlaying(false)
    a.addEventListener('play', onPlay)
    a.addEventListener('pause', onPause)
    document.addEventListener('visibilitychange', onVisible)
    return () => {
      stop()
      a.removeEventListener('play', onPlay)
      a.removeEventListener('pause', onPause)
      document.removeEventListener('visibilitychange', onVisible)
    }
  }, [])

  // appear with the hero; say "Now playing" once
  useEffect(
    () =>
      onOpen(() => {
        window.setTimeout(() => setShown(true), 1600)
        window.setTimeout(() => setNote(true), 2200)
        window.setTimeout(() => setNote(false), 5600)
      }),
    [],
  )

  // the bars: dancing while playing, settling flat when paused. Native Web Animations of transform run on
  // the compositor, so the always-on dance costs the main thread nothing while the page scrolls.
  useEffect(() => {
    const b = [...(btn.current?.querySelectorAll<HTMLElement>('.music__bar') ?? [])]
    bars.current.forEach((a) => a.cancel())
    bars.current = []
    if (playing && !prefersReducedMotion()) {
      bars.current = b.map((bar, i) =>
        bar.animate([{ transform: 'scaleY(0.3)' }, { transform: `scaleY(${[1, 0.7, 0.9, 0.6][i]})` }], {
          duration: [520, 380, 460, 340][i],
          delay: i * 90,
          iterations: Infinity,
          direction: 'alternate',
          easing: 'ease-in-out',
          fill: 'both',
        }),
      )
    } else {
      const s = playing ? 0.8 : 0.18
      b.forEach((bar) => (bar.style.transform = `scaleY(${s})`))
    }
    return () => bars.current.forEach((a) => a.cancel())
  }, [playing])

  const toggle = async () => {
    const a = audio.current
    if (!a) return
    if (a.paused) {
      userPaused.current = false
      a.volume = 0
      try {
        // fade in once the sound actually starts (it may still be streaming in)
        await a.play()
        animate(a, { volume: 1, duration: 700, ease: 'linear' })
      } catch {
        a.volume = 1
      }
    } else {
      userPaused.current = true
      animate(a, { volume: 0, duration: 450, ease: 'linear', onComplete: () => a.pause() })
    }
  }

  if (!invite.musicSrc) return null
  return (
    <>
      {/* the music is fetched in the background only once the page has loaded, so it never competes with the
          opening clouds and images (tapping before that still starts it: play() streams it straight away) */}
      <audio ref={audio} src={asset(invite.musicSrc)} loop preload="none" />
      <button
        ref={btn}
        type="button"
        className={`music${shown ? ' is-shown' : ''}${note ? ' is-note' : ''}`}
        onClick={toggle}
        aria-pressed={playing}
        aria-label={playing ? t.musicPause : t.musicPlay}
      >
        <span className="music__bars" aria-hidden="true">
          <i className="music__bar" />
          <i className="music__bar" />
          <i className="music__bar" />
          <i className="music__bar" />
        </span>
        <span className="music__note" aria-hidden="true">
          <span>{t.musicNow}</span>
          {invite.musicTitle && <em> · {invite.musicTitle}</em>}
        </span>
      </button>
    </>
  )
}
