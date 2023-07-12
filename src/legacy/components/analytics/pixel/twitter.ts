import { PIXEL_EVENTS } from './constants'
import { sendPixel } from './utils'

const events = {
  [PIXEL_EVENTS.INIT]: 'tw-oddz2-oddz8',
  [PIXEL_EVENTS.CONNECT_WALLET]: 'tw-oddz2-oddza',
  [PIXEL_EVENTS.POST_TRADE]: 'tw-oddz2-oddzb',
}

export const sendTwitterEvent = sendPixel((event: PIXEL_EVENTS) => {
  window.twq?.('event', events[event], {})
})
