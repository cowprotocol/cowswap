import { PIXEL_EVENTS } from './constants'
import { sendPixel } from './utils'

const events = {
  [PIXEL_EVENTS.INIT]: 'Lead',
  [PIXEL_EVENTS.CONNECT_WALLET]: 'SignUp',
  [PIXEL_EVENTS.POST_TRADE]: 'Purchase',
}

export const sendRedditEvent = sendPixel((event) => {
  window.rdt?.('track', events[event])
})
