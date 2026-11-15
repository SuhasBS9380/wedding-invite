import { useRef } from 'react'
import type { Invite } from '../data/invite'
import { useLang } from '../i18n/lang'
import { ArchPage } from '../components/ArchPage'
import { asset } from '../lib/asset'
import { useAnimeScope } from '../anim/useAnimeScope'
import { setupNames } from '../anim/names'
import { Flourish } from '../components/Flourish'

/** A name split into letters so Anime.js can raise them one by one (src/anim/names.ts). */
function Name({ person }: { person: Invite['groom'] }) {
  const { lang } = useLang()
  // Kannada stays one piece (connected glyphs); the whole name rises in together (src/anim/names.ts).
  if (lang === 'kn') {
    return (
      <h3 className="couple__name couple__name--kn" aria-label={person.fullName}>
        {person.prefix && <span className="couple__prefix">{person.prefix} </span>}
        <span className="couple__word" aria-hidden="true">
          <span className="couple__ch">{person.name}</span>
        </span>
      </h3>
    )
  }
  return (
    <h3 className={`couple__name${person.name.length > 12 ? ' couple__name--long' : ''}`} aria-label={person.fullName}>
      {person.prefix && <span className="couple__prefix">{person.prefix} </span>}
      {person.name.split(' ').map((word, i) => (
        <span className="couple__word" key={i} aria-hidden="true">
          {[...word].map((ch, j) => (
            <span className="couple__ch" key={j}>
              {ch}
            </span>
          ))}
        </span>
      ))}
    </h3>
  )
}

function Details({ person }: { person: Invite['groom'] }) {
  return (
    <div className="couple__parents">
      <strong>
        {person.parentsLine[0]}
        <br />
        {person.parentsLine[1]}
      </strong>
      <span className="couple__place">{person.place}</span>
      <span className="couple__guide">
        <span className="couple__guide-label">{person.guidance.label}</span>
        <strong>{person.guidance.names}</strong>
      </span>
    </div>
  )
}

export function InviteCard() {
  const { invite, t } = useLang()
  const root = useRef<HTMLElement>(null)
  useAnimeScope(root, setupNames)

  return (
    <ArchPage
      id="invite"
      sectionRef={root}
      top={
        <>
          <img className="inv-logo" data-anim src={asset('assets/ganesh.webp')} alt={t.ganeshaAlt} decoding="async" />
          <p className="inv-mantra" data-anim data-delay="120">
            {invite.invocation}
          </p>
        </>
      }
    >
      <h2 className="inv-script" data-anim>
        {invite.inviteTitle}
      </h2>
      <div className="inv-lead" data-anim>
        <span>{invite.inviteLead}</span>
        <span>{invite.inviteLine}</span>
      </div>

      <div className="couple">
        <div className="couple__block" data-couple>
          <Flourish className="couple__flourish" />
          <Name person={invite.groom} />
          <Details person={invite.groom} />
        </div>

        <div className="couple__amp" data-couple>
          <span className="couple__line" />
          <span className="couple__and">{invite.joiner}</span>
          <span className="couple__line" />
        </div>

        <div className="couple__block" data-couple>
          <Name person={invite.bride} />
          <Details person={invite.bride} />
          <Flourish className="couple__flourish" />
        </div>
      </div>

      {invite.compliments && (
        <div className="inv-compliments" data-anim>
          <p className="inv-compliments__label">{invite.compliments.label}</p>
          <div className="inv-compliments__names">
            {invite.compliments.names.map((line, i) => (
              <span key={i} className="inv-compliments__line">
                {line}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* the couple exchanging garlands, in the cream space above the temple base */}
      <img
        className="inv-couple"
        data-anim
        src={asset('assets/couple-trim.webp')}
        alt={t.coupleAlt}
        width={626}
        height={917}
        decoding="async"
      />
    </ArchPage>
  )
}
