import { PIXEL_EVENTS } from './constants'

const events = {
  [PIXEL_EVENTS.INIT]: 'tw-oddz2-oddz8',
  [PIXEL_EVENTS.CONNECT_WALLET]: 'tw-oddz2-oddza',
  [PIXEL_EVENTS.POST_TRADE]: 'tw-oddz2-oddzb',
}

export const sendTwitterEvent = (event: PIXEL_EVENTS) => {
  window.twq?.('event', events[event], {})
}
