import { enablePixel } from './sendAllPixels'
import { PixelEvent, PixelEventMap } from './types'
import { sendPixel } from './utils'

const events: PixelEventMap<string> = {
  [PixelEvent.INIT]: 'tw-oddz2-oddz8',
  [PixelEvent.CONNECT_WALLET]: 'tw-oddz2-oddza',
  [PixelEvent.POST_TRADE]: 'tw-oddz2-oddzb',
}

export const sendTwitterEvent = sendPixel((event) => {
  window.twq?.('event', events[event], {})
})

export function enablePixelTwitter() {
  enablePixel(events, sendTwitterEvent)
}
