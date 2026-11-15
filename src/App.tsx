import { useEffect, useRef } from 'react'
import { Scroller } from './components/Scroller'
import { BackgroundMusic } from './components/BackgroundMusic'
import { CloudGate } from './components/CloudGate'
import { ScrollProgress } from './components/ScrollProgress'
import { AutoScroll } from './components/AutoScroll'
import { ScrollNudge } from './components/ScrollNudge'
import { KeepAwake } from './components/KeepAwake'
import { LangToggle } from './components/LangToggle'
import { warmImages } from './lib/warmImages'
import { useAnimeScope } from './anim/useAnimeScope'
import { setupReveals } from './anim/reveal'
import { Hero } from './sections/Hero'
import { InviteCard } from './sections/InviteCard'
import { Scene } from './sections/Scene'

/** All sections; owns the page-wide scroll reveals (`[data-anim]`). */
function Page() {
  const ref = useRef<HTMLDivElement>(null)
  useAnimeScope(ref, setupReveals)
  return (
    <div ref={ref}>
      <Hero />
      <InviteCard />
      <Scene />
    </div>
  )
}

export default function App() {
  // decode the big images in the background, ahead of the scroll (never awaited: nothing waits on it)
  useEffect(() => {
    void warmImages()
  }, [])
  return (
    <>
      <Scroller>
        <Page />
      </Scroller>
      <ScrollProgress />
      <AutoScroll />
      <KeepAwake />
      <ScrollNudge />
      <BackgroundMusic />
      <LangToggle />
      <CloudGate />
    </>
  )
}
