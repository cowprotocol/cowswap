import { enablePixel } from './sendAllPixels'
import { PixelEvent, PixelEventMap } from './types'
import { sendPixel } from './utils'

const events: PixelEventMap<string> = {
  [PixelEvent.INIT]: 'search',
  [PixelEvent.CONNECT_WALLET]: 'sign_up',
  [PixelEvent.POST_TRADE]: 'purchase',
}

const sendPavedEvent = sendPixel((event) => {
  window.pvd?.('event', events[event])
})

export function enablePixelPaved() {
  enablePixel(events, sendPavedEvent)
}
