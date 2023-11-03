import { CowSwapWidgetEnv } from './types'

function getPrHostName(): string {
  const prKey = location.hostname.replace('widget-configurator-git-', '').replace('-cowswap.vercel.app', '')

  return `https://swap-dev-git-${prKey}-cowswap.vercel.app`
}

export const COWSWAP_URLS: Record<CowSwapWidgetEnv, string> = {
  local: 'http://localhost:3000',
  prod: 'https://swap.cow.fi',
  dev: 'https://dev.swap.cow.fi',
  pr: getPrHostName(),
}
