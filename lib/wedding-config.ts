export type Venue = {
  label: string
  name: string
  time: string
  address: string[]
  mapsQuery: string
  description: string
}

export type TimelineItem = { time: string; title: string; detail: string }

const mapsUrl = (query: string) =>
  `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`

export const wedding = {
  partnerOne: 'Eleanor',
  partnerTwo: 'James',
  // ISO with offset so the countdown is correct in every guest's timezone.
  dateISO: '2027-06-12T15:30:00+01:00',
  dateLabel: 'Saturday, 12 June 2027',
  shortDate: '12 · 06 · 2027',
  location: 'Cotswolds, England',
  rsvpDeadlineISO: '2027-04-30T23:59:59+01:00',
  rsvpDeadlineLabel: 'Friday, 30 April 2027',
  contactEmail: 'hello@eleanorandjames.com',
  greeting:
    'Together with their families, Eleanor and James request the pleasure of your company as they begin their life together.',
  venues: [
    {
      label: 'The Ceremony',
      name: 'St. Mary’s Chapel',
      time: '3:30 in the afternoon',
      address: ['Church Lane', 'Bibury, Gloucestershire', 'GL7 5NR'],
      mapsQuery: "St Mary's Church, Bibury, Gloucestershire",
      description:
        'A small Saxon chapel beside the River Coln. Please be seated by 3:15pm; the doors will close as the bride arrives.',
    },
    {
      label: 'The Reception',
      name: 'Hollyhock House',
      time: '5:00 until midnight',
      address: ['Ablington Road', 'Bibury, Gloucestershire', 'GL7 5NX'],
      mapsQuery: 'Ablington, Bibury, Gloucestershire',
      description:
        'A ten-minute walk through the village, or a short shuttle ride. Dinner in the walled garden, dancing in the old barn.',
    },
  ] satisfies Venue[],
  timeline: [
    { time: '3:15 pm', title: 'Guests arrive', detail: 'Find your seat at St. Mary’s Chapel.' },
    { time: '3:30 pm', title: 'Ceremony', detail: 'We say our vows.' },
    { time: '4:15 pm', title: 'Garden stroll', detail: 'Walk or shuttle to Hollyhock House.' },
    { time: '5:00 pm', title: 'Drinks & canapés', detail: 'On the lawn, with a string trio.' },
    { time: '6:30 pm', title: 'Dinner', detail: 'A long-table supper in the walled garden.' },
    { time: '8:30 pm', title: 'First dance', detail: 'Then the barn doors open.' },
    { time: '12:00 am', title: 'Carriages', detail: 'Shuttles return to Cirencester.' },
  ] satisfies TimelineItem[],
  dressCode: {
    title: 'Garden Formal',
    detail:
      'Suits or tailored separates, floor-length or midi dresses. Soft, natural tones are lovely; we’d gently ask that you avoid white and ivory. The ceremony and dinner are on grass, so block heels or flats are recommended.',
    palette: ['#7f9177', '#c9b48a', '#d9cfc0', '#8a9aa6', '#b98e7a'],
  },
  reminders: [
    {
      title: 'An unplugged ceremony',
      detail:
        'Our photographer will capture every moment. Please keep phones and cameras tucked away until the reception.',
    },
    {
      title: 'Shuttles & parking',
      detail:
        'Parking in Bibury is very limited. Complimentary shuttles leave the Cirencester Market Place at 2:30pm and return from midnight.',
    },
    {
      title: 'Little ones',
      detail:
        'We love your children, but we have chosen an adults-only celebration — with the exception of the little ones named on your invitation.',
    },
    {
      title: 'Gifts',
      detail:
        'Your presence is the greatest gift. Should you wish to give something, a contribution to our honeymoon fund would be warmly received.',
    },
  ],
}

export const getMapsUrl = mapsUrl

export function isRsvpOpen(now = new Date()) {
  return now.getTime() <= new Date(wedding.rsvpDeadlineISO).getTime()
}
