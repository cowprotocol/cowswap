import { isEns, isProd } from '@cowswap/common-utils'

export const PIXEL_ENABLED = isProd || isEns

export enum PIXEL_EVENTS {
  INIT = 'init',
  CONNECT_WALLET = 'connect_wallet',
  POST_TRADE = 'post_trade',
}
