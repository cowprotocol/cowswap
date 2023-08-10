import { PIXEL_EVENTS } from './constants'
import { sendPixel } from './utils'

const events = {
  [PIXEL_EVENTS.INIT]: 'InitiateCheckout',
  [PIXEL_EVENTS.CONNECT_WALLET]: 'Contact',
  [PIXEL_EVENTS.POST_TRADE]: 'Lead',
}

export const sendFacebookEvent = sendPixel((event) => {
  window.fbq?.('track', events[event])
})
