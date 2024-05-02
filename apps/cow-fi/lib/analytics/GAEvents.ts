export enum GAEventCategories {
  NAVIGATION = 'Navigation',
  WIDGET = 'Widget',
  COWAMM = 'CoW AMM',
}

export const NavigationEvents = {
  TRADE_ON_COWSWAP: { category: GAEventCategories.NAVIGATION, action: 'Trade On CoW Swap' },
}

export const WidgetEvents = {
  CONFIGURE_WIDGET: { category: GAEventCategories.WIDGET, action: 'Configure Widget' },
  READ_DOCS: { category: GAEventCategories.WIDGET, action: 'Read Docs' },
  READ_TERMS: { category: GAEventCategories.WIDGET, action: 'Read Terms and Conditions' },
  TALK_TO_US: { category: GAEventCategories.WIDGET, action: 'Talk To Us' },
}
