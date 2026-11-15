import { createContext, useContext } from 'react'
import type { Invite } from '../data/invite'

export type Lang = 'en' | 'kn'

/**
 * The small interface words that are not part of the invitation copy itself (buttons, hints, labels).
 * `langTo` / `langAria` describe the language the switch will move to, not the current one.
 */
export type Ui = {
  swipeUp: string
  scroll: string
  gateTap: string
  gateSub: string
  gateOpen: string
  musicPlay: string
  musicPause: string
  musicNow: string
  langTo: string
  /** The single glyph in the round language button: the language the switch moves to. */
  langMark: string
  langAria: string
  muhurthamBanner: string
  venue: string
  days: string
  hrs: string
  min: string
  countdownAria: (days: number, hours: number, minutes: number) => string
  muhurthamNow: string
  thankYou: string
  openClick: string
  openTap: string
  inMaps: string
  mapAria: string
  qrAlt: string
  openIn: string
  maps: string
  ganeshaAlt: string
  coupleAlt: string
  brideAlt: string
  groomAlt: string
}

export const UI: Record<Lang, Ui> = {
  en: {
    swipeUp: 'Swipe up',
    scroll: 'Scroll',
    gateTap: 'Tap to open',
    gateSub: 'the invitation',
    gateOpen: 'Open the invitation',
    musicPlay: 'Play music',
    musicPause: 'Pause music',
    musicNow: '♪ Now playing',
    langTo: 'ಕನ್ನಡ',
    langMark: 'ಕ',
    langAria: 'Switch to Kannada',
    muhurthamBanner: 'Shubha Muhurtham',
    venue: 'Venue',
    days: 'Days',
    hrs: 'Hrs',
    min: 'Min',
    countdownAria: (d, h, m) => `${d} days, ${h} hours and ${m} minutes to go`,
    muhurthamNow: 'The muhurtham is now',
    thankYou: 'Thank you for your blessings',
    openClick: 'Click to open',
    openTap: 'Tap to open',
    inMaps: 'in Google Maps',
    mapAria: 'Open the venue in Google Maps',
    qrAlt: 'QR code to the venue on Google Maps',
    openIn: 'Open in',
    maps: 'Google Maps',
    ganeshaAlt: 'Lord Ganesha',
    coupleAlt: 'The bride and groom exchanging garlands',
    brideAlt: 'The bride offering into the sacred fire',
    groomAlt: 'The groom offering into the sacred fire',
  },
  kn: {
    swipeUp: 'ಮೇಲಕ್ಕೆ ಸ್ವೈಪ್',
    scroll: 'ಸ್ಕ್ರಾಲ್ ಮಾಡಿ',
    gateTap: 'ತೆರೆಯಲು ಸ್ಪರ್ಶಿಸಿ',
    gateSub: 'ಆಹ್ವಾನ ಪತ್ರಿಕೆ',
    gateOpen: 'ಆಹ್ವಾನ ಪತ್ರಿಕೆ ತೆರೆಯಿರಿ',
    musicPlay: 'ಸಂಗೀತ ಪ್ರಾರಂಭಿಸಿ',
    musicPause: 'ಸಂಗೀತ ನಿಲ್ಲಿಸಿ',
    musicNow: '♪ ಈಗ ಪ್ರಸಾರವಾಗುತ್ತಿದೆ',
    langTo: 'English',
    langMark: 'E',
    langAria: 'ಇಂಗ್ಲಿಷ್‌ಗೆ ಬದಲಿಸಿ',
    muhurthamBanner: 'ಶುಭ ಮುಹೂರ್ತ',
    venue: 'ಸ್ಥಳ',
    days: 'ದಿನ',
    hrs: 'ಗಂ',
    min: 'ನಿಮಿ',
    countdownAria: (d, h, m) => `${d} ದಿನ, ${h} ಗಂಟೆ ಮತ್ತು ${m} ನಿಮಿಷ ಬಾಕಿ ಇದೆ`,
    muhurthamNow: 'ಮುಹೂರ್ತ ಈಗ ನಡೆಯುತ್ತಿದೆ',
    thankYou: 'ನಿಮ್ಮ ಆಶೀರ್ವಾದಕ್ಕೆ ಧನ್ಯವಾದಗಳು',
    openClick: 'ತೆರೆಯಲು ಕ್ಲಿಕ್ ಮಾಡಿ',
    openTap: 'ತೆರೆಯಲು ಸ್ಪರ್ಶಿಸಿ',
    inMaps: 'ಗೂಗಲ್ ನಕ್ಷೆಯಲ್ಲಿ',
    mapAria: 'ಗೂಗಲ್ ನಕ್ಷೆಯಲ್ಲಿ ಸ್ಥಳವನ್ನು ತೆರೆಯಿರಿ',
    qrAlt: 'ಗೂಗಲ್ ನಕ್ಷೆಯಲ್ಲಿ ಸ್ಥಳಕ್ಕೆ ಕ್ಯೂಆರ್ ಕೋಡ್',
    openIn: 'ಗೂಗಲ್ ನಕ್ಷೆಯಲ್ಲಿ',
    maps: 'ತೆರೆಯಿರಿ',
    ganeshaAlt: 'ಶ್ರೀ ಗಣೇಶ',
    coupleAlt: 'ಮಾಲೆ ವಿನಿಮಯ ಮಾಡಿಕೊಳ್ಳುತ್ತಿರುವ ವರ ಮತ್ತು ವಧು',
    brideAlt: 'ಪವಿತ್ರ ಅಗ್ನಿಗೆ ಆಹುತಿ ನೀಡುತ್ತಿರುವ ವಧು',
    groomAlt: 'ಪವಿತ್ರ ಅಗ್ನಿಗೆ ಆಹುತಿ ನೀಡುತ್ತಿರುವ ವರ',
  },
}

export type LangValue = {
  lang: Lang
  setLang: (lang: Lang) => void
  toggle: () => void
  /** The whole invitation copy in the current language. */
  invite: Invite
  /** The interface words in the current language. */
  t: Ui
}

export const LangContext = createContext<LangValue | null>(null)

export function useLang(): LangValue {
  const value = useContext(LangContext)
  if (!value) throw new Error('useLang must be used inside <LangProvider>')
  return value
}
