import { invite } from '../data/invite'

export const Rsvp = () => (
  <section id="rsvp" className="pg pg--tile pg--center">
    <div className="evcard rsvp" data-anim>
      <p className="rsvp__kicker">And a place for you in it</p>
      <h2 className="script rsvp__title">Will you join us?</h2>
      <p className="rsvp__line">Your presence is the blessing we are asking for.</p>
      <a className="btn btn--navy" href={invite.waUrl} target="_blank" rel="noopener">
        Reply on WhatsApp <span className="btn__icon">↗</span>
      </a>
      <a className="rsvp__call" href={invite.telUrl}>
        or call {invite.phoneDisplay}
      </a>
      <p className="rsvp__sign">{invite.coupleShort}</p>
      <a className="rsvp__top" href="#invitation">
        Back to the beginning ↑
      </a>
    </div>
  </section>
)
