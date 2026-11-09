import svgKaminoSrc from '@cowprotocol/assets/images/logo-kamino.svg'

export interface HeadlineLine {
  text: string
  script?: boolean
}

const script = (text: string): HeadlineLine => ({ text, script: true })
const caps = (text: string): HeadlineLine => ({ text })

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
  howItWorks: [caps('From “I want” to “done”'), script('in Three Steps')],
  trusted: [caps('good partner'), script('References available')],
  // Word joiners stop the line breaking at the hyphen
  developers: [caps('More than'), script('A One\u2060-\u2060Swap Stand')],
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
    'Get more solvers competing for every trade. More order types for your users. More ways for your app to earn. All with just one integration.',
  image: {
    src: '/images/solana/ring-box.webp',
    alt: 'A cow-print ring box holding a ring topped with the CoW logo',
  },
}

export const STATS = [
  { value: '29', caption: 'solvers competing to give every order the most surplus' },
  { value: '0 bps', caption: 'proposed volume fee on Solana for the first 12 months' },
  { value: '$1.3B', caption: 'total surplus delivered back to traders' },
]

export const WHY_REASONS = [
  {
    title: 'More solvers',
    description:
      'Bonded solvers compete for every batch. If a route falls short, the solver covers the gap. Stood up? That’s on them, not you.',
    image: { src: '/images/solana/boxing-gloves.webp', alt: 'Cow-print boxing gloves with heart patches' },
  },
  {
    title: 'More protection',
    description: 'Batch settlement is designed to take ordering games off the table. Nobody likes a third wheel.',
    image: { src: '/images/solana/safe.webp', alt: 'A pink cow-print safe with a heart-shaped dial' },
  },
  {
    title: 'More order types',
    description: 'Limit orders, TWAPs and programmatic orders, not just a swap button. Know your worth. Set a limit.',
    image: { src: '/images/solana/milk-crate.webp', alt: 'A wire crate of milk bottles, one tied with a pink bow' },
  },
  {
    title: 'More ways to earn',
    description:
      'Partners earn a share of the fees on their own users’ trades. We don’t do situationships. We do infrastructure.',
    image: { src: '/images/solana/cake.webp', alt: 'A tiered wedding cake decorated with coins' },
  },
]

export const HOW_IT_WORKS = {
  intro: 'Think of it as matchmaking, minus the awkward small talk.',
  steps: [
    {
      title: 'Say what you’re looking for',
      description: 'Your user signs an intent: sell this, get at least that. No routes, no small talk.',
      image: {
        src: '/images/solana/envelope.webp',
        alt: 'A cow-print envelope spilling metal hearts, with a letter reading “Dear Market, I’m not desperate. Call me when you meet my price. XOXO”',
      },
    },
    {
      title: 'Meet the matches',
      description:
        'Opposites attract; orders too. Orders are grouped into a batch. When two traders want opposite sides, they can be matched directly: a Coincidence of Wants. For everything else, bonded solvers compete on surplus, and whoever delivers the most wins.',
      image: {
        src: '/images/solana/chess-knights.webp',
        alt: 'Two chess knights facing each other on cow-print bases',
      },
    },
    {
      title: 'It’s a Match',
      description:
        'The winning solver settles the batch and your user gets at least what they signed for. Anything better is surplus. If a solver’s route underperforms, the solver covers the gap, not your user.',
      image: {
        src: '/images/solana/cocktails.webp',
        alt: 'Two pink cocktails on cow-print coasters, garnished with cow-head picks',
      },
    },
  ],
  closing: {
    title: 'That’s it.',
    lines: ['You build the experience; we handle the introductions.', 'It’s a CoW.'],
  },
}

export const TRUSTED = {
  lead: {
    logo: svgKaminoSrc,
    stat: { value: '$1.6B', caption: 'TVL, the largest lending protocol on Solana' },
    title: 'Kamino is integrating CoW Protocol from day one.',
    description:
      'Kamino is the largest lending protocol on Solana, with $1.6B in TVL, and it’s building CoW Protocol into its product from launch. When the biggest lender on the chain picks your engine, that’s worth a look.',
  },
  cards: [
    {
      title: 'Coinbase Wallet swaps, powered by CoW Protocol.',
      description:
        'Coinbase Wallet gives its users swaps powered by CoW Protocol, settled in batch auctions designed to protect trades from MEV. No solver network of its own to build, no interface to maintain.',
      icon: { src: '/images/solana/coinbase-wallet-icon.webp', alt: 'Coinbase Wallet' },
      link: {
        text: 'Visit Coinbase Wallet',
        href: 'https://wallet.coinbase.com/',
        action: 'sol_visit_coinbase_wallet',
      },
    },
    {
      title: 'Trusted at serious size.',
      description:
        'Aave DAO used CoW Swap to move over $4 million directly into a Balancer liquidity pool. For a treasury trade at that size, how the order settles is exactly what matters most. Size, meet care.',
      icon: { src: '/images/solana/aave-icon.webp', alt: 'Aave' },
      link: { text: 'Read the case study', href: '/learn/aave-trade-breakdown', action: 'sol_read_aave_case_study' },
    },
  ],
  closing: {
    status: 'Relationship status:',
    value: 'Integrated',
    lines: ['Yours could be next.', '(We’ll bring the cow costume.)'],
  },
}

export const DEVELOPERS = {
  intro:
    'CoW Protocol is open source and permissionless. Read the code, try the tutorials, ship something. Nobody needs to approve your pull request.',
  advanced: {
    title: 'Advanced',
    paragraphs: [
      'Build anything you can imagine. The programmatic order framework lets you create orders that execute under arbitrary conditions, in perpetuity.',
      'Write the logic once and the order keeps working long after your user has closed the tab. That’s the difference between a swap button and a product.',
    ],
  },
  trusted: {
    title: 'Trusted',
    paragraphs: [
      'Built by people who’ve been at this since 2021. CoW Protocol has been live on Ethereum for over five years.',
      'The Solana programs are open source and in Alpha. They haven’t been independently audited yet, so each order is capped at $10,000.',
    ],
  },
  doors: [
    {
      title: 'SDK',
      description:
        'Solana is a supported chain in the CoW SDK, with USDC and wrapped SOL ready to go. Quote, sign and submit orders with @cowprotocol/sdk-trading-solana, part of the same toolkit you’d use on EVM chains.',
      linkText: 'Read the SDK docs',
      linkHref: 'https://docs.cow.fi/cow-protocol/reference/sdks/cow-sdk',
      action: 'sol_read_the_sdk_docs',
      tone: 'plum',
    },
    {
      title: 'API',
      description: 'Prefer to go direct? The REST APIs cover the orderbook.',
      linkText: 'Read the API docs',
      linkHref: 'https://docs.cow.fi/cow-protocol/reference/apis/orderbook',
      action: 'sol_read_the_api_docs',
      tone: 'pink',
    },
    {
      title: 'Widget',
      description:
        'The fastest way in. Drop the CoW Swap widget into your app and offer swaps without building the interface or the solver network. Recent widget releases already include Solana support and sponsored orders.',
      linkText: 'Get the widget',
      linkHref: SOLANA_LINKS.widget,
      action: 'sol_get_the_widget',
      tone: 'blue',
    },
  ],
  learn: {
    before: 'And when you get stuck: real documentation, plus a live-coding environment at ',
    linkText: 'learn.cow.fi',
    href: 'https://learn.cow.fi',
    after: ' that runs in your browser. No setup, no stale code samples.',
  },
  buildInTheOpen: {
    title: 'Build in the open',
    body: 'The Solana programs are public on GitHub, and we’re shipping in stages. Read, poke, suggest changes, be part of where the project goes next.',
  },
} as const

export const PARTNERS = {
  intro:
    'Whatever you’re building on Solana, CoW Protocol slots in as the trading engine, so you don’t have to become a trading engine company. Think of it as giving your users a partner who shows up.',
  audiences: [
    {
      title: 'Wallets',
      description: 'Give your users what they want, and get a share of the fees, through the Partner Fee program.',
    },
    {
      title: 'Meta-aggregators',
      description:
        'Promising better prices? Now you can deliver best prices through our network of solvers that compete on surplus.',
    },
    {
      title: 'Lending Protocols',
      description:
        'Let users swap, rebalance and manage positions without leaving your app. Kamino is integrating from day one.',
    },
  ],
  economics:
    'No integration fee, fee-share for partners, and a proposed 0 bps volume fee on Solana for the first 12 months.',
  bonus:
    'One bonus for your users: People on EVM chains can already swap cross-chain into Solana on CoW Swap, so your new Solana audience doesn’t have to start from zero.',
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
      'There’s no integration fee. The Solana launch has been proposed at a 0 bps volume fee for the first 12 months, and partners can earn through the Partner Fee program.',
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

export const FINAL_CTA_BODY =
  'Whether you’re shipping a wallet, routing flow or running a lending protocol, we’d like to hear what you’re building. Bring a use case; we’ll bring the solvers.'

export const ALPHA_DISCLAIMER =
  'CoW Swap on Solana is in Alpha. This deployment has not yet been independently audited and may contain bugs, vulnerabilities or unexpected behaviour that could result in failed transactions or partial or total loss of assets. Maximum trade size is $10,000 per order'
