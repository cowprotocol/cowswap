// TODO: Leaving true just for testing, then i will enable for PROD and ENS
export const PIXEL_ENABLED = true // isProd || isEns

export enum PIXEL_EVENTS {
  INIT = 'init',
  CONNECT_WALLET = 'connect_wallet',
  POST_TRADE = 'post_trade',
}
