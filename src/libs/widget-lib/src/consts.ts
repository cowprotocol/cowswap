import { CowSwapWidgetEnv } from './types'

export const DEFAULT_CHAIN = 1
export const DEFAULT_WIDTH = 400
export const DEFAULT_HEIGHT = 640

export const COWSWAP_URLS: Record<CowSwapWidgetEnv, string> = {
  local: 'http://localhost:3000',
  barn: 'https://barn.cow.fi',
  prod: 'http://swap.cow.fi',
}
