import { enablePixel } from './sendAllPixels'
import { PixelEvent, PixelEventMap } from './types'
import { sendPixel } from './utils'

const events: PixelEventMap<string> = {
  [PixelEvent.INIT]: 'page_view',
  [PixelEvent.CONNECT_WALLET]: 'begin_checkout',
  [PixelEvent.POST_TRADE]: 'purchase',
}

const sendMicrosoftEvent = sendPixel((event) => {
  window.uetq = window.uetq || []
  window.uetq.push('event', events[event], {})
})

export function enablePixelMicrosoft() {
  enablePixel(events, sendMicrosoftEvent)
}
