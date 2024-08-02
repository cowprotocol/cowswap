import { Pixel, PixelEvent } from '../PixelAnalytics'

export class RedditPixel implements Pixel<string> {
  public events: Record<PixelEvent, string> = {
    [PixelEvent.INIT]: 'Lead',
    [PixelEvent.CONNECT_WALLET]: 'SignUp',
    [PixelEvent.POST_TRADE]: 'Purchase',
  }

  send(event: PixelEvent): void {
    window.rdt?.('track', this.events[event])
  }
}
