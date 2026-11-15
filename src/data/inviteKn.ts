// Kannada copy of the invitation. Same shape as src/data/invite.ts (type Invite).
// Wording follows the Kannada side of the family's printed card, in the everyday register the card uses.
import type { Invite } from './invite'

const phone: string = ''

export const inviteKn: Invite = {
  invocation: 'II ಶ್ರೀ ಲಕ್ಷ್ಮಿ ವೆಂಕಟೇಶ್ವರ ಸ್ವಾಮಿ ಪ್ರಸನ್ನ II',
  // opening screen: "<groom> & <bride>" and the line under the names
  heroJoiner: '&',
  heroLine: 'ತಮ್ಮ ವಿವಾಹ ಸಮಾರಂಭಕ್ಕೆ ನಿಮ್ಮನ್ನು ಆದರದಿಂದ ಆಹ್ವಾನಿಸುತ್ತಾರೆ',
  inviteTitle: 'ಶುಭ ವಿವಾಹ',
  inviteLead: 'ನಮ್ಮ ಕುಟುಂಬದವರೊಂದಿಗೆ,',
  inviteLine:
    'ನಮ್ಮ ಮಕ್ಕಳ ವಿವಾಹದ ಶುಭ ಸಂದರ್ಭದಲ್ಲಿ ನಿಮ್ಮ ಕುಟುಂಬ ಹಾಗೂ ಸ್ನೇಹಿತರೊಂದಿಗೆ ಆಗಮಿಸಿ ಆಶೀರ್ವದಿಸಬೇಕಾಗಿ ಪ್ರಾರ್ಥಿಸುತ್ತೇವೆ.',
  groom: {
    name: 'ದರ್ಶನ್ ಬಿ. ಎಸ್.',
    parentsLine: ['ಶ್ರೀ ದಿವಂಗತ ಶ್ರೀನಿವಾಸ್ &', 'ಶ್ರೀಮತಿ ಗೀತಾ ಅವರ ಪುತ್ರ'],
    place: 'ಭದ್ರಾವತಿ',
    guidance: {
      label: 'ಆಶೀರ್ವಾದದೊಂದಿಗೆ:',
      names: 'ಶ್ರೀಮತಿ ದಿವಂಗತ ಶಾಂತಮ್ಮ & ಶ್ರೀ ದಿವಂಗತ ರಂಗಪ್ಪ · ಶ್ರೀಮತಿ ಧನ್ಯಾ & ಶ್ರೀ ಅಂಬರೀಷ್ ಸಿ.',
    },
  },
  joiner: 'ಮತ್ತು',
  bride: {
    name: 'ನಿಸರ್ಗ ಶೆರೆಗಾರ್',
    parentsLine: ['ಶ್ರೀಮತಿ ಆಶಾ &', 'ಶ್ರೀ ಮೋಹನ್ ಶೆರೆಗಾರ್ ಅವರ ಹಿರಿಯ ಪುತ್ರಿ'],
    place: 'ಯಡವಾಡ ಗ್ರಾಮ',
    guidance: {
      label: 'ಚಪ್ಪರ ದೇವತಾ ಕಾರ್ಯ:',
      names: '11 ಡಿಸೆಂಬರ್ 2026, ಶುಕ್ರವಾರ · ಹೆಬ್ಬಗೋಡಿ, ಬೆಂಗಳೂರು',
    },
  },
  coupleShort: 'ದರ್ಶನ್ & ನಿಸರ್ಗ',

  muhurtham: {
    title: 'ಮುಹೂರ್ತ',
    date: '14 ಡಿಸೆಂಬರ್ 2026, ಸೋಮವಾರ',
    dateShort: '14 ಡಿಸೆಂಬರ್ 2026',
    time: 'ಬೆಳಿಗ್ಗೆ 9:00 ರಿಂದ 9:06',
    // the banner's date lockup
    day: 'ಸೋಮವಾರ',
    dayNum: '14',
    monthYear: 'ಡಿಸೆಂಬರ್ 2026',
    timeFrom: 'ಬೆಳಿಗ್ಗೆ 9:00',
    timeTo: '9:06',
    feast: 'ಸ್ವಾಗತ ಸಮಾರಂಭ · 13 ಡಿಸೆಂ, ಸಂಜೆ 7 ರಿಂದ',
    lagna: '',
  },
  /** Countdown target (IST). */
  weddingStart: '2026-12-14T09:00:00+05:30',
  /** End of the muhurtham (IST); after it the countdown says thank you. */
  weddingEnd: '2026-12-14T09:06:00+05:30',

  venue: {
    nameLines: ['ವೀರಶೈವ ಸಭಾ', 'ಭವನ'],
    address: ['ಸುಕ್ ಕಚೇರಿ ಹತ್ತಿರ, ಭದ್ರಾವತಿ ತಾಲೂಕು,', 'ಶಿವಮೊಗ್ಗ ಜಿಲ್ಲೆ, ಕರ್ನಾಟಕ'],
    mapsUrl: 'https://www.google.com/maps/search/?api=1&query=Veerashaiva+Sabha+Bhavan+Bhadravathi+Shivamogga',
    qr: 'assets/venue-qr.png',
  },

  phoneDisplay: phone,
  telUrl: phone ? `tel:+91${phone}` : '',
  waUrl: phone
    ? `https://wa.me/91${phone}?text=` +
      encodeURIComponent('14 ಡಿಸೆಂಬರ್ 2026ರಂದು ದರ್ಶನ್ ಮತ್ತು ನಿಸರ್ಗ ಅವರ ವಿವಾಹಕ್ಕೆ ನಾವು ಬರುತ್ತೇವೆ.')
    : '',

  story: [
    'ಎರಡು ಕುಟುಂಬಗಳು, ಒಂದೇ ಆಶೀರ್ವಾದ. ನಮ್ಮ ಹಿರಿಯರ ಆಶೀರ್ವಾದದೊಂದಿಗೆ, ದರ್ಶನ್ ಮತ್ತು ನಿಸರ್ಗ ಒಟ್ಟಾಗಿ ಹೊಸ ಜೀವನವನ್ನು ಆರಂಭಿಸುವ ಸಂತೋಷದಲ್ಲಿ ನೀವೂ ಪಾಲ್ಗೊಳ್ಳಬೇಕಾಗಿ ಆಹ್ವಾನಿಸುತ್ತೇವೆ.',
    'ಡಿಸೆಂಬರ್ 14ರ ಬೆಳಿಗ್ಗೆ ನಾವು ಆ ವಚನವನ್ನು ದೇವಾಲಯಕ್ಕೆ ಒಯ್ಯುತ್ತೇವೆ; ಆ ಕ್ಷಣದಲ್ಲಿ ನೀವು ನಮ್ಮೊಂದಿಗಿದ್ದರೆ ನಮಗೆ ಹೆಮ್ಮೆಯ ಸಂಗತಿ.',
  ],

  musicSrc: 'assets/music-v3.mp3',
  musicTitle: '',

  autoScroll: {
    enabled: true,
    pxPerSecond: { phone: 70, laptop: 90 },
    templeBoost: 1.5,
    startAfterMs: 4500,
    resumeAfterMs: 6000,
  },

  trackUrl: '',
}
