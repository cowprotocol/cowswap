import { Pixel, PixelEvent } from '../PixelAnalytics'

export class FacebookPixel implements Pixel<string> {
  public events: Record<PixelEvent, string> = {
    [PixelEvent.INIT]: 'InitiateCheckout',
    [PixelEvent.CONNECT_WALLET]: 'Contact',
    [PixelEvent.POST_TRADE]: 'Lead',
  }

  send(event: PixelEvent): void {
    window.fbq?.('track', this.events[event])
  }
}
