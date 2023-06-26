import { CowSwapWidgetEnv } from './types'

export const COWSWAP_URLS: Record<CowSwapWidgetEnv, string> = {
  local: window.location.origin,
  prod: 'https://swap.cow.fi',
}
