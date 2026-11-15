import { useRef } from 'react'
import type { Invite } from '../data/invite'
import { useLang } from '../i18n/lang'
import { ArchPage } from '../components/ArchPage'
import { asset } from '../lib/asset'
import { useAnimeScope } from '../anim/useAnimeScope'
import { setupNames } from '../anim/names'
import { Flourish } from '../components/Flourish'

/** A name split into letters so Anime.js can raise them one by one (src/anim/names.ts). */
function Name({ text }: { text: string }) {
  const { lang } = useLang()
  // Kannada stays one piece (connected glyphs); the whole name rises in together (src/anim/names.ts).
  if (lang === 'kn') {
    return (
      <h3 className="couple__name couple__name--kn" aria-label={text}>
        <span className="couple__word" aria-hidden="true">
          <span className="couple__ch">{text}</span>
        </span>
      </h3>
    )
  }
  return (
    <h3 className={`couple__name${text.length > 12 ? ' couple__name--long' : ''}`} aria-label={text}>
      {text.split(' ').map((word, i) => (
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
    <p className="couple__parents">
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
    </p>
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
      <p className="inv-lead" data-anim>
        <span>{invite.inviteLead}</span>
        <span>{invite.inviteLine}</span>
      </p>

      <div className="couple">
        <div className="couple__block" data-couple>
          <Flourish className="couple__flourish" />
          <Name text={invite.groom.name} />
          <Details person={invite.groom} />
        </div>

        <div className="couple__amp" data-couple>
          <span className="couple__line" />
          <span className="couple__and">{invite.joiner}</span>
          <span className="couple__line" />
        </div>

        <div className="couple__block" data-couple>
          <Name text={invite.bride.name} />
          <Details person={invite.bride} />
          <Flourish className="couple__flourish" />
        </div>
      </div>

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
