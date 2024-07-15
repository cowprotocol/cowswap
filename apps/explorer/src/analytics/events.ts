import { WebVitalsAnalytics, initCowAnalyticsGoogle, initPixelAnalytics } from '@cowprotocol/analytics'

export const cowAnalytics = initCowAnalyticsGoogle()
export const pixelAnalytics = initPixelAnalytics()
export const webVitalsAnalytics = new WebVitalsAnalytics(cowAnalytics)

export enum Category {
  ORDER_DETAILS = 'Order details',
}

export function clickOnOrderDetails(action: string, label?: string) {
  cowAnalytics.sendEvent({
    category: Category.ORDER_DETAILS,
    action,
    label,
  })
}
