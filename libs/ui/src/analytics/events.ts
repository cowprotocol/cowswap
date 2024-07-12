import { detectExplorer } from '@cowprotocol/common-utils'
import { CowAnalytics } from '../../../analytics/src'

/**
 * Common UI shared events
 */
enum Category {
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
