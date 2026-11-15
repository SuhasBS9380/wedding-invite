import { useRef, useState, useEffect } from 'react'
import type { Invite } from '../data/invite'
import { useLang } from '../i18n/lang'
import { asset } from '../lib/asset'
import { useAnimeScope } from '../anim/useAnimeScope'
import { setupHeroIntro, setupHeroScroll } from '../anim/hero'
import { Flourish } from '../components/Flourish'
import { isPhone } from '../anim/motion'

const CIRCLE_IMAGES = ['/assets/circle-1.jpg', '/assets/circle-2.jpg']

/** Circular image carousel in the center of the temple, auto-rotating every 3 seconds */
function CircleCarousel() {
  const [index, setIndex] = useState(0)
  useEffect(() => {
    const id = window.setInterval(() => {
      setIndex((prev) => (prev + 1) % CIRCLE_IMAGES.length)
    }, 3000)
    return () => window.clearInterval(id)
  }, [])
  return (
    <div className="hero__circle">
      {CIRCLE_IMAGES.map((src, i) => (
        <img
          key={src}
          src={src}
          alt=""
          className={`hero__circle-img ${i === index ? 'is-active' : ''}`}
        />
      ))}
    </div>
  )
}

/**
 * A name as letters, so Anime.js can raise them one by one. The first letter of the name and its
 * initials ("A.", "R.") are gold.
 */
function HeroName({ person }: { person: Invite['groom'] }) {
  const { lang } = useLang()
  // Kannada is written in connected clusters, so it stays one piece: the whole name rises in as a single unit
  // (the letter-by-letter split would break the glyphs apart).
  if (lang === 'kn') {
    return (
      <span className="hn hn--kn" aria-label={person.fullName}>
        <span className="hn__word" aria-hidden="true">
          {person.prefix && <span className="hn__prefix">{person.prefix} </span>}
          <span className="hn__ch">{person.name}</span>
        </span>
      </span>
    )
  }
  return (
    <span className={`hn${person.name.length > 12 ? ' hn--long' : ''}`} aria-label={person.fullName}>
      {person.prefix && <span className="hn__prefix">{person.prefix} </span>}
      {person.name.split(' ').map((word, w) => (
        <span className="hn__word" key={w} aria-hidden="true">
          {[...word].map((ch, i) => (
            <span className={`hn__ch${i === 0 || word.length <= 2 ? ' hn__ch--gold' : ''}`} key={i}>
              {ch}
            </span>
          ))}
        </span>
      ))}
    </span>
  )
}

/**
 * A tall section holding one sticky stage (sky, title, temple + trees). Anime.js drives the stage from
 * scroll (src/anim/hero.ts). When the section ends the stage scrolls away with the arch below.
 */
export function Hero() {
  const { invite, t } = useLang()
  const root = useRef<HTMLElement>(null)
  useAnimeScope(root, (ctx) => {
    const offScroll = setupHeroScroll(ctx)
    const offIntro = setupHeroIntro(ctx)
    return () => {
      offScroll?.()
      offIntro?.()
    }
  })
  const sky = asset('assets/sky.webp')
  const mono = `url(${asset('assets/monogram.webp')})`

  return (
    <section id="invitation" ref={root} className="hero">
      <div className="hero__stick">
        <div className="hero__sky">
          <img src={sky} alt="" />
        </div>
        {/* on tall screens the photo's clouds are cropped away, so two cloud corners are added back */}
        <div className="hero__cloud hero__cloud--a" aria-hidden="true">
          <img src={sky} alt="" />
        </div>
        <div className="hero__cloud hero__cloud--b" aria-hidden="true">
          <img src={sky} alt="" />
        </div>

        <div className="hero__title">
          <div className="title">
            <div
              className="title__mono"
              data-intro
              role="img"
              aria-label="D N monogram"
              style={{ WebkitMaskImage: mono, maskImage: mono }}
            />
            <h2>
              <HeroName person={invite.groom} />
              <span className="title__weds">
                <i className="title__line" />
                <em>{invite.heroJoiner}</em>
                <i className="title__line" />
              </span>
              <HeroName person={invite.bride} />
            </h2>
            <Flourish className="title__flourish" />
            <div data-intro className="title__sub">
              {invite.heroLine}
            </div>
          </div>
        </div>

        {/* temple + tree canopy are one piece: the canopy hangs off the tower's base */}
        <div className="hero__temple">
          <div className="tower-group">
            {/* phones get 1100w copies: half the decoded memory for the big moving layer */}
            <picture>
              <source media="(max-width: 899px)" srcSet={asset('assets/temple-md.webp')} />
              <img className="tower" src={asset('assets/temple.webp')} alt="" />
            </picture>
            <picture>
              <source media="(max-width: 899px)" srcSet={asset('assets/trees-md.webp')} />
              <img className="trees" src={asset('assets/trees.webp')} alt="" decoding="async" />
            </picture>
            {/* Circular image carousel in the center of the temple */}
            <CircleCarousel />
          </div>
        </div>

        {/* swipe-up hint: gold chevrons with a light running up them, over a small pill (src/anim/hero.ts) */}
        <div className="hero__cue" aria-hidden="true">
          <div className="hero__cue-in">
            <span className="hero__chev">
              <i />
              <i />
              <i />
            </span>
            <span className="hero__cue-pill">{isPhone() ? t.swipeUp : t.scroll}</span>
          </div>
        </div>
      </div>
    </section>
  )
}
