import { CowSwapWidgetEnv } from './types'

function getPrHostName(): string {
  if (typeof window === 'undefined' || !window) return ''

  const prKey = window.location.hostname.replace('widget-configurator-git-', '').replace('-cowswap.vercel.app', '')

  return `https://swap-dev-git-${prKey}-cowswap.vercel.app`
}

export const COWSWAP_URLS: Record<CowSwapWidgetEnv, string> = {
  local: 'http://localhost:3000',
  prod: 'https://swap.cow.fi',
  dev: 'https://dev.swap.cow.fi',
  pr: getPrHostName(),
}
