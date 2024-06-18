import { Link } from '@/components/Link'
import { GAEventCategories } from 'lib/analytics/GAEvents'
import { sendGAEventHandler } from 'lib/analytics/sendGAEvent'

import { ProductLogo, ProductVariant } from '@cowprotocol/ui'
import IMG_LOGO_SAFE from '@cowprotocol/assets/images/logo-safe.svg'
import IMG_LOGO_LIDO from '@cowprotocol/assets/images/logo-lido.svg'
import IMG_LOGO_CURVE from '@cowprotocol/assets/images/logo-curve.svg'
import IMG_LOGO_GNOSIS from '@cowprotocol/assets/images/logo-gnosis.svg'
import IMG_LOGO_BALANCER from '@cowprotocol/assets/images/logo-balancer.svg'
import IMG_LOGO_AURA from '@cowprotocol/assets/images/logo-aura.svg'
import IMG_LOGO_KARPATKEY from '@cowprotocol/assets/images/logo-karpatkey.svg'
import IMG_LOGO_SHAPESHIFT from '@cowprotocol/assets/images/logo-shapeshift.svg'
import IMG_LOGO_MAKER from '@cowprotocol/assets/images/logo-maker.svg'
import IMG_LOGO_SYNTHETIX from '@cowprotocol/assets/images/logo-synthetix.svg'
import IMG_LOGO_ARAGON from '@cowprotocol/assets/images/logo-aragon.svg'
import IMG_LOGO_PLEASER_DAO from '@cowprotocol/assets/images/logo-pleasrdao.svg'
import IMG_LOGO_POLYGON from '@cowprotocol/assets/images/logo-polygon.svg'
import IMG_LOGO_INDEX_COOP from '@cowprotocol/assets/images/logo-index.svg'
import IMG_LOGO_ALCHEMIX from '@cowprotocol/assets/images/logo-alchemix.svg'
import IMG_LOGO_STAKE_DAO from '@cowprotocol/assets/images/logo-stakedao.svg'
import IMG_LOGO_RHINO_FI from '@cowprotocol/assets/images/logo-rhino.svg'
import IMG_LOGO_TELLER_FINANCE from '@cowprotocol/assets/images/logo-teller.svg'
import IMG_LOGO_FRAX_FINANCE from '@cowprotocol/assets/images/logo-frax.svg'

export const TOP_LOGOS = [
  { src: IMG_LOGO_LIDO, alt: 'Lido', url: 'https://lido.fi/' },
  { src: IMG_LOGO_CURVE, alt: 'Curve', url: 'https://curve.fi/' },
  { src: IMG_LOGO_SAFE, alt: 'Safe', url: 'https://safe.global/' },
]

export const CASE_STUDIES = [
  {
    title: 'Aave',
    description: 'Aave DAO used CoW Swap to swap over $4 million directly into a Balancer liquidity pool',
    link: 'https://blog.cow.fi/aave-trade-breakdown-e17a7563d7ba',
    logo: <ProductLogo variant={ProductVariant.CowDao} logoIconOnly theme="dark" />,
  },
  {
    title: 'ENS',
    description: 'ENS DAO traded a whopping 10,000 ETH for USDC through CoW Swap',
    link: 'https://blog.cow.fi/ens-trade-breakdown-a8eb00ddd8c0',
    logo: <ProductLogo variant={ProductVariant.CowDao} logoIconOnly theme="dark" />,
  },
  {
    title: 'Nexus Mutual',
    description:
      'In the largest DAO trade ever, Nexus Mutual relied on CoW Swap to trade 14,400 ETH for rETH, a liquid staking token',
    link: 'https://blog.cow.fi/nexus-mutual-trade-breakdown-4aacc6a94be8',
    logo: <ProductLogo variant={ProductVariant.CowDao} logoIconOnly theme="dark" />,
  },
]

export const ALL_LOGOS = [
  { src: IMG_LOGO_GNOSIS, alt: 'Gnosis', url: 'https://www.gnosis.io/' },
  { src: IMG_LOGO_BALANCER, alt: 'Balancer', url: 'https://balancer.fi/' },
  { src: IMG_LOGO_AURA, alt: 'Aura', url: 'https://aura.finance/' },
  { src: IMG_LOGO_KARPATKEY, alt: 'Karpatkey', url: 'https://www.karpatkey.com/' },
  { src: IMG_LOGO_SHAPESHIFT, alt: 'Shapeshift', url: 'https://shapeshift.com/' },
  { src: IMG_LOGO_MAKER, alt: 'Maker', url: 'https://makerdao.com/' },
  { src: IMG_LOGO_SYNTHETIX, alt: 'Synthetix', url: 'https://synthetix.io/' },
  { src: IMG_LOGO_ARAGON, alt: 'Aragon', url: 'https://aragon.org/' },
  { src: IMG_LOGO_PLEASER_DAO, alt: 'Pleaser DAO', url: 'https://pleasr.org/' },
  { src: IMG_LOGO_POLYGON, alt: 'Polygon', url: 'https://polygon.technology/' },
  { src: IMG_LOGO_INDEX_COOP, alt: 'Index Coop', url: 'https://indexcoop.com/' },
  { src: IMG_LOGO_ALCHEMIX, alt: 'Alchemix', url: 'https://alchemix.fi/' },
  { src: IMG_LOGO_STAKE_DAO, alt: 'StakeDAO', url: 'https://stakedao.org/' },
  { src: IMG_LOGO_RHINO_FI, alt: 'RhinoFi', url: 'https://rhino.fi/' },
  { src: IMG_LOGO_TELLER_FINANCE, alt: 'Teller Finance', url: 'https://teller.finance/' },
  { src: IMG_LOGO_FRAX_FINANCE, alt: 'Frax Finance', url: 'https://frax.finance/' },
]

export const FAQ_DATA = [
  {
    question: 'What is an AMM?',
    answer: `
        An Automated Market Maker (AMM) is a type of decentralized exchange that relies on a mathematical formula to price assets instead of using an order book. It allows traders to exchange digital assets automatically by using liquidity pools rather than bid/ask order books. Users provide liquidity to these pools and earn trading fees in return, facilitating a self-sustaining trading environment.
      `,
  },
  {
    question: 'What is a liquidity pool?',
    answer: `
        A liquidity pool is a collection of reserves, or funds, that provide liquidity to a token-pair (for example, ETH-USDT). Each liquidity pool has exactly two tokens and all liquidity is evenly split so that the total liquidity value of each side of the token pair is equal at any given time.
      `,
  },
  {
    question: 'What is a liquidity provider (LP)?',
    answer: `
        A liquidity provider is an individual or entity that funds a liquidity pool with assets to facilitate trading on an AMM. By supplying assets to these pools, they enable traders to buy and sell assets without waiting for a counterparty. In return for their contribution, liquidity providers earn rewards generated from the transaction fees of the trades executed in the pool.
      `,
  },
  {
    question: 'What is an arbitrageur?',
    answer: (
      <>
        Since liquidity pools are unique to each AMM, they all trade the same assets at slightly different prices.
        Arbitrageurs are agents who are economically incentivized to trade on the price differences between various
        liquidity sources, including AMMs and traditional order book exchanges, capturing the arbitrage and profiting in
        the process.
        <br />
        <br />
        Unfortunately, the profits of arbitrageurs come at the expense of liquidity providers.
      </>
    ),
  },
  {
    question: 'What is a CF-AMM?',
    answer: (
      <>
        The most basic types of AMMs are examples of “Constant Function” AMMs. CF-AMMs use the constant product function
        “x*y=k” to calculate the prices of the two assets in any given liquidity pool. As the supply of one asset is
        depleted, its price increases and vice versa. Thus, all trades on a CF-AMM can be mapped as trades that fit on
        the constant product function.
        <br />
        <br />
        <img
          src="/images/cowamm-graph-xyz.svg"
          alt="xyz graph"
          width="100%"
          style={{ maxWidth: '52rem' }}
          loading="lazy"
        />
      </>
    ),
  },
  {
    question: 'What is loss-versus-rebalancing (LVR)?',
    answer: `
        LVR is a term for the cost that liquidity providers incur when exploited by arbitrageurs. When the price of an asset changes, arbitrageurs will rush to rebalance an AMM. The first arbitrageur reaching it will be able to trade with the AMM at an outdated price, therefore extracting profits. LVR is the main source of MEV and a major burden for the DeFi ecosystem. In fact, for the most liquid token pairs, liquidity-providing yields a net negative return after taking LVR losses into account.
      `,
  },
  {
    question: 'What is an FM-AMM?',
    answer: `
        The “Function-Maximizing” AMM is a novel AMM mechanism that tackles the shortcomings of the CF-AMM design and eliminates LVR. The FM-AMM batches trades together, executing all the orders in a batch at the same uniform clearing price. This price is such that the AMM “moves up the curve” with each trade. Since anyone can submit trades to the FM-AMM while its batch is open, competition between arbitrageurs guarantees that FM-AMM always trades at the correct, equilibrium price also in case of a rebalancing.
      `,
  },
  {
    question: 'What is CoW AMM?',
    answer: `
        CoW AMM is a production-ready implementation of an FM-AMM that supplies liquidity for trades made on CoW Protocol. Solvers compete with each other for the right to trade against the AMM. The winning solver is the one that moves the AMM curves higher.
      `,
  },
  {
    question: 'Who can create a CoW AMM pool (and how)?',
    answer: (
      <>
        Anyone can create a CoW AMM pool permissionlessly. Docs are coming soon. In the meantime, you can{' '}
        <Link
          href="https://cowprotocol.typeform.com/cow-amm-lpers"
          external
          utmContent="cow-amm-contact-us"
          onClick={() =>
            sendGAEventHandler({
              category: GAEventCategories.COWAMM,
              action: 'Content link click - FAQ:Contact us',
            })
          }
        >
          contact us
        </Link>{' '}
        for instructions.
      </>
    ),
  },
  {
    question: 'What is a CoW AMM pool ideal for?',
    answer: `
        CoW AMM pools are optimal for every token pair that is not stable-to-stable. Since volatility dictates the amount of LVR that takes place in any given liquidity pool, CoW AMM pools are most effective for volatile token pairs as LPs are protected from arbitrageurs.
      `,
  },
]
