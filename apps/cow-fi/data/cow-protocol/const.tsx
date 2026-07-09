import { ReactNode } from 'react'

import { useCowAnalytics } from '@cowprotocol/analytics'
import svgDocsSrc from '@cowprotocol/assets/images/image-docs.svg'
import svgGrantColorSrc from '@cowprotocol/assets/images/image-grant-color.svg'
import svgHooksSrc from '@cowprotocol/assets/images/image-hooks.svg'
import svgMilkmanSrc from '@cowprotocol/assets/images/image-milkman.svg'
import svgProgrammaticOrdersSrc from '@cowprotocol/assets/images/image-programmatic-orders.svg'
import svgSmartordersSrc from '@cowprotocol/assets/images/image-smartorders.svg'
import svgSurplusSrc from '@cowprotocol/assets/images/image-surplus.svg'
import svgTwapSrc from '@cowprotocol/assets/images/image-twap.svg'
import svgWidgetSrc from '@cowprotocol/assets/images/image-widget.svg'
import iconAaveSrc from '@cowprotocol/assets/images/logo-aave-icon.svg'
import svgAlchemixSrc from '@cowprotocol/assets/images/logo-alchemix.svg'
import svgAragonSrc from '@cowprotocol/assets/images/logo-aragon.svg'
import svgAuraSrc from '@cowprotocol/assets/images/logo-aura.svg'
import svgBalancerSrc from '@cowprotocol/assets/images/logo-balancer.svg'
import svgCurveTextSrc from '@cowprotocol/assets/images/logo-curve-text.svg'
import iconEnsSrc from '@cowprotocol/assets/images/logo-ens-icon.svg'
import svgFraxSrc from '@cowprotocol/assets/images/logo-frax.svg'
import svgGnosisSrc from '@cowprotocol/assets/images/logo-gnosis.svg'
import svgIndexSrc from '@cowprotocol/assets/images/logo-index.svg'
import svgKarpatkeySrc from '@cowprotocol/assets/images/logo-karpatkey.svg'
import svgLidoSrc from '@cowprotocol/assets/images/logo-lido.svg'
import svgMakerSrc from '@cowprotocol/assets/images/logo-maker.svg'
import iconNexusSrc from '@cowprotocol/assets/images/logo-nexus-icon.svg'
import svgPleasrdaoSrc from '@cowprotocol/assets/images/logo-pleasrdao.svg'
import svgPolygonSrc from '@cowprotocol/assets/images/logo-polygon.svg'
import svgRhinoSrc from '@cowprotocol/assets/images/logo-rhino.svg'
import svgSafeSrc from '@cowprotocol/assets/images/logo-safe.svg'
import svgShapeshiftSrc from '@cowprotocol/assets/images/logo-shapeshift.svg'
import svgStakedaoSrc from '@cowprotocol/assets/images/logo-stakedao.svg'
import svgSynthetixSrc from '@cowprotocol/assets/images/logo-synthetix.svg'
import svgTellerSrc from '@cowprotocol/assets/images/logo-teller.svg'
import { getAvailableChainsText } from '@cowprotocol/common-const'
import { Color } from '@cowprotocol/ui'

import { CowFiCategory, toCowFiGtmEvent } from 'src/common/analytics/types'

import { Link } from '@/components/Link'

export interface FaqItem {
  question: string
  answer: ReactNode
}

// eslint-disable-next-line max-lines-per-function
export function useFaqData(): FaqItem[] {
  // eslint-disable-next-line unused-imports/no-unused-vars
  const analytics = useCowAnalytics()

  return [
    {
      question: 'What is CoW Protocol?',
      answer: (
        <>
          CoW Protocol is a permissionless DeFi settlement protocol leveraging{' '}
          <Link
            href="https://docs.cow.fi/cow-protocol/concepts/introduction/intents"
            external
            utmContent="cow-protocol-introduction-intents"
            data-click-event={toCowFiGtmEvent({
              category: CowFiCategory.COWPROTOCOL,
              action: 'Click Introduction',
              label: 'intents',
            })}
          >
            intents
          </Link>
          ,{' '}
          <Link
            href="https://docs.cow.fi/category/solver"
            external
            utmContent="cow-protocol-introduction-solvers"
            data-click-event={toCowFiGtmEvent({
              category: CowFiCategory.COWPROTOCOL,
              action: 'Click Introduction',
              label: 'solvers',
            })}
          >
            solvers
          </Link>
          ,{' '}
          <Link
            href="https://docs.cow.fi/cow-protocol/concepts/introduction/fair-combinatorial-auction"
            external
            utmContent="cow-protocol-introduction-batch-auctions"
            data-click-event={toCowFiGtmEvent({
              category: CowFiCategory.COWPROTOCOL,
              action: 'Click Introduction',
              label: 'batch-auctions',
            })}
          >
            batch auctions
          </Link>{' '}
          to find the best prices for user trades and protect orders from MEV.
        </>
      ),
    },
    {
      question: 'How is CoW Protocol different from CoW Swap?',
      answer: (
        <>
          CoW Protocol is the decentralized, permissionless DeFi protocol that powers{' '}
          <Link
            href="https://swap.cow.fi/"
            external
            utmContent="cow-protocol-cow-swap"
            data-click-event={toCowFiGtmEvent({
              category: CowFiCategory.COWPROTOCOL,
              action: 'Click Link',
              label: 'cow-swap',
            })}
          >
            CoW Swap
          </Link>{' '}
          and other DEX UIs. While CoW Swap is available as a trading venue for retail and institutional users, CoW
          Protocol is DeFi infrastructure that can be integrated by dApps, decentralized protocols, centralized exchange
          venues, and more. CoW Protocol also enables complex trading logic through the programmatic order framework,
          CoW Hooks, and other API-only interactions.
        </>
      ),
    },
    {
      question: 'How does CoW Protocol provide better prices for trades?',
      answer: (
        <>
          CoW Protocol&#39;s unique architecture allows it to give users comprehensive MEV protection as well as better
          prices for their trades. While most other DEX aggregators simply compare quotes from various DEXs and execute
          orders against whichever DEX is lowest at the time of quoting, CoW Protocol seeks to find the best execution
          price.
          <br />
          CoW Protocol groups user orders into batches and auctions them off to bonded third parties known as{' '}
          <Link
            href="https://docs.cow.fi/category/solver"
            external
            utmContent="cow-protocol-introduction-solvers"
            data-click-event={toCowFiGtmEvent({
              category: CowFiCategory.COWPROTOCOL,
              action: 'Click Introduction',
              label: 'solvers',
            })}
          >
            solvers
          </Link>{' '}
          to execute. Solvers compete by sourcing liquidity from onchain AMMs, private market makers, and Coincidences
          of Wants, and the solver that gives the best prices for a given batch wins the right to settle the batch. On
          CoW Protocol, users are always safe from MEV for a number of reasons including, ultimately, that solvers take
          on all execution risk by settling the batches on their behalf. CoW Protocol is unique among DEX aggregators as
          it is built from the ground up to make trading worry-free for every type of DeFi user.
        </>
      ),
    },
    {
      question: 'How does CoW Protocol source liquidity for trades?',
      answer: (
        <>
          CoW Protocol is powered by a decentralized network of bonded third parties known as{' '}
          <Link
            href="https://docs.cow.fi/category/solver"
            external
            utmContent="cow-protocol-introduction-solvers"
            data-click-event={toCowFiGtmEvent({
              category: CowFiCategory.COWPROTOCOL,
              action: 'Click Introduction',
              label: 'solvers',
            })}
          >
            solvers
          </Link>{' '}
          that source liquidity to settle users trade intents. Solvers tap onchain liquidity from major AMMs &
          aggregators, use private market maker inventory, and sometimes even match trades peer-to-peer in{' '}
          <Link
            href="https://docs.cow.fi/cow-protocol/concepts/how-it-works/coincidence-of-wants"
            external
            utmContent="cow-protocol-coincidence-of-wants"
            data-click-event={toCowFiGtmEvent({
              category: CowFiCategory.COWPROTOCOL,
              action: 'Click Concept',
              label: 'coincidence-of-wants',
            })}
          >
            Coincidences of Wants
          </Link>{' '}
          (CoWs). Solver are also the only parties able to access liquidity from CoW AMM, the recently launched
          MEV-capturing AMM from CoW DAO.
        </>
      ),
    },
    {
      question: 'How can I become a liquidity provider?',
      answer: (
        <>
          CoW Protocol is a meta DEX aggregator, so it does not maintain liquidity pools for all of its tokens the way
          that traditional decentralized exchanges like Uniswap do. However, with the recent launch of CoW AMM, users
          can now deposit liquidity into the first MEV-capturing AMM. Visit the CoW AMM product page to learn how to
          become a liquidity provider via CoW AMM.
        </>
      ),
    },
    {
      question: 'What are intents?',
      answer: (
        <>
          An{' '}
          <Link
            href="https://docs.cow.fi/cow-protocol/concepts/introduction/intents"
            external
            utmContent="cow-protocol-introduction-intents"
            data-click-event={toCowFiGtmEvent({
              category: CowFiCategory.COWPROTOCOL,
              action: 'Click Introduction',
              label: 'intents',
            })}
          >
            intent
          </Link>{' '}
          is a signed message that a user submits through their wallet which specifies an action they want to take —
          such as trading a token, minting an NFT, entering or exiting a LP position etc. These intents can then be
          executed by third parties, such as CoW Protocol&#39;s{' '}
          <Link
            href="https://docs.cow.fi/category/solver"
            external
            utmContent="cow-protocol-introduction-solvers"
            data-click-event={toCowFiGtmEvent({
              category: CowFiCategory.COWPROTOCOL,
              action: 'Click Introduction',
              label: 'solvers',
            })}
          >
            solvers
          </Link>
          , who find the most optimal path of execution for the transaction and may provide additional guarantees like
          MEV protection. Intent-based trading has recently surged in popularity across DeFi. CoW Protocol is the
          largest intent-based meta DEX aggregator, with the largest{' '}
          <Link
            href="https://docs.cow.fi/category/solver"
            external
            utmContent="cow-protocol-introduction-solvers"
            data-click-event={toCowFiGtmEvent({
              category: CowFiCategory.COWPROTOCOL,
              action: 'Click Introduction',
              label: 'solvers',
            })}
          >
            solver
          </Link>{' '}
          competition in DeFi.
        </>
      ),
    },
    {
      question: 'What are solvers?',
      answer: (
        <>
          <Link
            href="https://docs.cow.fi/category/solver"
            external
            utmContent="cow-protocol-introduction-solvers"
            data-click-event={toCowFiGtmEvent({
              category: CowFiCategory.COWPROTOCOL,
              action: 'Click Introduction',
              label: 'solvers',
            })}
          >
            Solvers
          </Link>{' '}
          are bonded third parties that bid on and execute user trades on CoW Protocol. Once a user submits a signed{' '}
          <Link
            href="https://docs.cow.fi/cow-protocol/concepts/introduction/intents"
            external
            utmContent="cow-protocol-introduction-intents"
            data-click-event={toCowFiGtmEvent({
              category: CowFiCategory.COWPROTOCOL,
              action: 'Click Introduction',
              label: 'intents',
            })}
          >
            intent to trade message
          </Link>
          , CoW Protocol groups that intent alongside other intents in a{' '}
          <Link
            href="https://docs.cow.fi/cow-protocol/concepts/introduction/fair-combinatorial-auction"
            external
            utmContent="cow-protocol-introduction-batch-auctions"
            data-click-event={toCowFiGtmEvent({
              category: CowFiCategory.COWPROTOCOL,
              action: 'Click Introduction',
              label: 'batch-auctions',
            })}
          >
            batch
          </Link>
          . Solvers simulate solutions to the batch and then bid against each other in a batch auction for the right to
          execute the transactions onchain. The winner is determined based on which solver offers the most{' '}
          <Link
            href="https://docs.cow.fi/cow-protocol/concepts/benefits/price-improvement"
            external
            utmContent="cow-protocol-price-improvement"
            data-click-event={toCowFiGtmEvent({
              category: CowFiCategory.COWPROTOCOL,
              action: 'Click Introduction',
              label: 'price-improvement',
            })}
          >
            surplus
          </Link>{' '}
          for the batch. CoW Protocol currently has the largest solver network of any intents-based trading platform.
          This makes for a robust solver competition that ensures users have access to the best liquidity and best
          prices. CoW Protocol is always accepting new solvers. To learn how to deploy a solver, check out the{' '}
          <Link
            href="https://docs.cow.fi/category/solver"
            external
            utmContent="cow-protocol-tutorials-solvers"
            data-click-event={toCowFiGtmEvent({
              category: CowFiCategory.COWPROTOCOL,
              action: 'Click Link',
              label: 'tutorials-solvers',
            })}
          >
            CoW Protocol documentation
          </Link>
          .
        </>
      ),
    },
    {
      question: 'What are batch auctions?',
      answer: (
        <>
          On CoW Protocol, users submit signed{' '}
          <Link
            href="https://docs.cow.fi/cow-protocol/concepts/introduction/intents"
            external
            utmContent="cow-protocol-introduction-intents"
            data-click-event={toCowFiGtmEvent({
              category: CowFiCategory.COWPROTOCOL,
              action: 'Click Introduction',
              label: 'intents',
            })}
          >
            intent to trade
          </Link>{' '}
          messages which are grouped together in batches and settled onchain by{' '}
          <Link
            href="https://docs.cow.fi/category/solver"
            external
            utmContent="cow-protocol-introduction-solvers"
            data-click-event={toCowFiGtmEvent({
              category: CowFiCategory.COWPROTOCOL,
              action: 'Click Introduction',
              label: 'solvers',
            })}
          >
            solvers
          </Link>
          .
          <br />
          To determine which solver should settle a given batch, the protocol runs a{' '}
          <Link
            href="https://docs.cow.fi/cow-protocol/concepts/introduction/fair-combinatorial-auction"
            external
            utmContent="cow-protocol-introduction-batch-auctions"
            data-click-event={toCowFiGtmEvent({
              category: CowFiCategory.COWPROTOCOL,
              action: 'Click Introduction',
              label: 'batch-auctions',
            })}
          >
            batch auction
          </Link>
          . At the end of each auction, solvers are ranked by how much surplus they provide to users. The solver that
          offers the most surplus to the batch wins the right to execute that group of orders onchain, as well as a
          reward in the form of COW tokens. Solvers settle batches in a single transaction, ensuring uniform clearing
          prices for all assets in the batch, which{' '}
          <Link
            href="https://docs.cow.fi/cow-protocol/concepts/benefits/mev-protection"
            external
            utmContent="cow-protocol-mev-protection"
            data-click-event={toCowFiGtmEvent({
              category: CowFiCategory.COWPROTOCOL,
              action: 'Click Introduction',
              label: 'mev-protection',
            })}
          >
            prevents MEV
          </Link>
          .
        </>
      ),
    },
    {
      question: 'What chains does CoW Protocol currently support?',
      answer: 'CoW Protocol is currently deployed on: ' + getAvailableChainsText() + '.',
    },
    {
      question: 'How do I get support?',
      answer: (
        <>
          While CoW Protocol is a decentralized project, community members and contributors are available to help and
          answer questions. To request support or to ask a question, please ping a community member in the CoW DAO
          Discord.
          <br />
          <br />
          CoW DAO Discord:{' '}
          <Link
            href="https://discord.gg/cowprotocol"
            external
            utmContent="cow-discord"
            data-click-event={toCowFiGtmEvent({
              category: CowFiCategory.COWPROTOCOL,
              action: 'Click Link',
              label: 'discord',
            })}
          >
            https://discord.gg/cowprotocol
          </Link>
        </>
      ),
    },
  ]
}

export const ADVANCED_ORDER_TYPES = [
  {
    title: 'Limit orders',
    description:
      'Placing a limit order is like setting a trap for a price for your trade. CoW Swap is the only DEX that offers surplus on limit orders - and one of the only DEXs that offers limit orders at all',
    bgColor: Color.cowfi_purple1,
    textColor: Color.cowfi_purple2,
    titleColor: Color.neutral98,
    imageSrc: svgSurplusSrc,
  },
  {
    title: 'TWAP orders',
    description:
      'Time-weighted average price (TWAP) orders minimize price impact and volatility risk by letting you trade assets at fixed intervals over a period of time',
    bgColor: Color.cowfi_purple_bright,
    textColor: Color.cowfi_purple1,
    titleColor: Color.cowfi_purple_dark,
    imageSrc: svgTwapSrc,
  },
  {
    title: 'Milkman orders',
    description:
      "Created with our friends at Yearn.fi, Milkman orders let you prep a trade today to be executed in the future - with the help of a price oracle so you don't get rekt",
    bgColor: Color.cowfi_purple_dark,
    textColor: Color.cowfi_purple_bright,
    titleColor: Color.neutral98,
    imageSrc: svgMilkmanSrc,
  },
]

export const UNIQUE_TRADING_LOGIC = [
  {
    title: 'Smart orders',
    description: 'ERC-1271 smart orders let you custom code any trading logic into your smart contract',
    bgColor: Color.cowfi_purple2,
    textColor: Color.cowfi_purple1,
    titleColor: Color.cowfi_purple_dark,
    imageSrc: svgSmartordersSrc,
  },
  {
    title: 'Programmatic orders',
    description: 'Easily deploy conditional orders that trigger when specified on-chain conditions are met',
    bgColor: Color.cowfi_purple_dark,
    textColor: Color.cowfi_purple_bright,
    titleColor: Color.neutral98,
    imageSrc: svgProgrammaticOrdersSrc,
  },
  {
    title: 'Hooks',
    description:
      'Add pre- and post- hooks to tie your trade to any other DeFi activity (bridging, staking, depositing, etc.)',
    bgColor: Color.cowfi_purple3,
    textColor: Color.cowfi_purple_bright,
    titleColor: Color.neutral98,
    imageSrc: svgHooksSrc,
  },
]

export const TOP_LOGOS = [
  { src: svgLidoSrc, alt: 'Lido', url: 'https://lido.fi/' },
  { src: svgCurveTextSrc, alt: 'Curve', url: 'https://curve.finance/' },
  { src: svgSafeSrc, alt: 'Safe', url: 'https://safe.global/' },
]

export const CASE_STUDIES = [
  {
    title: 'Aave',
    description: 'Aave DAO used CoW Swap to swap over $4 million directly into a Balancer liquidity pool',
    link: '/learn/aave-trade-breakdown',
    logo: iconAaveSrc,
  },
  {
    title: 'ENS',
    description: 'ENS DAO traded a whopping 10,000 ETH for USDC through CoW Swap',
    link: '/learn/ens-trade-breakdown',
    logo: iconEnsSrc,
  },
  {
    title: 'Nexus Mutual',
    description:
      'In the largest DAO trade ever, Nexus Mutual relied on CoW Swap to trade 14,400 ETH for rETH, a liquid staking token',
    link: '/learn/nexus-mutual-trade-breakdown',
    logo: iconNexusSrc,
  },
]

export const ALL_LOGOS = [
  { src: svgGnosisSrc, alt: 'Gnosis', url: 'https://www.gnosis.io/' },
  { src: svgBalancerSrc, alt: 'Balancer', url: 'https://balancer.fi/' },
  { src: svgAuraSrc, alt: 'Aura', url: 'https://aura.finance/' },
  { src: svgKarpatkeySrc, alt: 'Karpatkey', url: 'https://www.karpatkey.com/' },
  { src: svgShapeshiftSrc, alt: 'Shapeshift', url: 'https://shapeshift.com/' },
  { src: svgMakerSrc, alt: 'Maker', url: 'https://makerdao.com/' },
  { src: svgSynthetixSrc, alt: 'Synthetix', url: 'https://synthetix.io/' },
  { src: svgAragonSrc, alt: 'Aragon', url: 'https://aragon.org/' },
  { src: svgPleasrdaoSrc, alt: 'Pleaser DAO', url: 'https://pleasr.org/' },
  { src: svgPolygonSrc, alt: 'Polygon', url: 'https://polygon.technology/' },
  { src: svgIndexSrc, alt: 'Index Coop', url: 'https://indexcoop.com/' },
  { src: svgAlchemixSrc, alt: 'Alchemix', url: 'https://alchemix.fi/' },
  { src: svgStakedaoSrc, alt: 'StakeDAO', url: 'https://stakedao.org/' },
  { src: svgRhinoSrc, alt: 'RhinoFi', url: 'https://rhino.fi/' },
  { src: svgTellerSrc, alt: 'Teller Finance', url: 'https://teller.finance/' },
  { src: svgFraxSrc, alt: 'Frax Finance', url: 'https://frax.finance/' },
]

export const COW_PROTOCOL_SECTIONS = [
  {
    title: 'For developers',
    description:
      'CoW Protocol is open-source and permissionless. Thanks to comprehensive documentation and live coding tutorials, integrating the protocol is easy',
    bgColor: Color.cowfi_purple3,
    textColor: Color.cowfi_purple_bright,
    titleColor: Color.neutral98,
    linkHref: 'https://docs.cow.fi/',
    linkText: 'Read the docs',
    linkEvent: 'click-docs',
    linkUtmContent: 'cow-protocol-docs',
    imageSrc: svgDocsSrc,
  },
  {
    title: 'For DeFi projects',
    description:
      "Don't need overly custom trading logic? The CoW Swap widget is the easiest way to integrate swaps, TWAPs, and limit orders directly into your project site",
    bgColor: Color.cowfi_purple_dark,
    textColor: Color.cowfi_purple_bright,
    titleColor: Color.neutral98,
    linkHref: '/widget',
    linkText: 'Integrate the widget',
    linkEvent: 'click-integrate-widget',
    imageSrc: svgWidgetSrc,
  },
  {
    title: 'For anyone',
    description:
      'The CoW DAO Grants program has awarded over $100,000 in grants to innovators that build public DeFi applications with CoW Protocol',
    bgColor: Color.cowfi_purple_bright,
    textColor: Color.cowfi_purple3,
    titleColor: Color.cowfi_purple_dark,
    linkHref: 'https://docs.cow.fi/',
    linkText: 'Apply for a grant',
    linkEvent: 'click-apply-for-a-grant',
    linkUtmContent: 'cow-protocol-grants',
    imageSrc: svgGrantColorSrc,
  },
]
