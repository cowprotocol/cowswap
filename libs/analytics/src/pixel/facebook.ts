import { enablePixel } from './sendAllPixels'
import { PixelEvent, PixelEventMap } from './types'
import { sendPixel } from './utils'

const events: PixelEventMap<string> = {
  [PixelEvent.INIT]: 'InitiateCheckout',
  [PixelEvent.CONNECT_WALLET]: 'Contact',
  [PixelEvent.POST_TRADE]: 'Lead',
}

const sendFacebookEvent = sendPixel((event) => {
  window.fbq?.('track', events[event])
})

export function enablePixelFacebook() {
  enablePixel(events, sendFacebookEvent)
}
