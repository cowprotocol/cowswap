import { PIXEL_ENABLED, PIXEL_EVENTS } from './constants'

type SendPixelFn = (event: PIXEL_EVENTS) => void

export function sendPixel(sendFn: SendPixelFn): SendPixelFn {
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
