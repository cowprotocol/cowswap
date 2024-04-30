import { TokenInfo } from 'types'

const API_BASE_URL = 'https://api.cow.fi'

export const CONFIG = {
  title: 'CoW Protocol',
  metatitle_tokenDetail: 'Live Token Price Chart & Metrics',
  description:
    'CoW Protocol finds the lowest prices from all decentralized exchanges and DEX aggregators & saves you more with p2p trading and protection from MEV ',
  descriptionShort: 'The smartest way to trade',
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
    analytics: 'https://dune.com/cowprotocol/cowswap',
    explorer: 'https://explorer.cow.fi',
    securityPortal: 'https://app.chainpatrol.io/cow',
    grants: 'https://grants.cow.fi',
    mevBlocker: 'https://mevblocker.io/',
  },
  greenhouse: {
    api: 'https://boards-api.greenhouse.io/v1/boards/cowswap/jobs?content=true',
  },
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
  tokenDisclaimer:
    'IMPORTANT DISCLAIMER: The information presented on the Interface, including hyperlinked sites, associated applications, forums, blogs, social media accounts, and other platforms, serves as general information sourced from third-party providers. We want to emphasise that we do not provide any warranties regarding the accuracy or up-to-dateness of the content. None of the content should be interpreted as financial, tax, legal, or any other type of advice. Your use or reliance on the content is entirely at your own discretion and risk. Before making any decisions, it is crucial that you undertake your own research, review, analysis, and verification of our content. Trading carries significant risks and can result in substantial losses, so it is advisable to consult your own legal, financial, tax, or other professional advisors prior to making any decisions. None of the content on the Interface is intended as a solicitation or offer.',
}

type TokenInfoExcluded = Omit<TokenInfo, 'id' | 'change24h' | 'marketCapRank' | 'image'>

interface MetaTokenDetails extends TokenInfoExcluded {
  changeDirection: string
  change24hTrimmed: string
}

export const META_DESCRIPTION_TEMPLATES = [
  ({ name, symbol, priceUsd, change24hTrimmed, volume, marketCap }: MetaTokenDetails) =>
    `Moo-ve over to ${name} (${symbol})! Grazing at $${priceUsd} with ${change24hTrimmed}% change in 24h. Trading volume: $${volume}. Their market cap: $${marketCap}. Learn about ${symbol}'s pasture.`,

  ({ name, symbol, priceUsd, change24hTrimmed, volume, marketCap }: MetaTokenDetails) =>
    `The grass is greener with ${name} (${symbol})! At $${priceUsd}, with ${change24hTrimmed}% change in 24h. Trading volume: $${volume}. Their market cap: $${marketCap}. Discover more about ${symbol}.`,

  ({ name, symbol, priceUsd, change24hTrimmed, volume, marketCap }: MetaTokenDetails) =>
    `Interested in ${name} (${symbol})? Priced at $${priceUsd}, with ${change24hTrimmed}% change in 24h. Trading volume: $${volume}. Their market cap: $${marketCap}. Learn more about ${symbol}!`,

  ({ name, symbol, priceUsd, change24hTrimmed, volume, marketCap }: MetaTokenDetails) =>
    `Graze on this: ${name} (${symbol}) at $${priceUsd}, with ${change24hTrimmed}% change in 24h. Trading volume: $${volume}. They boast a market cap of $${marketCap}. Learn about ${symbol}.`,

  ({ name, symbol, priceUsd, change24hTrimmed, volume, marketCap }: MetaTokenDetails) =>
    `Ever heard of ${name} (${symbol})? At $${priceUsd}, they've marked a ${change24hTrimmed}% change in 24h. Trading volume: $${volume}. Their market cap: $${marketCap}. Get to know them.`,

  ({ name, symbol, priceUsd, change24hTrimmed, volume, marketCap }: MetaTokenDetails) =>
    `Check out ${name} (${symbol})! Grazing at $${priceUsd}, with ${change24hTrimmed}% change in 24h. Trading volume: $${volume}. Their market cap: $${marketCap}. Discover ${symbol}'s secrets.`,

  ({ name, symbol, priceUsd, change24hTrimmed, volume, marketCap }: MetaTokenDetails) =>
    `Latest on ${name} (${symbol}): priced at $${priceUsd}. Experienced a ${change24hTrimmed}% change in 24h. Trading volume: $${volume}. Their market cap: $${marketCap}. Learn more.`,
]
