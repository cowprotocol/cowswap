import { Pixel, PixelEvent } from '../PixelAnalytics'

export class MicrosoftPixel implements Pixel<string> {
  public events: Record<PixelEvent, string> = {
    [PixelEvent.INIT]: 'page_view',
    [PixelEvent.CONNECT_WALLET]: 'begin_checkout',
    [PixelEvent.POST_TRADE]: 'purchase',
  }

  send(event: PixelEvent): void {
    window.uetq = window.uetq || []
    window.uetq.push('event', this.events[event], {})
  }
}
