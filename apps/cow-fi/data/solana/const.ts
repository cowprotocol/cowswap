import svgKaminoSrc from '@cowprotocol/assets/images/logo-kamino.svg'

export interface HeadlineLine {
  text: string
  script?: boolean
}

const script = (text: string): HeadlineLine => ({ text, script: true })
const caps = (text: string): HeadlineLine => ({ text })
const keepHyphenated = (text: string): string => text.split('-').join('\u2060-\u2060')

export const SOLANA_LINKS = {
  getInTouch: 'mailto:hello@cow.fi?subject=Building%20with%20CoW%20Protocol%20on%20Solana',
  startBuilding: 'https://docs.cow.fi/category/tutorials',
  docs: 'https://docs.cow.fi/',
  github: 'https://github.com/cowprotocol/',
  discord: 'https://discord.com/invite/cowprotocol',
  widget: '/widget',
} as const

const LAUNCH_HEADLINES = {
  hero: [script('Solana,'), caps('let’s get serious')],
  why: [script('Four Reasons'), caps('more is more')],
  howItWorks: [caps('From “I want” to “done”'), script('in Three Simple Steps')],
  trusted: [caps('References'), script('Available')],
  developers: [caps('More than'), script(keepHyphenated('A One-Swap Stand'))],
  doors: [caps('Looking for the easy way in?'), script('Pick your door.')],
  partners: [script('Better trades.'), caps('better business.')],
  faq: [caps('FAQs')],
  finalCta: [caps('Ready to'), script('Make it Official?')],
}

export const EVERGREEN_HEADLINES: typeof LAUNCH_HEADLINES = {
  hero: [caps('Say what you want.'), caps('Let solvers compete for it.')],
  why: [caps('Why build on CoW Protocol')],
  howItWorks: [caps('How it works')],
  trusted: [caps('Who’s building with us')],
  developers: [caps('Open source. Open door.')],
  doors: [caps('Pick your door')],
  partners: [caps('Built for wallets, aggregators and lenders')],
  faq: [caps('Frequently asked questions')],
  finalCta: [caps('Start building')],
}

/** Launch-campaign headlines; switch to `EVERGREEN_HEADLINES` once the campaign is over. */
export const ACTIVE_HEADLINES = LAUNCH_HEADLINES

export const HERO = {
  subhead:
    'You deserve a DEX partner that gives you more. More surplus. More protection. More advanced capabilities. And more.',
  image: {
    src: '/images/solana/ring-box.webp',
    alt: 'A cow-print ring box holding a ring topped with the CoW logo',
  },
}

export const STATS = [
  { value: '29', caption: 'solvers competing to find you better prices' },
  { value: '0 bps', caption: 'volume fee on Solana' },
  { value: '$1.3B', caption: 'total surplus sent to traders' },
]

export const WHY_REASONS = [
  {
    title: 'More solvers',
    description: 'When solvers fight to find better prices, users win.',
    image: { src: '/images/solana/reason-solvers.webp', alt: 'Cow-print boxing gloves with heart patches' },
  },
  {
    title: 'More ways to earn',
    description: 'Flexible monetization policies mean relationships work for both partners.',
    image: { src: '/images/solana/reason-earn.webp', alt: 'A tiered wedding cake decorated with coins' },
  },
  {
    title: 'More order types',
    description: 'Limit orders, TWAPs, collateral swaps. If you can think it, you can build it.',
    image: {
      src: '/images/solana/reason-orders.webp',
      alt: 'A wire crate of milk bottles, one tied with a pink bow',
    },
  },
  {
    title: 'More protection',
    description: 'Protection from MEV, price impact, reverts, and red flags of all kinds.',
    image: { src: '/images/solana/reason-protection.webp', alt: 'A pink cow-print safe with a heart-shaped dial' },
  },
]

export const HOW_IT_WORKS = {
  intro: 'It’s matchmaking, minus the awkward small talk.',
  steps: [
    {
      title: 'Say what you want',
      description: 'Your user signs an intent: sell this, get at least that. No routes, no small talk.',
      image: {
        src: '/images/solana/envelope.webp',
        alt: 'A cow-print envelope spilling metal hearts, with a letter reading “Dear Market, I’m not desperate. Call me when you meet my price. XOXO”',
      },
    },
    {
      title: 'Speed date',
      description: 'Orders are grouped in batches. Opposites attract. And solvers fight for the rest.',
      image: {
        src: '/images/solana/chess-knights.webp',
        alt: 'Two chess knights facing each other on cow-print bases',
      },
    },
    {
      title: 'It’s a Match',
      description: 'The winning solver settles the batch and users get what they asked for – or more.',
      image: {
        src: '/images/solana/cocktails.webp',
        alt: 'Two pink cocktails on cow-print coasters, garnished with cow-head picks',
      },
    },
  ],
  closing: {
    title: 'That’s it.',
    lines: ['You build the DeFi experience.', 'We handle the introductions.'],
  },
}

export const TRUSTED = {
  lead: {
    logo: svgKaminoSrc,
    stat: '$1.6B TVL',
    title: 'Day 1 integration',
    description:
      'The largest lending protocol on Solana integrated CoW Protocol for swaps as soon as it launched. When the biggest lender on the chain picks your engine, that’s worth a look.',
  },
  cards: [
    {
      title: 'Limit orders with no drama.',
      description:
        'Coinbase Wallet trusts CoW Protocol and no one else for seamless limit orders its users can rely on.',
      icon: { src: '/images/solana/coinbase-wallet-mono.webp', alt: 'Coinbase Wallet' },
    },
    {
      title: 'Advanced orders at scale.',
      description:
        'CoW Protocol powers collateral swaps, debt swaps, and repay-with-collateral for crypto’s largest DeFi protocol.',
      icon: { src: '/images/solana/aave-mono.webp', alt: 'Aave' },
    },
  ],
  closing: {
    status: 'Relationship status:',
    value: 'Integrated',
    lines: ['Yours could be next.', '(The moo is optional.)'],
  },
}

export const DEVELOPERS = {
  intro:
    'CoW Protocol is open source and permissionless. Read the docs. Ship. Nobody needs to approve your pull request.',
  features: [
    {
      title: 'Advanced capabilities',
      description: 'Build anything you can imagine with programmatic orders, atomic bundles, and CoW Hooks.',
      image: { src: '/images/solana/keypad.webp', alt: 'A cow-print macro keypad with a heart key and a pink cable' },
    },
    {
      title: 'Trusted contracts',
      description: 'CoW Protocol has been live for over five years on Ethereum with no smart contract incidents.',
      image: { src: '/images/solana/umbrella.webp', alt: 'An open cow-print umbrella with a pink handle in the rain' },
    },
  ],
  doors: [
    {
      title: 'SDK',
      description: keepHyphenated('Quote, sign, and submit orders with an easy-to-use SDK.'),
      linkText: 'Read the SDK docs',
      linkHref: 'https://docs.cow.fi/cow-protocol/reference/sdks/cow-sdk',
      action: 'sol_read_the_sdk_docs',
      tone: 'plum',
    },
    {
      title: 'API',
      description: 'Prefer to go direct? CoW Protocol’s REST APIs cover the orderbook.',
      linkText: 'Read the API docs',
      linkHref: 'https://docs.cow.fi/cow-protocol/reference/apis/orderbook',
      action: 'sol_read_the_api_docs',
      tone: 'pink',
    },
    {
      title: 'Widget',
      description: 'Offer swaps without building the interface or the infra.',
      linkText: 'Get the widget',
      linkHref: SOLANA_LINKS.widget,
      action: 'sol_get_the_widget',
      tone: 'blue',
    },
  ],
  learn: {
    before: keepHyphenated(
      'And when you get stuck: real documentation, plus an in-browser live-coding environment at ',
    ),
    linkText: 'learn.cow.fi',
    href: 'https://learn.cow.fi',
    after: '.',
  },
  buildInTheOpen: {
    title: 'Build in the open',
    body: 'The Solana programs are public on GitHub, and we’re shipping in stages. Read, poke, suggest changes, be part of where CoW Swap’s Solana chapter goes next.',
  },
} as const

export const PARTNERS = {
  intro: 'CoW Protocol slots in as your trading engine, so you don’t have to become a trading engine company.',
  audiences: [
    {
      title: 'Wallets',
      description: 'Give your users the trades they want, and get a share of the fees.',
    },
    {
      title: 'Meta-aggregators',
      description: 'What good is a meta-aggregator if it’s missing the best prices?',
    },
    {
      title: 'Lending Protocols',
      description: 'Swap, rebalance and manage positions without leaving the app.',
    },
  ],
  economics: 'No integration fee. No volume fee. Fee-share for partners. We speak your love language.',
}

export const SOLANA_FAQ = [
  {
    question: 'Does CoW Protocol replace the routing I already use?',
    answer:
      'No. Solvers can route through existing on-chain liquidity, so CoW Protocol adds a competition on top of the liquidity your users already trade against. It also looks for direct matches between traders first, which is the part nobody else is doing quite like this.',
  },
  {
    question: 'Do I need to run a solver?',
    answer:
      'No. Solvers are independent, bonded third parties. You integrate with the protocol and they do the hunting. If you’d like to run one, the docs show you how.',
  },
  {
    question: 'What does it cost to integrate?',
    answer:
      'There’s no integration fee. Partners can earn revenue from their integrations thanks to CoW Protocol’s partner fee policies.',
  },
  {
    question: 'Is it audited?',
    answer:
      'Not yet. CoW Swap on Solana is in Alpha and hasn’t been independently audited, so each order is capped at $10,000. The Solana programs are open source and rolling out in stages.',
  },
  {
    question: 'What about my users on other chains?',
    answer: 'People on EVM chains can already swap cross-chain into Solana on CoW Swap.',
  },
  {
    question: 'Is this a fling or a commitment?',
    answer:
      'Built for the long term. The protocol is open source and permissionless, so you can read the code before you commit. Long-term relationship. Short integration.',
  },
]

export const FINAL_CTA = {
  body: 'Whether you’re shipping a wallet, routing flow, or running a lending protocol, we’d like to hear what you’re building. Bring a use case; we’ll bring the solvers.',
  image: {
    src: '/images/solana/bouquet.webp',
    alt: 'A bouquet of pink roses wrapped in cow print, with a CoW-logo gift tag',
  },
}

export const ALPHA_DISCLAIMER =
  'CoW Swap on Solana is in Alpha. This deployment has not yet been independently audited and may contain bugs, vulnerabilities or unexpected behaviour that could result in failed transactions or partial or total loss of assets. Maximum trade size is $10,000 per order'
