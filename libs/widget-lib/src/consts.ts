import { CowSwapWidgetEnv } from './types'

export const COWSWAP_URLS: Record<CowSwapWidgetEnv, string> = {
  local: 'http://localhost:3000',
  prod: 'https://swap.cow.fi',
  dev: 'https://dev.swap.cow.fi',
  pr: window.location.origin,
}
