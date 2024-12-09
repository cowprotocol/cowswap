import { CowAnalytics } from '@cowprotocol/analytics';
import { detectExplorer } from '@cowprotocol/common-utils'


/**
 * Common UI shared events
 */
enum Category {
  SERVICE_WORKER = 'Service Worker',
  FOOTER = 'Footer',
  EXTERNAL_LINK = 'External Link',
}

export function externalLinkAnalytics(cowAnalytics: CowAnalytics, href: string) {
  const explorer = detectExplorer(href)

  cowAnalytics.sendEvent({
    category: Category.EXTERNAL_LINK,
    action: explorer ? `View on ${explorer}` : 'Click external link',
    label: href,
  })
}

export function clickOnFooter(cowAnalytics: CowAnalytics, name: string) {
  cowAnalytics.sendEvent({
    category: Category.FOOTER,
    action: name,
  })
}

export function serviceWorkerLoad(cowAnalytics: CowAnalytics, installed: boolean, hit: boolean) {
  const action = installed ? (hit ? 'Cache hit' : 'Cache miss') : 'Not installed'

  cowAnalytics.sendEvent({
    category: Category.SERVICE_WORKER,
    action,
    nonInteraction: true,
  })
}
