import { PIXEL_ENABLED } from './constants'
import { SendPixel } from './types'

export function sendPixel(sendFn: SendPixel): SendPixel {
  return (event) => {
    if (!PIXEL_ENABLED) {
      return
    }

    try {
      sendFn(event)
    } catch (e: any) {
      console.error('Error sending pixel event', e)
    }
  }
}
