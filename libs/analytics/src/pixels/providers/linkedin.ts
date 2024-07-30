import { Pixel, PixelEvent } from '../PixelAnalytics'

export class LinkedinPixel implements Pixel<number> {
  public events: Record<PixelEvent, number> = {
    [PixelEvent.INIT]: 10759506,
    [PixelEvent.CONNECT_WALLET]: 10759514,
    [PixelEvent.POST_TRADE]: 10759522,
  }

  send(event: PixelEvent): void {
    window.lintrk?.('track', { conversion_id: this.events[event] })
  }
}
