export enum PixelEvent {
  INIT = 'init',
  CONNECT_WALLET = 'connect_wallet',
  POST_TRADE = 'post_trade',
}

export type SendPixel = (event: PixelEvent) => void

export type PixelEventMap<T> = Record<PixelEvent, T>
