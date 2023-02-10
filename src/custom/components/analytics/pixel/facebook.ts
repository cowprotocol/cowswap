import { PIXEL_EVENTS } from './constants'

const events = {
  [PIXEL_EVENTS.INIT]: 'InitiateCheckout',
  [PIXEL_EVENTS.CONNECT_WALLET]: 'Contact',
  [PIXEL_EVENTS.POST_TRADE]: 'Lead',
}

export const sendFacebookEvent = (event: PIXEL_EVENTS) => {
  window.fbq?.('track', events[event])
}
