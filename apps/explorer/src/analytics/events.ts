import { initCowAnalyticsGoogle } from '@cowprotocol/analytics'

export const cowAnalytics = initCowAnalyticsGoogle()

export enum Category {}
// HOME = 'Homepage',

export function clickOnToken(name: string) {
  cowAnalytics.sendEvent({
    category: Category.TOKENS,
    action: `click-token-${name}`,
  })
}
