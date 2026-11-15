import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react'
import { invite as inviteEn } from '../data/invite'
import { inviteKn } from '../data/inviteKn'
import { LangContext, UI, type Lang, type LangValue } from './lang'

const STORAGE_KEY = 'invite-lang'

/** The guest's choice, remembered between visits; English unless they picked Kannada before. */
const readLang = (): Lang => {
  try {
    return window.localStorage.getItem(STORAGE_KEY) === 'kn' ? 'kn' : 'en'
  } catch {
    return 'en'
  }
}

/**
 * Owns the current language (English / Kannada). Every section reads its copy and interface words through
 * `useLang()` (src/i18n/lang.ts), so a switch re-renders the whole page at once.
 *
 * `<html lang>` drives the typography overrides in src/styles/lang.css; `<html class="lang-switched">` is
 * added on the first switch so the re-rendered names (whose one-off reveal animation has already run) are
 * not left in the animation's hidden start state.
 */
export function LangProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>(readLang)

  useEffect(() => {
    const root = document.documentElement
    root.lang = lang
    document.title =
      lang === 'kn' ? 'ದರ್ಶನ್ ಮತ್ತು ನಿಸರ್ಗ · ವಿವಾಹ ಆಹ್ವಾನ' : 'Darshan & Nisarga · Wedding Invitation'
    try {
      window.localStorage.setItem(STORAGE_KEY, lang)
    } catch {
      /* private browsing: the choice simply is not remembered */
    }
  }, [lang])

  const setLang = useCallback((next: Lang) => {
    document.documentElement.classList.add('lang-switched')
    setLangState(next)
  }, [])

  const toggle = useCallback(() => setLang(lang === 'kn' ? 'en' : 'kn'), [lang, setLang])

  const value = useMemo<LangValue>(
    () => ({ lang, setLang, toggle, invite: lang === 'kn' ? inviteKn : inviteEn, t: UI[lang] }),
    [lang, setLang, toggle],
  )

  return <LangContext.Provider value={value}>{children}</LangContext.Provider>
}
