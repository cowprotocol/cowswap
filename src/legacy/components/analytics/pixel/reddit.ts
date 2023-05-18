import { PIXEL_EVENTS } from './constants'

const events = {
  [PIXEL_EVENTS.INIT]: 'Lead',
  [PIXEL_EVENTS.CONNECT_WALLET]: 'SignUp',
  [PIXEL_EVENTS.POST_TRADE]: 'Purchase',
}

export const sendRedditEvent = (event: PIXEL_EVENTS) => {
  window.rdt?.('track', events[event])
}
