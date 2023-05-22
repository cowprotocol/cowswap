import { PIXEL_EVENTS } from './constants'

const events = {
  [PIXEL_EVENTS.INIT]: 10759506,
  [PIXEL_EVENTS.CONNECT_WALLET]: 10759514,
  [PIXEL_EVENTS.POST_TRADE]: 10759522,
}

export const sendLinkedinEvent = (event: PIXEL_EVENTS) => {
  window.lintrk?.('track', { conversion_id: events[event] })
}
