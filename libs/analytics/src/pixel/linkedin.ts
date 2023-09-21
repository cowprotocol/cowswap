import { enablePixel } from './sendAllPixels'
import { PixelEvent, PixelEventMap } from './types'
import { sendPixel } from './utils'

const events: PixelEventMap<number> = {
  [PixelEvent.INIT]: 10759506,
  [PixelEvent.CONNECT_WALLET]: 10759514,
  [PixelEvent.POST_TRADE]: 10759522,
}

const sendLinkedinEvent = sendPixel((event) => {
  window.lintrk?.('track', { conversion_id: events[event] })
})

export function enablePixelLinkedin() {
  enablePixel(events, sendLinkedinEvent)
}
