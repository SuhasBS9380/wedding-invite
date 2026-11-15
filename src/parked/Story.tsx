import { invite } from '../data/invite'
import { ArchCard } from '../components/ArchCard'

export const Story = () => (
  <section id="story" className="pg pg--tile">
    <ArchCard data-anim>
      <h2 className="script arch__script arch__script--lg">Our Story</h2>
      {invite.story.map((p) => (
        <p className="arch__para" key={p}>
          {p}
        </p>
      ))}
    </ArchCard>
  </section>
)
