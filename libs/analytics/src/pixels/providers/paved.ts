import { Pixel, PixelEvent } from '../PixelAnalytics'

export class PavedPixel implements Pixel<string> {
  public events: Record<PixelEvent, string> = {
    [PixelEvent.INIT]: 'search',
    [PixelEvent.CONNECT_WALLET]: 'sign_up',
    [PixelEvent.POST_TRADE]: 'purchase',
  }

  send(event: PixelEvent): void {
    window.pvd?.('event', this.events[event])
  }
}
