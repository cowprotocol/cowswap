import { PixelEvent, PixelEventMap, SendPixel } from './types'

const sendPixelCallbacks: Map<PixelEvent, SendPixel[]> = new Map()

/**
 * Sends all the enabled pixels for the given event
 *
 * @param event event to send
 */
export function sendAllPixels(event: PixelEvent): void {
  const callbacks = sendPixelCallbacks.get(event)
  if (!callbacks) return

  callbacks.forEach((callback) => callback(event))
}

function _enablePixel(event: PixelEvent, sendPixel: SendPixel) {
  let callbacks = sendPixelCallbacks.get(event)
  if (!callbacks) {
    callbacks = []
    sendPixelCallbacks.set(event, callbacks)
  }

  callbacks.push(sendPixel)
}

/**
 * Register a pixel callback for the given set of events events
 */
export function enablePixel(eventMap: PixelEventMap<any>, sendPixel: SendPixel) {
  Object.keys(eventMap).forEach((event) => {
    const e = event as PixelEvent
    _enablePixel(e, sendPixel)
  })
}
