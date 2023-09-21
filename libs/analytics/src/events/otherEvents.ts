import { detectExplorer } from '@cowprotocol/common-utils'

import { sendEvent } from '../googleAnalytics'
import { Category } from '../types'

type GameType = 'CoW Runner' | 'MEV Slicer'
export function gameAnalytics(gameType: GameType) {
  sendEvent({
    category: Category.GAMES,
    action: `Playing ${gameType} game`,
  })
}

export function externalLinkAnalytics(href: string) {
  const explorer = detectExplorer(href)

  if (explorer) {
    sendEvent({
      category: Category.EXTERNAL_LINK,
      action: `View on ${explorer}`,
      label: href,
    })
  }
}

export function serviceWorkerAnalytics() {
  const installed = Boolean(window.navigator.serviceWorker?.controller)
  const hit = Boolean((window as any).__isDocumentCached)
  const action = installed ? (hit ? 'Cache hit' : 'Cache miss') : 'Not installed'

  sendEvent({
    category: Category.SERVICE_WORKER,
    nonInteraction: true,
    action,
  })
}

export function initAnalytics() {
  sendEvent({
    category: Category.INIT,
    action: 'initial_landing_on_swap_cow_fi',
  })
}
