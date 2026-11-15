// Single source of truth for every piece of invite content.
// Wording follows the family's printed invitation card word for word.

// Contact numbers printed on the front cover of the wedding card
const phone: string = '9901744512'

export const invite = {
  invocation: '|| Sri Lakshmi Venkateshwara Swamy Prasanna ||',
  // opening screen: "<groom> & <bride>" and the line under the names
  heroJoiner: '&',
  heroLine: 'Invite you to celebrate their wedding',
  inviteTitle: 'Shubha Vivaha',
  inviteLead: 'With the blessings of our elders,',
  inviteLine:
    'we solicit your gracious presence with family & friends on the auspicious occasion of the marriage of our beloved son',
  groom: {
    prefix: 'Chi. Ry.',
    name: 'Darshan B.S.',
    fullName: 'Chi. Ry. Darshan B.S.',
    parentsLine: ['Sri Late Srinivas &', 'Smt. Geetha'],
    place: 'Bhadravathi.',
    guidance: {
      label: 'With the blessings of:',
      names: 'Smt. Late Shanthamma & Sri Late Rangappa · Smt. Dhanya & Sri Ambarish C. · Ku. Ihanvi & Ku. Prananvi',
    },
  },
  joiner: 'with',
  bride: {
    prefix: 'Chi. Sou.',
    name: 'Nisarga Sheregar',
    fullName: 'Chi. Sou. Nisarga Sheregar',
    parentsLine: ['Elder D/o. Smt. Asha &', 'Sri Mohan Sheregar'],
    place: 'Yadwad Village.',
    guidance: {
      label: 'Chappara Devathakarya:',
      names: '11-12-2026, Friday, Venue : Hebbagodi, Bangalore.',
    },
  },
  coupleShort: 'Darshan & Nisarga',

  events: [
    {
      id: 'chappara',
      tag: '11 Dec',
      badge: 'Chappara',
      title: 'Chappara Devathakarya',
      day: 'Friday',
      dayNum: '11',
      monthYear: 'December 2026',
      time: 'Devathakarya',
      detail: 'Traditional Rituals',
      venue: 'Hebbagodi, Bangalore',
    },
    {
      id: 'reception',
      tag: '13 Dec',
      badge: 'Reception',
      title: 'Reception',
      day: 'Sunday',
      dayNum: '13',
      monthYear: 'December 2026',
      time: '07:00 PM Onwards',
      detail: 'Dinner & Blessings',
      venue: 'Veerashaiva Sabha Bhavan',
    },
    {
      id: 'muhurtham',
      tag: '14 Dec',
      badge: 'Muhurtha',
      title: 'Vivah Muhurtha',
      day: 'Monday',
      dayNum: '14',
      monthYear: 'December 2026',
      time: '09:00 to 09:06 AM',
      detail: 'Dhanur Lagna',
      venue: 'Veerashaiva Sabha Bhavan',
    },
  ],

  muhurtham: {
    title: 'Vivah Muhurtha',
    date: '14th December 2026, Monday',
    dateShort: '14th December 2026',
    time: '09:00 to 09:06 AM',
    // the banner's date lockup
    day: 'Monday',
    dayNum: '14',
    monthYear: 'December 2026',
    timeFrom: '09:00 AM',
    timeTo: '09:06 AM',
    feast: 'Reception · 13th Dec, 07:00 PM onwards',
    lagna: 'Dhanur',
  },
  /** Countdown target (IST). */
  weddingStart: '2026-12-14T09:00:00+05:30',
  /** End of the muhurtham (IST); after it the countdown says thank you. */
  weddingEnd: '2026-12-14T09:06:00+05:30',

  venue: {
    nameLines: ['Veerashaiva Sabha', 'Bhavan'],
    address: ['Near Taluk Office, Bhadravathi Taluk,', 'Shivamogga Dist.'],
    mapsUrl: 'https://www.google.com/maps/search/?api=1&query=Veerashaiva+Sabha+Bhavan+Bhadravathi+Shivamogga',
    qr: 'assets/venue-qr.png',
  },

  compliments: {
    label: 'With Best Compliments From:',
    names: [
      'Smt. Late Shanthamma & Sons, Smt. Late Subadramma & Sons,',
      'Smt. Gangamma & sons (Sagar),',
      'Badami Family, Balija Relatives & Friends',
    ],
  },

  phoneDisplay: '9901744512 / 9900603982',
  telUrl: phone ? `tel:+91${phone}` : '',
  waUrl: phone
    ? `https://wa.me/91${phone}?text=` +
      encodeURIComponent("We'd love to be there for Darshan & Nisarga's wedding on 14th Dec 2026.")
    : '',

  story: [
    'Two families, one blessing. With the blessings of our elders, we invite you to share in the joy of Darshan and Nisarga as they begin their life together.',
    'On the morning of 14th December we take that promise to the temple, and we would be honoured to have you beside us as we begin.',
  ],

  /**
   * Background music, looped. Empty string turns it off.
   * Kept from the earlier invite; swap the file in public/assets to change the song.
   */
  musicSrc: 'assets/music-v3.mp3',
  /** Shown once in the music button ("Now playing · …"). Empty string shows just "Now playing". */
  musicTitle: '',

  /**
   * Experiment: once the names have landed, the page scrolls itself down at a steady speed (stopping at the
   * end). Any touch, wheel, click or key pauses it; it carries on after `resumeAfterMs` without input.
   * Add `?auto=0` / `?auto=1` to the link to switch it off / on for a quick comparison.
   */
  autoScroll: {
    enabled: true,
    pxPerSecond: { phone: 70, laptop: 90 },
    /** speed multiplier through the temple scenes with no words (tower rise, temple courtyard) */
    templeBoost: 1.5,
    startAfterMs: 4500,
    /** after a touch, carries on once the page has been still this long (the "Swipe up" hint shows at 2 s) */
    resumeAfterMs: 6000,
  },

  /** Private guest log: the Google Apps Script web-app URL (scripts/guest-log.gs). Empty = off. */
  trackUrl: '',
}

/** The shape every language's copy must follow (src/data/inviteKn.ts). */
export type Invite = typeof invite
