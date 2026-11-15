// Kannada copy of the invitation. Same shape as src/data/invite.ts (type Invite).
// Wording follows the Kannada side of the family's printed card, in the exact register the card uses.
import type { Invite } from './invite'

const phone: string = '9901744512'

export const inviteKn: Invite = {
  invocation: '॥ ಶ್ರೀ ಲಕ್ಷ್ಮೀ ವೆಂಕಟೇಶ್ವರ ಸ್ವಾಮಿ ಪ್ರಸನ್ನ ॥',
  // opening screen: "<groom> & <bride>" and the line under the names
  heroJoiner: '&',
  heroLine: 'ತಮ್ಮ ವಿವಾಹ ಸಮಾರಂಭಕ್ಕೆ ನಿಮ್ಮನ್ನು ಆದರದಿಂದ ಆಹ್ವಾನಿಸುತ್ತಾರೆ',
  inviteTitle: 'ಶುಭ ವಿವಾಹ',
  inviteLead: 'ಇವರು ಮಾಡುವ ವಿಜ್ಞಾಪನೆಗಳು,',
  inviteLine:
    'ಸ್ವಸ್ತಿಶ್ರೀ ವಿಜಯಾಭ್ಯುದಯ ಶಾಲಿವಾಹನ ಶಕ ವರ್ಷ 1948ನೇ ಶ್ರೀ ಪರಾಭವನಾಮ ಸಂವತ್ಸರದ ವೈಶಾಖ ಮಾಸ ಸಪ್ತಮಿ ದಿನಾಂಕ 14-12-2026ನೇ ಸೋಮವಾರ ಬೆಳಗ್ಗೆ 09-00 ರಿಂದ 09-06 ರವರೆಗೆ ಸಲ್ಲುವ ಶುಭ ಧನುರ್ ಲಗ್ನದ ಮುಹೂರ್ತದಲ್ಲಿ ನಮ್ಮ ಸುಪುತ್ರ',
  groom: {
    prefix: 'ಚಿ॥ ರಾ॥',
    name: 'ದರ್ಶನ್ ಬಿ.ಎಸ್.',
    fullName: 'ಚಿ॥ ರಾ॥ ದರ್ಶನ್ ಬಿ.ಎಸ್.',
    parentsLine: ['ಶ್ರೀ ದಿ॥ ಶ್ರೀನಿವಾಸ ಮತ್ತು', 'ಶ್ರೀಮತಿ ಗೀತಾ'],
    place: 'ಭದ್ರಾವತಿ.',
    guidance: {
      label: 'ಇವರ ಆಶೀರ್ವಾದದೊಂದಿಗೆ:',
      names: 'ಶ್ರೀಮತಿ ದಿ॥ ಶಾಂತಮ್ಮ ಶ್ರೀ ದಿ॥ ರಂಗಪ್ಪ · ಶ್ರೀಮತಿ ಧನ್ಯ ಮತ್ತು ಶ್ರೀ ಅಂಬರೀಷ. ಸಿ · ಪುಟಾಣಿಗಳು ಇಹಾನ್ವಿ ಮತ್ತು ಪ್ರಣನ್ವಿ',
    },
  },
  joiner: 'ಮತ್ತು',
  bride: {
    prefix: 'ಚಿ॥ ಸೌ॥',
    name: 'ನಿಸರ್ಗಾ ಶೇರೆಗಾರ',
    fullName: 'ಚಿ॥ ಸೌ॥ ನಿಸರ್ಗಾ ಶೇರೆಗಾರ',
    parentsLine: ['ಶ್ರೀಮತಿ ಆಶಾ ಮತ್ತು', 'ಶ್ರೀ ಮೋಹನ ಶೇರೆಗಾರ ಅವರ ಜೇಷ್ಠ ಪುತ್ರಿ'],
    place: 'ಯಾದವಾಡ ಗ್ರಾಮ.',
    guidance: {
      label: 'ಚಪ್ಪರ ದೇವತಾಕಾರ್ಯ:',
      names: '11-12-2026ನೇ ಶುಕ್ರವಾರ, ಸ್ಥಳ : ಹೆಬ್ಬಗೋಡಿ, ಬೆಂಗಳೂರು.',
    },
  },
  coupleShort: 'ದರ್ಶನ್ ಮತ್ತು ನಿಸರ್ಗಾ',

  events: [
    {
      id: 'chappara',
      tag: '11 ಡಿಸೆಂ',
      badge: 'ಚಪ್ಪರ',
      title: 'ಚಪ್ಪರ ದೇವತಾಕಾರ್ಯ',
      day: 'ಶುಕ್ರವಾರ',
      dayNum: '11',
      monthYear: 'ಡಿಸೆಂಬರ್ 2026',
      time: 'ದೇವತಾಕಾರ್ಯ',
      detail: 'ಸಂಪ್ರದಾಯದ ಪೂಜಾ ಕಾರ್ಯಕ್ರಮ',
      venue: 'ಹೆಬ್ಬಗೋಡಿ, ಬೆಂಗಳೂರು',
    },
    {
      id: 'reception',
      tag: '13 ಡಿಸೆಂ',
      badge: 'ಅರತಕ್ಷತೆ',
      title: 'ಅರತಕ್ಷತೆ (ರಿಸೆಪ್ಷನ್)',
      day: 'ಭಾನುವಾರ',
      dayNum: '13',
      monthYear: 'ಡಿಸೆಂಬರ್ 2026',
      time: 'ಸಂಜೆ 07-00 ಕ್ಕೆ',
      detail: 'ಸ್ವಾಗತ ಹಾಗೂ ಪ್ರೀತಿ ಭೋಜನ',
      venue: 'ವೀರಶೈವ ಸಭಾ ಭವನ, ಭದ್ರಾವತಿ',
    },
    {
      id: 'muhurtham',
      tag: '14 ಡಿಸೆಂ',
      badge: 'ಮುಹೂರ್ತ',
      title: 'ವಿವಾಹ ಮುಹೂರ್ತ',
      day: 'ಸೋಮವಾರ',
      dayNum: '14',
      monthYear: 'ಡಿಸೆಂಬರ್ 2026',
      time: 'ಬೆಳಗ್ಗೆ 09-00 ರಿಂದ 09-06 ಕ್ಕೆ',
      detail: 'ಶುಭ ಧನುರ್ ಲಗ್ನ',
      venue: 'ವೀರಶೈವ ಸಭಾ ಭವನ, ಭದ್ರಾವತಿ',
    },
  ],

  muhurtham: {
    title: 'ವಿವಾಹ ಮುಹೂರ್ತ',
    date: '14-12-2026ನೇ ಸೋಮವಾರ',
    dateShort: '14 ಡಿಸೆಂಬರ್ 2026',
    time: 'ಬೆಳಗ್ಗೆ 09-00 ರಿಂದ 09-06 ಕ್ಕೆ',
    // the banner's date lockup
    day: 'ಸೋಮವಾರ',
    dayNum: '14',
    monthYear: 'ಡಿಸೆಂಬರ್ 2026',
    timeFrom: 'ಬೆಳಗ್ಗೆ 09-00',
    timeTo: '09-06 ಕ್ಕೆ',
    feast: 'ಅರತಕ್ಷತೆ · 13-12-2026, ಸಂಜೆ 07-00 ಕ್ಕೆ',
    lagna: 'ಧನುರ್',
  },
  /** Countdown target (IST). */
  weddingStart: '2026-12-14T09:00:00+05:30',
  /** End of the muhurtham (IST); after it the countdown says thank you. */
  weddingEnd: '2026-12-14T09:06:00+05:30',

  venue: {
    nameLines: ['ವೀರಶೈವ ಸಭಾ', 'ಭವನ'],
    address: ['ತಾಲೂಕು ಆಫೀಸ್ ಹತ್ತಿರ, ಭದ್ರಾವತಿ ತಾಲೂಕು,', 'ಶಿವಮೊಗ್ಗ ಜಿಲ್ಲೆ.'],
    mapsUrl: 'https://www.google.com/maps/search/?api=1&query=Veerashaiva+Sabha+Bhavan+Bhadravathi+Shivamogga',
    qr: 'assets/venue-qr.png',
  },

  compliments: {
    label: 'ತಮ್ಮ ಶುಭಾಗಮನ ಬಯಸುವವರು :',
    names: [
      'ಶ್ರೀಮತಿ ದಿ॥ ಶಾಂತಮ್ಮ ಮತ್ತು ಮಕ್ಕಳು, ಶ್ರೀಮತಿ ದಿ॥ ಸುಬದ್ರಮ್ಮ ಮತ್ತು ಮಕ್ಕಳು,',
      'ಶ್ರೀಮತಿ ಗಂಗಮ್ಮ ಮತ್ತು ಮಕ್ಕಳು (ಸಾಗರ),',
      'ಬಾದಾಮಿ ವಂಶಸ್ಥರು ಮತ್ತು ಬಳಿಜ ಬಂಧು-ಮಿತ್ರರು',
    ],
  },

  phoneDisplay: '9901744512 / 9900603982',
  telUrl: phone ? `tel:+91${phone}` : '',
  waUrl: phone
    ? `https://wa.me/91${phone}?text=` +
      encodeURIComponent('14 ಡಿಸೆಂಬರ್ 2026ರಂದು ದರ್ಶನ್ ಮತ್ತು ನಿಸರ್ಗಾ ಅವರ ವಿವಾಹಕ್ಕೆ ನಾವು ಬರುತ್ತೇವೆ.')
    : '',

  story: [
    'ಅಕ್ಕರೆಯ ಅರಿಶಿನ ಹಚ್ಚಿ, ಅಂಗೈಯಲ್ಲಿ ಹಾಲನ್ನೆರೆದು ಮುಂಗೈಯಲ್ಲಿ ಕಂಕಣ ಕಟ್ಟಿಸಿ, ನೆತ್ತಿಯ ಮೇಲೆ ಅಕ್ಷತೆ ಹಾಕಿ ಅನುರಾಗದಿಂದ ಹರೈಸಲು ಬನ್ನಿ.',
    'ಇವರ ವಿವಾಹ ಮಹೋತ್ಸವವನ್ನು ನೆರವೇರಿಸಲು ಗುರು-ಹಿರಿಯರು ನಿಶ್ಚಯಿಸಿರುವುದರಿಂದ, ತಾವುಗಳು ಕುಟುಂಬ ಸಮೇತರಾಗಿ ಆಗಮಿಸಿ, ವಧು-ವರರನ್ನು ಆಶೀರ್ವದಿಸಬೇಕಾಗಿ ಕೋರುತ್ತೇವೆ.',
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
