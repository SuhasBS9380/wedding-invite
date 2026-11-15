import { useEffect, useState } from 'react'
import { onOpen } from '../lib/intro'
import { useLang } from '../i18n/lang'

/**
 * Language switch: one small round button in the bottom right corner, the same size and finish as the music
 * button in the bottom left. It carries the language it will switch to — "ಕ" while reading English, "E" while
 * reading Kannada — so it stays a single 38px circle on any screen. It appears with the music button, once the
 * invitation has opened.
 */
export function LangToggle() {
  const { lang, t, toggle } = useLang()
  const [shown, setShown] = useState(false)

  useEffect(() => {
    let id = 0
    const off = onOpen(() => {
      id = window.setTimeout(() => setShown(true), 1600)
    })
    return () => {
      off()
      window.clearTimeout(id)
    }
  }, [])

  return (
    <button
      type="button"
      className={`lang${shown ? ' is-shown' : ''}`}
      onClick={toggle}
      aria-label={t.langAria}
      title={t.langTo}
    >
      <span className="lang__mark" lang={lang === 'en' ? 'kn' : 'en'} aria-hidden="true">
        {t.langMark}
      </span>
    </button>
  )
}
