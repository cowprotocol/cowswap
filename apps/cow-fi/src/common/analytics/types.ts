import { Category, GtmEvent } from '@cowprotocol/analytics'

/**
 * Cow-Fi-specific analytics categories
 */
export enum CowFiCategory {
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

// Re-export common UI categories
export { Category }

/**
 * Cow-Fi-specific GTM event type
 */
export type CowFiGtmEvent = GtmEvent<CowFiCategory | Category>
