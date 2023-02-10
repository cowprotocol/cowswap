import { PIXEL_EVENTS } from './constants'

const events = {
  [PIXEL_EVENTS.INIT]: 'search',
  [PIXEL_EVENTS.CONNECT_WALLET]: 'sign_up',
  [PIXEL_EVENTS.POST_TRADE]: 'purchase',
}

export const sendPavedEvent = (event: PIXEL_EVENTS) => {
  window.pvd?.('event', events[event])
}
