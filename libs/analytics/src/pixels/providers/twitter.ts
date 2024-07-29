import { Pixel, PixelEvent } from '../PixelAnalytics'

export class TwitterPixel implements Pixel<string> {
  public events: Record<PixelEvent, string> = {
    [PixelEvent.INIT]: 'tw-oddz2-oddz8',
    [PixelEvent.CONNECT_WALLET]: 'tw-oddz2-oddza',
    [PixelEvent.POST_TRADE]: 'tw-oddz2-oddzb',
  }

  send(event: PixelEvent): void {
    window.twq?.('event', this.events[event], {})
  }
}
