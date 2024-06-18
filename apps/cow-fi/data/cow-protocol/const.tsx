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
    question: 'What is CoW Protocol?',
    answer: (
      <>
        CoW Protocol is a permissionless DeFi settlement protocol leveraging{' '}
        <Link
          href="https://docs.cow.fi/cow-protocol/concepts/introduction/intents"
          external
          utmContent="cow-protocol-introduction-intents"
          onClick={() => sendGAEventHandler(GAEventCategories.COWPROTOCOL, 'click-introduction-intents')}
        >
          intents
        </Link>
        ,{' '}
        <Link
          href="https://docs.cow.fi/cow-protocol/concepts/introduction/solvers"
          external
          utmContent="cow-protocol-introduction-solvers"
          onClick={() => sendGAEventHandler(GAEventCategories.COWPROTOCOL, 'click-introduction-solvers')}
        >
          solvers
        </Link>
        ,{' '}
        <Link
          href="https://docs.cow.fi/cow-protocol/concepts/introduction/batch-auctions"
          external
          utmContent="cow-protocol-introduction-batch-auctions"
          onClick={() => sendGAEventHandler(GAEventCategories.COWPROTOCOL, 'click-introduction-batch-auctions')}
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
          onClick={() => sendGAEventHandler(GAEventCategories.COWPROTOCOL, 'click-cow-swap')}
        >
          CoW Swap
        </Link>{' '}
        and other DEX UIs. While CoW Swap is available as a trading venue for retail and institutional users, CoW
        Protocol is DeFi infrastructure that can be integrated by dApps, decentralized protocols, centralized exchange
        venues, and more. CoW Protocol also enables complex trading logic through the programmatic order framework, CoW
        Hooks, and other API-only interactions.
      </>
    ),
  },
  {
    question: 'How does CoW Protocol provide better prices for trades?',
    answer: (
      <>
        CoW Protocol’s unique architecture allows it to give users comprehensive MEV protection as well as better prices
        for their trades. While most other DEX aggregators simply compare quotes from various DEXs and execute orders
        against whichever DEX is lowest at the time of quoting, CoW Protocol seeks to find the best execution price.
        <br />
        CoW Protocol groups user orders into batches and auctions them off to bonded third parties known as{' '}
        <Link
          href="https://docs.cow.fi/cow-protocol/concepts/introduction/solvers"
          external
          utmContent="cow-protocol-introduction-solvers"
          onClick={() => sendGAEventHandler(GAEventCategories.COWPROTOCOL, 'click-introduction-solvers')}
        >
          solvers
        </Link>{' '}
        to execute. Solvers compete by sourcing liquidity from onchain AMMs, private market makers, and Coincidences of
        Wants, and the solver that gives the best prices for a given batch wins the right to settle the batch. On CoW
        Protocol, users are always safe from MEV for a number of reasons including, ultimately, that solvers take on all
        execution risk by settling the batches on their behalf. CoW Protocol is unique among DEX aggregators as it is
        built from the ground up to make trading worry-free for every type of DeFi user.
      </>
    ),
  },
  {
    question: 'How does CoW Protocol source liquidity for trades?',
    answer: (
      <>
        CoW Protocol is powered by a decentralized network of bonded third parties known as{' '}
        <Link
          href="https://docs.cow.fi/cow-protocol/concepts/introduction/solvers"
          external
          utmContent="cow-protocol-introduction-solvers"
          onClick={() => sendGAEventHandler(GAEventCategories.COWPROTOCOL, 'click-introduction-solvers')}
        >
          solvers
        </Link>{' '}
        that source liquidity to settle users trade intents. Solvers tap onchain liquidity from major AMMs &
        aggregators, use private market maker inventory, and sometimes even match trades peer-to-peer in{' '}
        <Link
          href="https://docs.cow.fi/cow-protocol/concepts/how-it-works/coincidence-of-wants"
          external
          utmContent="cow-protocol-coincidence-of-wants"
          onClick={() => sendGAEventHandler(GAEventCategories.COWPROTOCOL, 'click-coincidence-of-wants')}
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
        that traditional decentralized exchanges like Uniswap do. However, with the recent launch of CoW AMM, users can
        now deposit liquidity into the first MEV-capturing AMM. Visit the CoW AMM product page to learn how to become a
        liquidity provider via CoW AMM.
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
          onClick={() => sendGAEventHandler(GAEventCategories.COWPROTOCOL, 'click-introduction-intents')}
        >
          intent
        </Link>{' '}
        is a signed message that a user submits through their wallet which specifies an action they want to take — such
        as trading a token, minting an NFT, entering or exiting a LP position etc. These intents can then be executed by
        third parties, such as CoW Protocol’s{' '}
        <Link
          href="https://docs.cow.fi/cow-protocol/concepts/introduction/solvers"
          external
          utmContent="cow-protocol-introduction-solvers"
          onClick={() => sendGAEventHandler(GAEventCategories.COWPROTOCOL, 'click-introduction-solvers')}
        >
          solvers
        </Link>
        , who find the most optimal path of execution for the transaction and may provide additional guarantees like MEV
        protection. Intent-based trading has recently surged in popularity across DeFi. CoW Protocol is the largest
        intent-based meta DEX aggregator, with the largest{' '}
        <Link
          href="https://docs.cow.fi/cow-protocol/concepts/introduction/solvers"
          external
          utmContent="cow-protocol-introduction-solvers"
          onClick={() => sendGAEventHandler(GAEventCategories.COWPROTOCOL, 'click-introduction-solvers')}
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
          href="https://docs.cow.fi/cow-protocol/concepts/introduction/solvers"
          external
          utmContent="cow-protocol-introduction-solvers"
          onClick={() => sendGAEventHandler(GAEventCategories.COWPROTOCOL, 'click-introduction-solvers')}
        >
          Solvers
        </Link>{' '}
        are bonded third parties that bid on and execute user trades on CoW Protocol. Once a user submits a signed{' '}
        <Link
          href="https://docs.cow.fi/cow-protocol/concepts/introduction/intents"
          external
          utmContent="cow-protocol-introduction-intents"
          onClick={() => sendGAEventHandler(GAEventCategories.COWPROTOCOL, 'click-introduction-intents')}
        >
          intent to trade message
        </Link>
        , CoW Protocol groups that intent alongside other intents in a{' '}
        <Link
          href="https://docs.cow.fi/cow-protocol/concepts/introduction/batch-auctions"
          external
          utmContent="cow-protocol-introduction-batch-auctions"
          onClick={() => sendGAEventHandler(GAEventCategories.COWPROTOCOL, 'click-introduction-batch-auctions')}
        >
          batch
        </Link>
        . Solvers simulate solutions to the batch and then bid against each other in a batch auction for the right to
        execute the transactions onchain. The winner is determined based on which solver offers the most{' '}
        <Link
          href="https://docs.cow.fi/cow-protocol/concepts/benefits/price-improvement"
          external
          utmContent="cow-protocol-price-improvement"
          onClick={() => sendGAEventHandler(GAEventCategories.COWPROTOCOL, 'click-price-improvement')}
        >
          surplus
        </Link>{' '}
        for the batch. CoW Protocol currently has the largest solver network of any intents-based trading platform. This
        makes for a robust solver competition that ensures users have access to the best liquidity and best prices. CoW
        Protocol is always accepting new solvers. To learn how to deploy a solver, check out the{' '}
        <Link
          href="https://docs.cow.fi/cow-protocol/tutorials/solvers"
          external
          utmContent="cow-protocol-tutorials-solvers"
          onClick={() => sendGAEventHandler(GAEventCategories.COWPROTOCOL, 'click-tutorials-solvers')}
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
          onClick={() => sendGAEventHandler(GAEventCategories.COWPROTOCOL, 'click-introduction-intents')}
        >
          intent to trade
        </Link>{' '}
        messages which are grouped together in batches and settled onchain by{' '}
        <Link
          href="https://docs.cow.fi/cow-protocol/concepts/introduction/solvers"
          external
          utmContent="cow-protocol-introduction-solvers"
          onClick={() => sendGAEventHandler(GAEventCategories.COWPROTOCOL, 'click-introduction-solvers')}
        >
          solvers
        </Link>
        .
        <br />
        To determine which solver should settle a given batch, the protocol runs a{' '}
        <Link
          href="https://docs.cow.fi/cow-protocol/concepts/introduction/batch-auctions"
          external
          utmContent="cow-protocol-introduction-batch-auctions"
          onClick={() => sendGAEventHandler(GAEventCategories.COWPROTOCOL, 'click-introduction-batch-auctions')}
        >
          batch auction
        </Link>
        . At the end of each auction, solvers are ranked by how much surplus they provide to users. The solver that
        offers the most surplus to the batch wins the right to execute that group of orders onchain, as well as a reward
        in the form of COW tokens. Solvers settle batches in a single transaction, ensuring uniform clearing prices for
        all assets in the batch, which{' '}
        <Link
          href="https://docs.cow.fi/cow-protocol/concepts/benefits/mev-protection"
          external
          utmContent="cow-protocol-mev-protection"
          onClick={() => sendGAEventHandler(GAEventCategories.COWPROTOCOL, 'click-mev-protection')}
        >
          prevents MEV
        </Link>
        .
      </>
    ),
  },
  {
    question: 'What chains does CoW Protocol currently support?',
    answer: 'CoW Protocol is currently deployed on Ethereum, Gnosis Chain, and Arbitrum One.',
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
          onClick={() => sendGAEventHandler(GAEventCategories.COWPROTOCOL, 'click-discord')}
        >
          https://discord.gg/cowprotocol
        </Link>
      </>
    ),
  },
]
