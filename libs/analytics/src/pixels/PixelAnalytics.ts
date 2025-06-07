export enum PixelEvent {
  INIT = 'init',
  CONNECT_WALLET = 'connect_wallet',
  POST_TRADE = 'post_trade',
}

export type SendPixel = (event: PixelEvent) => void

export interface Pixel<T> {
  events: Record<PixelEvent, T>
  send(event: PixelEvent): void
}

/**
 * Add analytics for certain platforms using hidden pixels
 */
export class PixelAnalytics {
  private sendPixelCallbacks = new Map<PixelEvent, SendPixel[]>()

  constructor(pixels: Pixel<unknown>[]) {
    pixels.forEach((pixel) =>
      this.enablePixelEvents(
        pixel.events,
        sendPixelWithErrorHandling((event) => {
          pixel.send(event)
        })
      )
    )
  }

  /**
   * Sends all the enabled pixels for the given event
   *
   * @param event event to send
   */
  sendAllPixels(event: PixelEvent): void {
    const callbacks = this.sendPixelCallbacks.get(event)
    if (!callbacks) return

    callbacks.forEach((callback) => callback(event))
  }

  /**
   * Register a pixel callback for the given set of events events
   */
  // TODO: Add proper return type annotation
  // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
  private enablePixelEvents<T>(eventMap: Record<PixelEvent, T>, sendPixel: SendPixel) {
    Object.keys(eventMap).forEach((event) => {
      const e = event as PixelEvent
      this.enablePixel(e, sendPixel)
    })
  }

  // TODO: Add proper return type annotation
  // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
  private enablePixel(event: PixelEvent, sendPixel: SendPixel) {
    let callbacks = this.sendPixelCallbacks.get(event)
    if (!callbacks) {
      callbacks = []
      this.sendPixelCallbacks.set(event, callbacks)
    }

    callbacks.push(sendPixel)
  }
}

export function sendPixelWithErrorHandling(sendFn: SendPixel): SendPixel {
  return (event) => {
    try {
      sendFn(event)
    // TODO: Replace any with proper type definitions
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (e: any) {
      console.error('Error sending pixel event', e)
    }
  }
}
