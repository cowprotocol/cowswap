import svgAffiliateEarnSrc from '@cowprotocol/assets/images/image-affiliate-earn.svg'
import svgBatchauctionsSrc from '@cowprotocol/assets/images/image-batchauctions.svg'
import svgDocsSrc from '@cowprotocol/assets/images/image-docs.svg'
import svgFullProtectionSrc from '@cowprotocol/assets/images/image-fullprotection.svg'
import svgIntentsSrc from '@cowprotocol/assets/images/image-intents.svg'
import svgProgrammaticOrdersSrc from '@cowprotocol/assets/images/image-programmatic-orders.svg'
import svgSolversSrc from '@cowprotocol/assets/images/image-solvers.svg'
import svgSurplusSrc from '@cowprotocol/assets/images/image-surplus.svg'
import svgTwapSrc from '@cowprotocol/assets/images/image-twap.svg'
import iconAaveSrc from '@cowprotocol/assets/images/logo-aave-icon.svg'
import svgCoinbaseWalletIconSrc from '@cowprotocol/assets/images/logo-coinbase-wallet-icon.svg'
import svgCoinbaseWalletSrc from '@cowprotocol/assets/images/logo-coinbase-wallet.svg'
import svgKaminoIconSrc from '@cowprotocol/assets/images/logo-kamino-icon.svg'
import svgKaminoSrc from '@cowprotocol/assets/images/logo-kamino.svg'
import { Color } from '@cowprotocol/ui'

export const SOLANA_LINKS = {
  getInTouch: 'mailto:hello@cow.fi?subject=Building%20with%20CoW%20Protocol%20on%20Solana',
  startBuilding: 'https://docs.cow.fi/category/tutorials',
  docs: 'https://docs.cow.fi/',
  github: 'https://github.com/cowprotocol/',
  discord: 'https://discord.com/invite/cowprotocol',
  widget: '/widget',
  tradeOnSolana: 'https://swap.cow.fi/#/1000000001/swap',
} as const

const LAUNCH_HEADLINES = {
  hero: 'Solana, let’s get serious.',
  why: 'Four reasons more is more.',
  howItWorks: 'From “I want” to “done” in three steps.',
  trusted: 'Good partner. References available.',
  developers: 'More than a one-swap stand.',
  partners: 'Your users want better trades. You want a better business.',
  faq: 'FAQ',
  finalCta: 'Ready to make it official?',
}

export const EVERGREEN_HEADLINES: typeof LAUNCH_HEADLINES = {
  hero: 'Say what you want. Let solvers compete for it.',
  why: 'Why build on CoW Protocol',
  howItWorks: 'How it works',
  trusted: 'Who’s building with us',
  developers: 'Open source. Open door.',
  partners: 'Built for wallets, aggregators and lenders',
  faq: 'Frequently asked questions',
  finalCta: 'Start building',
}

/** Launch-campaign headlines; switch to `EVERGREEN_HEADLINES` once the campaign is over. */
export const ACTIVE_HEADLINES = LAUNCH_HEADLINES

export const HERO = {
  subhead:
    'Get more solvers competing for every trade. More order types for your users. More ways for your app to earn. All with just one integration.',
}

/** Flip to `true` at launch; the match card shows “It’s complicated.” until then. */
export const IS_LAUNCHED = false

export const MATCH_CARD = {
  title: 'It’s a match.',
  subtitle: 'CoW Protocol + Solana builders',
  status: IS_LAUNCHED ? 'Integrated.' : 'It’s complicated.',
  lookingFor: 'Builders who want more for their users.',
  turnOns: ['Intents', 'Batch auctions', 'Limit orders', 'Good documentation'],
  dealbreakers: ['Third wheels', 'Getting stood up', 'Closed doors'],
  mutualFriends: [
    { name: 'Kamino', logo: svgKaminoIconSrc },
    { name: 'Coinbase Wallet', logo: svgCoinbaseWalletIconSrc },
    { name: 'Aave', logo: iconAaveSrc },
  ],
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
    bgColor: Color.cowfi_purple2,
    textColor: Color.cowfi_purple1,
    titleColor: Color.cowfi_purple_dark,
    imageSrc: svgSurplusSrc,
  },
  {
    title: 'More protection',
    description: 'Batch settlement is designed to take ordering games off the table. Nobody likes a third wheel.',
    bgColor: Color.cowfi_purple_dark,
    textColor: Color.cowfi_purple_bright,
    titleColor: Color.neutral98,
    imageSrc: svgFullProtectionSrc,
  },
  {
    title: 'More order types',
    description: 'Limit orders, TWAPs and programmatic orders, not just a swap button. Know your worth. Set a limit.',
    bgColor: Color.cowfi_purple3,
    textColor: Color.cowfi_purple_bright,
    titleColor: Color.neutral98,
    imageSrc: svgTwapSrc,
  },
  {
    title: 'More ways to earn',
    description:
      'Partners earn a share of the fees on their own users’ trades. We don’t do situationships. We do infrastructure.',
    bgColor: Color.cowfi_purple_bright,
    textColor: Color.cowfi_purple3,
    titleColor: Color.cowfi_purple_dark,
    imageSrc: svgAffiliateEarnSrc,
  },
]

export const HOW_IT_WORKS = {
  intro: 'Think of it as matchmaking, minus the awkward small talk.',
  steps: [
    {
      title: 'Say what you’re looking for',
      description: 'Your user signs an intent: sell this, get at least that. No routes, no small talk.',
      imageSrc: svgIntentsSrc,
      linkHref: 'https://docs.cow.fi/cow-protocol/reference/core/intents',
    },
    {
      title: 'Meet the matches',
      description:
        'Opposites attract; orders too. Orders are grouped into a batch. When two traders want opposite sides, they can be matched directly: a Coincidence of Wants. For everything else, bonded solvers compete on surplus, and whoever delivers the most wins.',
      imageSrc: svgSolversSrc,
      linkHref: 'https://docs.cow.fi/cow-protocol/concepts/how-it-works/coincidence-of-wants',
    },
    {
      title: 'It’s a CoW',
      description:
        'The winning solver settles the batch and your user gets at least what they signed for. Anything better is surplus. If a solver’s route underperforms, the solver covers the gap, not your user.',
      imageSrc: svgBatchauctionsSrc,
      linkHref: '/learn/understanding-batch-auctions',
    },
  ],
  closing: 'That’s it. You build the experience; we handle the introductions. It’s a CoW.',
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
      logo: svgCoinbaseWalletSrc,
      link: { text: 'Visit Coinbase Wallet', href: 'https://wallet.coinbase.com/', action: 'visit-coinbase-wallet' },
    },
    {
      title: 'Trusted at serious size.',
      description:
        'Aave DAO used CoW Swap to move over $4 million directly into a Balancer liquidity pool. For a treasury trade at that size, how the order settles is exactly what matters most. Size, meet care.',
      logo: iconAaveSrc,
      link: { text: 'Read the case study', href: '/learn/aave-trade-breakdown', action: 'read-aave-case-study' },
    },
  ],
  closing: 'Relationship status: Integrated. Yours could be next. (We’ll bring the cow costume.)',
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
    imageSrc: svgProgrammaticOrdersSrc,
  },
  doorsIntro: 'Looking for the easy way in? Pick your door.',
  doors: [
    {
      title: 'SDK',
      description:
        'Solana is a supported chain in the CoW SDK, with USDC and wrapped SOL ready to go. Quote, sign and submit orders with the same toolkit you’d use on EVM chains.',
      linkText: 'Read the SDK docs',
      linkHref: 'https://docs.cow.fi/cow-protocol/reference/sdks/cow-sdk',
    },
    {
      title: 'API',
      description: 'Prefer to go direct? The REST APIs cover the orderbook.',
      linkText: 'Read the API docs',
      linkHref: 'https://docs.cow.fi/cow-protocol/reference/apis/orderbook',
    },
    {
      title: 'Widget',
      description:
        'The fastest way in. Drop the CoW Swap widget into your app and offer swaps without building the interface or the solver network. Recent widget releases already include Solana support and sponsored orders.',
      linkText: 'Get the widget',
      linkHref: '/widget',
    },
  ],
  learn: {
    before: 'And when you get stuck: real documentation, plus a live-coding environment at ',
    linkText: 'learn.cow.fi',
    href: 'https://learn.cow.fi',
    after: ' that runs in your browser. No setup, no stale code samples.',
  },
  trusted: {
    title: 'Trusted',
    paragraphs: [
      'Built by people who’ve been at this since 2021. CoW Protocol has been live on Ethereum for over five years.',
      'The Solana programs are audited by [auditor name], and the report is public: [link].',
    ],
    imageSrc: svgDocsSrc,
  },
  buildInTheOpen:
    'The Solana programs are public on GitHub, and we’re shipping in stages. Read, poke, suggest changes, be part of where the project goes next.',
}

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
      title: 'Lending protocols',
      description:
        'Let users swap, rebalance and manage positions without leaving your app. Kamino is integrating from day one.',
    },
  ],
  economics:
    'No integration fee, fee-share for partners, and a proposed 0 bps volume fee on Solana for the first 12 months.',
  bonus:
    'People on EVM chains can already swap cross-chain into Solana on CoW Swap, so your new Solana audience doesn’t have to start from zero.',
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
    answer: 'The Solana programs are open source and rolling out in stages.',
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
  signOff: 'It’s a CoW. Let’s get serious.',
  body: 'Whether you’re shipping a wallet, routing flow or running a lending protocol, we’d like to hear what you’re building. Bring a use case; we’ll bring the solvers.',
}

export const ALPHA_DISCLAIMER =
  'CoW Swap on Solana is in Alpha. This deployment has not yet been independently audited and may contain bugs, vulnerabilities or unexpected behaviour that could result in failed transactions or partial or total loss of assets. Maximum trade size is $10,000 per order'
