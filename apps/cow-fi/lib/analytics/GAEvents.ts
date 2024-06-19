export enum GAEventCategories {
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

export const WidgetEvents = {
  CONFIGURE_WIDGET: { category: GAEventCategories.WIDGET, action: 'Configure Widget' },
  READ_DOCS: { category: GAEventCategories.WIDGET, action: 'Read Docs' },
  READ_TERMS: { category: GAEventCategories.WIDGET, action: 'Read Terms and Conditions' },
  TALK_TO_US: { category: GAEventCategories.WIDGET, action: 'Talk To Us' },
}
