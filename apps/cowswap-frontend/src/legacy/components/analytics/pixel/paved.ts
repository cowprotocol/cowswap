import { PIXEL_EVENTS } from './constants'
import { sendPixel } from './utils'

const events = {
  [PIXEL_EVENTS.INIT]: 'search',
  [PIXEL_EVENTS.CONNECT_WALLET]: 'sign_up',
  [PIXEL_EVENTS.POST_TRADE]: 'purchase',
}

export const sendPavedEvent = sendPixel((event: PIXEL_EVENTS) => {
  window.pvd?.('event', events[event])
})
