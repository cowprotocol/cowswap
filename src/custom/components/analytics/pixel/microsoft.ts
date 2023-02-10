import { PIXEL_EVENTS } from './constants'

const events = {
  [PIXEL_EVENTS.INIT]: 'page_view',
  [PIXEL_EVENTS.CONNECT_WALLET]: 'begin_checkout',
  [PIXEL_EVENTS.POST_TRADE]: 'purchase',
}

export const sendMicrosoftEvent = (event: PIXEL_EVENTS) => {
  window.uetq = window.uetq || []
  window.uetq.push('event', events[event], {})
}
