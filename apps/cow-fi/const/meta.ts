const API_BASE_URL = 'https://api.cow.fi'
export const IMAGE_PATH = 'images/'

export const DATA_CACHE_TIME_SECONDS = 60 * 60 // 1 hour

export const CONFIG = {
  title: {
    template: '%s - CoW DAO',
    default: 'CoW DAO',
  },
  metatitle_tokenDetail: 'Live Token Price Chart & Metrics',
  description: 'CoW DAO develops the most user-protective products in Ethereum - so you can do more with less worry.',
  descriptionShort: "Don't get milked!",
  ogImage: 'https://cow.fi/images/og-meta-cowdao.png',
  ogImageCOWAMM: 'https://cow.fi/images/og-meta-cowamm.png',
  ogImageCOWSWAPP: 'https://cow.fi/images/og-meta-cowswap.png',
  ogImageMEVBLOCKER: 'https://cow.fi/images/og-meta-mevblocker.png',
  ogImageCOWPROTOCOL: 'https://cow.fi/images/og-meta-cowprotocol.png',
  url: {
    root: 'https://cow.fi',
    swap: 'https://swap.cow.fi/#/1/swap/DAI/COW?sellAmount=500',
    docs: 'https://docs.cow.fi',
    api: API_BASE_URL + '/mainnet',
    apiDocs: API_BASE_URL + '/docs',
    daos: '/daos',
    cowamm: '/cow-amm',
    widget: '/widget',
    widgetTnC: '/widget/terms-and-conditions',
    careers: '/careers',
    widgetConfigurator: 'widget.cow.fi',
    analytics: 'https://dune.com/cowprotocol/cow-swap-home',
    explorer: 'https://explorer.cow.fi',
    securityPortal: 'https://app.chainpatrol.io/cow',
    grants: 'https://grants.cow.fi',
  },
  ashbyHqApi: 'https://jobs.ashbyhq.com/api/non-user-graphql',
  social: {
    twitter: { label: 'Twitter', account: '@CoWSwap', url: 'https://twitter.com/CoWSwap' },
    discord: { label: 'Discord', url: 'https://discord.com/invite/cowprotocol' },
    github: { label: 'GitHub', url: 'https://github.com/cowprotocol/' },
    forum: { label: 'Forum', url: 'https://forum.cow.fi/' },
  },
  utm: {
    utmSource: 'cow.fi',
    utmMedium: 'web',
  },
  contentDisclaimer: {
    title: 'IMPORTANT DISCLAIMER:',
    body: 'Content on cow.fi is provided for general informational and educational purposes only. No representation or warranty is made regarding its accuracy, completeness, or currency. Nothing in this content constitutes financial, investment, legal, tax, or other professional advice, or a recommendation, solicitation, or offer to buy, sell, hold, or use any asset, product, or service. Digital assets and decentralised technologies involve significant risks and may result in substantial losses. You should conduct your own research and consult appropriate professional advisers before making decisions. Any use of or reliance on this content is at your own risk and discretion.',
  },
}
