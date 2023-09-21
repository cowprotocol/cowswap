import { enablePixel } from './sendAllPixels'
import { PixelEvent, PixelEventMap } from './types'
import { sendPixel } from './utils'

const events: PixelEventMap<string> = {
  [PixelEvent.INIT]: 'Lead',
  [PixelEvent.CONNECT_WALLET]: 'SignUp',
  [PixelEvent.POST_TRADE]: 'Purchase',
}

const sendRedditEvent = sendPixel((event) => {
  window.rdt?.('track', events[event])
})

export function enablePixelReddit() {
  enablePixel(events, sendRedditEvent)
}
