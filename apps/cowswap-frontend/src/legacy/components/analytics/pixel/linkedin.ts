import { PIXEL_EVENTS } from './constants'
import { sendPixel } from './utils'

const events = {
  [PIXEL_EVENTS.INIT]: 10759506,
  [PIXEL_EVENTS.CONNECT_WALLET]: 10759514,
  [PIXEL_EVENTS.POST_TRADE]: 10759522,
}

export const sendLinkedinEvent = sendPixel((event) => {
  window.lintrk?.('track', { conversion_id: events[event] })
})
