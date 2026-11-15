import { useEffect, useRef } from 'react'
import { useLang } from '../i18n/lang'
import { asset } from '../lib/asset'
import { useAnimeScope } from '../anim/useAnimeScope'
import { MAP_OPENED, setupScene } from '../anim/scene'
import { canHover } from '../anim/motion'
import { rollDigit } from '../anim/countdown'
import { timeLeft, useMinuteClock } from '../hooks/useCountdown'
import { TempleBanner, Lotus, Gopuram } from '../components/TempleBanner'
import { track } from '../lib/track'

const PETALS = Array.from({ length: 12 }, (_, i) => i)
const EMBERS = Array.from({ length: 9 }, (_, i) => i)
const SPARKS = Array.from({ length: 6 }, (_, i) => i)
const pad = (n: number) => String(n).padStart(2, '0')

/** Opening the map counts for the guest log and retires the "tap to open" hint (src/anim/scene.ts). */
const openedMap = () => {
  track('directions')
  window.dispatchEvent(new Event(MAP_OPENED))
}

/**
 * The venue QR presented as a small round gold medallion; the whole medallion opens the map.
 * A speech bubble pops up over it now and then to say so (src/anim/scene.ts).
 */
function QrSeal() {
  const { invite, t } = useLang()
  const v = invite.venue
  return (
    <a className="seal" data-s="where" href={v.mapsUrl} target="_blank" rel="noopener" onClick={openedMap} aria-label={t.mapAria}>
      <span className="seal__hint" aria-hidden="true">
        {canHover() ? t.openClick : t.openTap} <span>{t.inMaps}</span>
      </span>
      <span className="seal__disc">
        <i className="seal__pulse" aria-hidden="true" />
        {/* touch screens: a hand that taps the QR now and then, with a ripple from the fingertip */}
        {!canHover() && (
          <span className="seal__tap" aria-hidden="true">
            <i className="seal__tap-ring" />
            <i className="seal__tap-ring seal__tap-ring--soft" />
            {SPARKS.map((k) => (
              <i key={k} className="seal__spark" />
            ))}
            <svg className="seal__hand" viewBox="0 0 24 24">
              <defs>
                <linearGradient id="seal-hand-gold" x1="0" y1="0" x2="0.4" y2="1">
                  <stop offset="0" stopColor="#fffaf0" />
                  <stop offset="0.5" stopColor="#f8e2a6" />
                  <stop offset="1" stopColor="#dcae52" />
                </linearGradient>
              </defs>
              <path fill="url(#seal-hand-gold)" d="M18.84 15.87l-4.54-2.26c-.17-.07-.35-.11-.54-.11H13v-6c0-.83-.67-1.5-1.5-1.5S10 6.67 10 7.5v10.74l-3.43-.72c-.08-.01-.15-.03-.24-.03-.31 0-.59.13-.79.33l-.79.8 4.94 4.94c.27.27.65.44 1.06.44h6.79c.75 0 1.33-.55 1.44-1.28l.75-5.27c.01-.07.02-.14.02-.2 0-.62-.38-1.16-.91-1.38z" />
            </svg>
          </span>
        )}
        <svg className="seal__rings" viewBox="0 0 200 200" aria-hidden="true">
          <circle className="seal__ring" cx="100" cy="100" r="97" pathLength={1} />
          <circle className="seal__ring seal__ring--thin" cx="100" cy="100" r="90" pathLength={1} />
          {[0, 90, 180, 270].map((a) => (
            <circle key={a} className="seal__dot" cx="100" cy="6.5" r="3.2" transform={`rotate(${a} 100 100)`} />
          ))}
        </svg>
        <img src={asset(v.qr)} alt={t.qrAlt} />
      </span>
    </a>
  )
}

/** One countdown figure; rolls in whenever its value changes. */
function Unit({ n, label }: { n: number; label: string }) {
  const ref = useRef<HTMLSpanElement>(null)
  const prev = useRef(n)
  useEffect(() => {
    if (prev.current !== n && ref.current) rollDigit(ref.current)
    prev.current = n
  }, [n])
  return (
    <span className="cd__unit">
      <span ref={ref} className="cd__num">{pad(n)}</span>
      <span className="cd__lab">{label}</span>
    </span>
  )
}

function Countdown() {
  const { invite, t } = useLang()
  const now = useMinuteClock()
  const start = new Date(invite.weddingStart).getTime()
  const end = new Date(invite.weddingEnd).getTime()
  if (now >= end) return <p className="cd cd--done" data-s="when">{t.thankYou}</p>
  if (now >= start) return <p className="cd cd--done" data-s="when">{t.muhurthamNow}</p>
  const left = timeLeft(start, now)
  return (
    <p className="cd" data-s="when" role="timer" aria-label={t.countdownAria(left.days, left.hours, left.minutes)}>
      <Unit n={left.days} label={t.days} />
      <i className="cd__dot" aria-hidden="true" />
      <Unit n={left.hours} label={t.hrs} />
      <i className="cd__dot" aria-hidden="true" />
      <Unit n={left.minutes} label={t.min} />
    </p>
  )
}

/**
 * Muhurtham scene: a full-width temple canvas you scroll down through. At the end the bride and groom
 * perform the homa at the bottom of the screen, and two silk temple banners unfurl on either side of the
 * sanctum with the muhurtham and the venue. Anime.js drives it from scroll (src/anim/scene.ts).
 */
export function Scene() {
  const { invite, t } = useLang()
  const { muhurtham: m, venue: v } = invite
  const ref = useRef<HTMLElement>(null)
  useAnimeScope(ref, setupScene)
  return (
    <section id="scene" ref={ref} className="scene">
      <div className="scene__stick">
        <span className="cloud cloud--1" aria-hidden="true" />
        <span className="cloud cloud--2" aria-hidden="true" />
        <span className="cloud cloud--3" aria-hidden="true" />

        {/* the full-width temple art travels vertically inside the stage */}
        <div className="scene__stage">
          <div className="scene__canvas">
            {/* phones always get the 1320w file: at 3x density they would otherwise pick the 1872w one,
                whose ~25 MB decoded texture makes mobile GPUs drop and redraw the moving layer (flicker) */}
            <picture>
              <source media="(max-width: 899px)" srcSet={asset('assets/frame4-md.webp')} />
              <img
                className="scene__temple"
                src={asset('assets/frame4-lg.webp')}
                srcSet={`${asset('assets/frame4.webp')} 1000w, ${asset('assets/frame4-lg.webp')} 1872w`}
                sizes="100vw"
                alt=""
              />
            </picture>
          </div>
        </div>

        <div className="scene__petals" aria-hidden="true">
          {PETALS.map((i) => (
            <span key={i} className={`petal petal--${i % 3}`} />
          ))}
        </div>

        <div className="scene__banners">
          <TempleBanner side="left" label={t.muhurthamBanner}>
            <Lotus />
            <p className="bn__kicker" data-s="when">{t.muhurthamBanner}</p>
            <p className="bn__day" data-s="when">{m.day}</p>
            <p className="bn__num" data-s="when">{m.dayNum}</p>
            <p className="bn__month" data-s="when">{m.monthYear}</p>
            <i className="bn__rule" data-s="when" aria-hidden="true" />
            <p className="bn__time" data-s="when">
              {m.timeFrom} <span>–</span> {m.timeTo}
            </p>
            {m.lagna && (
              <>
                <p className="bn__lagna" data-s="when">
                  {m.lagna} Lagna
                </p>
                <i className="bn__rule bn__rule--sm" data-s="when" aria-hidden="true" />
              </>
            )}
            <p className="bn__lagna bn__feast" data-s="when">
              {m.feast}
            </p>
            <Countdown />
          </TempleBanner>

          <TempleBanner side="right" label={t.venue}>
            <Gopuram />
            <p className="bn__kicker" data-s="where">{t.venue}</p>
            <p className="bn__place" data-s="where">
              <span>{v.nameLines[0]}</span> <span>{v.nameLines[1]}</span>
            </p>
            <p className="bn__addr" data-s="where">
              <span>{v.address[0]}</span> <span>{v.address[1]}</span>
            </p>
            <QrSeal />
            <a className="bn__link" data-s="where" href={v.mapsUrl} target="_blank" rel="noopener" onClick={openedMap}>
              <svg className="bn__pin" viewBox="0 0 24 24" aria-hidden="true">
                <path d="M12 2a7 7 0 0 0-7 7c0 5.2 7 13 7 13s7-7.8 7-13a7 7 0 0 0-7-7Zm0 9.6A2.6 2.6 0 1 1 12 6.4a2.6 2.6 0 0 1 0 5.2Z" />
              </svg>
              <span>
                {t.openIn} <span className="bn__nb">{t.maps}</span>
              </span>
              <i className="bn__shine" aria-hidden="true" />
            </a>
          </TempleBanner>
        </div>

        {/* bride and groom performing the homa */}
        <div className="homa-group">
          <div className="homa-group__shadow" />
          <div className="homa-fig homa-fig--girl">
            <img src={asset('assets/homa-girl.webp')} alt={t.brideAlt} />
          </div>
          <div className="homa-fig homa-fig--boy">
            <img src={asset('assets/homa-boy.webp')} alt={t.groomAlt} />
          </div>
          <div className="homa-kund">
            <div className="homa-glow-wrap">
              <div className="homa-glow" />
            </div>
            <img src={asset('assets/homa-kund.webp')} alt="" />
            <div className="homa-embers" aria-hidden="true">
              {EMBERS.map((i) => (
                <span key={i} className="ember" />
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
