import { Link } from '@/components/Link'
import { Color } from '@cowprotocol/ui'

import { initGtm } from '@cowprotocol/analytics'
import { CowFiCategory } from 'src/common/analytics/types'
import IMG_COWAMM_LVR from '@cowprotocol/assets/images/image-cowamm-lvr.svg'
import IMG_COWAMM_LP_1 from '@cowprotocol/assets/images/image-cowamm-lp-1.svg'
import IMG_COWAMM_LP_2 from '@cowprotocol/assets/images/image-cowamm-lp-2.svg'
import IMG_COWAMM_LP_3 from '@cowprotocol/assets/images/image-cowamm-lp-3.svg'
import IMG_COWAMM_LP_4 from '@cowprotocol/assets/images/image-cowamm-lp-4.svg'

const analytics = initGtm()

export const QUOTES = [
  {
    title: `"When LPs bleed money to LVR, users pay for it with bigger spreads. If we want DeFi to rival the CEX experience, solving LVR will be key."`,
    description: (
      <>
        <b>- Hasu</b>
        <br />
        <i>Strategy Lead at Flashbots</i>
      </>
    ),
    bgColor: Color.cowamm_green,
    textColor: Color.cowamm_dark_green,
  },
  {
    title: `"Impermanent loss is a big worry for many of our clients. If LPs could deposit liquidity into surplus-rebalancing pools and not worry about LVR, we'd deposit more funds into passive investment strategies."`,
    description: (
      <>
        <b>- Marcelo</b>
        <br />
        <i>Co-founder at Karpatkey</i>
      </>
    ),
    bgColor: Color.cowamm_green,
    textColor: Color.cowamm_dark_green,
  },
  {
    title: `"LVR is the main reason for the current concentration in the block builder market. CoW AMM is not only great for LPs, it's important for Ethereum overall."`,
    description: (
      <>
        <b>- Josojo</b>
        <br />
        <i>Crypto Researcher</i>
      </>
    ),
    bgColor: Color.cowamm_green,
    textColor: Color.cowamm_dark_green,
  },
]

export const COW_AMM_CONTENT = [
  {
    description:
      'Liquidity providers deposit tokens into protected CoW AMM liquidity pools, where traders can access the liquidity',
    bgColor: Color.cowamm_dark_green2,
    textColor: Color.cowamm_light_green,
    image: IMG_COWAMM_LP_1,
  },
  {
    description: 'Solvers bid to rebalance CoW AMM pools whenever there is an arbitrage opportunity',
    bgColor: Color.cowamm_dark_green2,
    textColor: Color.cowamm_light_green,
    image: IMG_COWAMM_LP_2,
  },
  {
    description: 'The solver that offers the most surplus to the pool wins the right to rebalance the pool',
    bgColor: Color.cowamm_dark_green2,
    textColor: Color.cowamm_light_green,
    image: IMG_COWAMM_LP_3,
  },
  {
    description: 'CoW AMM eliminates LVR by capturing arbitrage value for LPs and shielding it from MEV bots',
    bgColor: Color.cowamm_dark_green2,
    textColor: Color.cowamm_light_green,
    image: IMG_COWAMM_LP_4,
  },
]

export const LVR_CONTENT = [
  {
    description1: (
      <>
        Liquidity providers expect their tokens to earn yield, but the dirty little secret of AMMs is that most
        liquidity pools lose money. In fact, hundreds of millions of dollars of LP funds are stolen by arbitrageurs
        every year<sup>1</sup>. These losses are known as loss-versus-rebalancing (LVR). LVR is a bigger source of MEV
        than frontrunning and sandwich attacks combined
      </>
    ),
    description2:
      "Andrea Canidio and Robin Fritsch, Arbitrageurs' profits, LVR, and sandwich attacks: batch trading as an AMM design response (November 2023)",
    bgColor: 'transparent',
    image: IMG_COWAMM_LVR,
  },
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
        The most basic types of AMMs are examples of "Constant Function" AMMs. CF-AMMs use the constant product function
        "x*y=k" to calculate the prices of the two assets in any given liquidity pool. As the supply of one asset is
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
        The "Function-Maximizing" AMM is a novel AMM mechanism that tackles the shortcomings of the CF-AMM design and eliminates LVR. The FM-AMM batches trades together, executing all the orders in a batch at the same uniform clearing price. This price is such that the AMM "moves up the curve" with each trade. Since anyone can submit trades to the FM-AMM while its batch is open, competition between arbitrageurs guarantees that FM-AMM always trades at the correct, equilibrium price also in case of a rebalancing.
      `,
  },
  {
    question: 'What is CoW AMM?',
    answer: `
        CoW AMM is a production-ready implementation of an FM-AMM that supplies liquidity for trades made on CoW Protocol. Solvers compete with each other for the right to trade against the AMM. The winning solver is the one that moves the AMM curves higher.
      `,
  },
  {
    question: 'What is a CoW AMM pool ideal for?',
    answer: `
        CoW AMM pools are optimal for every token pair that is not stable-to-stable. Since volatility dictates the amount of LVR that takes place in any given liquidity pool, CoW AMM pools are most effective for volatile token pairs as LPs are protected from arbitrageurs.
      `,
  },
  {
    question: 'Who can create a CoW AMM pool (and how)?',
    answer: (
      <>
        Anyone can create a CoW AMM pool easily and permissionlessly with the{' '}
        <Link
          href="https://pool-creator.balancer.fi/cow"
          external
          utmContent="cow-amm-pool-creator"
          onClick={() =>
            analytics.sendEvent({
              category: CowFiCategory.COWAMM,
              action: 'Content link click - FAQ:Contact us',
            })
          }
        >
          CoW AMM pool creator
        </Link>
        . Engineers may also{' '}
        <Link
          href="https://docs.cow.fi/cow-amm/tutorials/cow-amm-deployer"
          external
          utmContent="cow-amm-deployer"
          onClick={() =>
            analytics.sendEvent({
              category: CowFiCategory.COWAMM,
              action: 'Content link click - FAQ:Deploy a pool',
            })
          }
        >
          follow these instructions in the CoW AMM docs
        </Link>{' '}
        to deploy pools directly.
      </>
    ),
  },
  {
    question: 'Where can I see existing CoW AMM pools?',
    answer: (
      <>
        CoW AMM pools live on Balancer can be found at{' '}
        <Link
          href="http://balancer.fi/pools/cow"
          external
          utmContent="cow-amm-balancer-pools"
          onClick={() =>
            analytics.sendEvent({
              category: CowFiCategory.COWAMM,
              action: 'Content link click - FAQ:Balancer pools',
            })
          }
        >
          balancer.fi/pools/cow
        </Link>
        . It is easy to create a new pool or enter an existing pool directly from this interface.
      </>
    ),
  },
]
