import { AnalyticsCategory, Category, GtmEvent, toGtmEvent } from '@cowprotocol/analytics'

/**
 * Cow-Fi-specific analytics categories
 * Extends the base Category enum with Cow-Fi-specific values
 */
export enum CowFiCategory {
  // Base Category values (must match exactly)
  SERVICE_WORKER = Category.SERVICE_WORKER,
  FOOTER = Category.FOOTER,
  EXTERNAL_LINK = Category.EXTERNAL_LINK,

  // Core Categories
  HOME = 'Homepage',
  NAVIGATION = 'Navigation',
  WIDGET = 'Widget',
  COWAMM = 'CoW AMM',
  COWSWAP = 'CoW Swap',
  COWPROTOCOL = 'CoW Protocol',
  MEVBLOCKER = 'MEV Blocker',
  DAOS = 'DAOs',
  KNOWLEDGEBASE = 'Knowledge Base',
  ERROR404 = 'Error 404',
  CAREERS = 'Careers',
  TOKENS = 'Tokens',
  LEGAL = 'Legal',
}

/**
 * Cow-Fi-specific GTM event type
 */
export type CowFiGtmEvent = GtmEvent<CowFiCategory>

/**
 * Helper function to create GTM events with Cow-Fi categories
 */
export function toCowFiGtmEvent(event: Omit<CowFiGtmEvent, 'category'> & { category: CowFiCategory }): string {
  return toGtmEvent({
    ...event,
    category: event.category as unknown as AnalyticsCategory,
  } as GtmEvent)
}
