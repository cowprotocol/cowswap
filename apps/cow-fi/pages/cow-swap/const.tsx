import { Link } from '@/components/Link'
import { GAEventCategories } from 'lib/analytics/GAEvents'
import { sendGAEventHandler } from 'lib/analytics/sendGAEvent'

export const FAQ_DATA = [
  {
    question: 'What is CoW Swap?',
    answer: (
      <>
        CoW Swap is a meta DEX aggregator that uses{' '}
        <Link
          href="https://docs.cow.fi/cow-protocol/concepts/introduction/intents"
          external
          utmContent="cow-protocol-introduction-intents"
          onClick={() => sendGAEventHandler(GAEventCategories.COWSWAP, 'click-introduction-intents')}
        >
          intents
        </Link>{' '}
        and{' '}
        <Link
          href="https://docs.cow.fi/cow-protocol/concepts/introduction/batch-auctions"
          external
          utmContent="cow-protocol-introduction-batch-auctions"
          onClick={() => sendGAEventHandler(GAEventCategories.COWSWAP, 'click-introduction-batch-auctions')}
        >
          batch auctions{' '}
        </Link>
        to provide users with the best prices for their trades while protecting them from maximal extractable value
        (MEV). It is the first UI built on top of CoW Protocol. As the leading intents-based DEX, CoW Swap leverages a
        network of bonded third parties known as{' '}
        <Link
          href="https://docs.cow.fi/cow-protocol/concepts/introduction/solvers"
          external
          utmContent="cow-protocol-introduction-solvers"
          onClick={() => sendGAEventHandler(GAEventCategories.COWSWAP, 'click-introduction-solvers')}
        >
          solvers
        </Link>{' '}
        to settle trades on behalf of users. When a user submits a{' '}
        <Link
          href="https://docs.cow.fi/cow-protocol/concepts/introduction/intents"
          external
          utmContent="cow-protocol-introduction-intents"
          onClick={() => sendGAEventHandler(GAEventCategories.COWSWAP, 'click-introduction-intents')}
        >
          trade intent
        </Link>{' '}
        , solvers source liquidity from AMMs, private market makers, and through peer-to-peer matches known as{' '}
        <Link
          href="https://docs.cow.fi/cow-protocol/concepts/how-it-works/coincidence-of-wants"
          external
          utmContent="cow-protocol-coincidence-of-wants"
          onClick={() => sendGAEventHandler(GAEventCategories.COWSWAP, 'click-coincidence-of-wants')}
        >
          Coincidences of Wants
        </Link>{' '}
        (CoWs) to settle the order. CoW Swap is the leader among intent-based trading protocols by transaction volume
        and currently operates on Ethereum, Arbitrum One, and Gnosis Chain.
      </>
    ),
  },
  {
    question: 'What is a “meta” DEX aggregator?',
    answer: (
      <>
        A “meta” DEX aggregator is an aggregator of aggregators, meaning that it’s a single trading venue that sources
        liquidity from other aggregators as well as from individual DEXs. CoW Swap is a meta DEX aggregator because
        solvers source liquidity for users from AMMs like Uniswap, DEX aggregators like 1inch, private market makers,
        and directly from users via Coincidence of Wants.
      </>
    ),
  },
  {
    question: 'What is a “CoW”?',
    answer: (
      <>
        “CoW” stands for{' '}
        <Link
          href="https://docs.cow.fi/cow-protocol/concepts/how-it-works/coincidence-of-wants"
          external
          utmContent="cow-protocol-coincidence-of-wants"
          onClick={() => sendGAEventHandler(GAEventCategories.COWSWAP, 'click-coincidence-of-wants')}
        >
          Coincidence of Wants
        </Link>
        . Coincidence of Wants is an economic phenomenon where two trading parties — each holding the asset the other
        needs — exchange those assets directly in an equivalent barter. For example, if one user is selling ETH to buy
        USDC, and another user is selling USDC to buy ETH, the two users can simply swap their assets in a Coincidence
        of Wants. Thanks to CoW Swap's{' '}
        <Link
          href="https://docs.cow.fi/cow-protocol/concepts/introduction/batch-auctions"
          external
          utmContent="cow-protocol-introduction-batch-auctions"
          onClick={() => sendGAEventHandler(GAEventCategories.COWSWAP, 'click-introduction-batch-auctions')}
        >
          batching mechanism
        </Link>
        , users can make peer-to-peer swaps in cases where they're trading the same assets. CoWs allow users to bypass
        liquidity provider (LP) fees and also reduce gas costs since those orders only interact with CoW Protocol’s
        smart contracts.
      </>
    ),
  },
  {
    question: 'How is CoW Swap better than other DEX aggregators?',
    answer: (
      <>
        CoW Swap’s unique architecture allows it to give users comprehensive MEV protection as well as better prices for
        their trades. While most other DEX aggregators simply compare quotes from various DEXs and execute orders
        against whichever DEX is lowest at the time of quoting, CoW Swap seeks to find the best execution price. CoW
        Swap groups user orders into batches and auctions them off to bonded third parties known as{' '}
        <Link
          href="https://docs.cow.fi/cow-protocol/concepts/introduction/solvers"
          external
          utmContent="cow-protocol-introduction-solvers"
          onClick={() => sendGAEventHandler(GAEventCategories.COWSWAP, 'click-introduction-solvers')}
        >
          solvers
        </Link>{' '}
        to execute. Solvers compete by sourcing liquidity from onchain AMMs, private market makers, and Coincidences of
        Wants, and the solver that gives the best prices for a given batch wins the right to settle the batch. On CoW
        Swap, users are always safe from MEV for a number of reasons including, ultimately, that solvers take on all
        execution risk by settling the batches on their behalf. CoW Swap is unique among DEX aggregators as it is built
        from the ground up to make trading worry-free for every type of DeFi user.
      </>
    ),
  },
  {
    question: 'What is MEV?',
    answer: (
      <>
        MEV, or maximal extractable value, is a form of price exploitation that acts as a “hidden tax” on Ethereum
        transactions. To date, MEV has caused over a billion dollars in losses for everyday traders, many of whom don’t
        even know they’ve been exploited. By default, Ethereum transactions are publicly exposed, meaning that
        sophisticated traders can take advantage of public trading details to exploit user positions. For example, if a
        user is about to make a large trade moving the price of an asset, sophisticated traders running “MEV bots” can
        anticipate this trade and manipulate the price of the asset to their advantage. There are several types of MEV
        including frontrunning, backrunning, sandwich attacks, and loss-versus-rebalancing. Thanks to its unique
        architecture, CoW Swap protects users from all types of malicious MEV.
      </>
    ),
  },
  {
    question: 'Why is my transaction taking so long?',
    answer: (
      <>
        CoW Swap{' '}
        <Link
          href="https://docs.cow.fi/cow-protocol/concepts/introduction/batch-auctions"
          external
          utmContent="cow-protocol-introduction-batch-auctions"
          onClick={() => sendGAEventHandler(GAEventCategories.COWSWAP, 'click-introduction-batch-auctions')}
        >
          batch auctions
        </Link>{' '}
        mimic Ethereum’s block mechanism, meaning that trades are settled periodically. Sometimes, especially in the
        case of more-exotic assets, it might take a solver a few blocks to win the auction and settle a transaction.
        Settling transactions through intent-based batch auctions may, in some cases, be slower than settling
        transactions directly onchain. However, CoW Swap’s unique architecture enables a slew of benefits that
        traditional DEXs cannot achieve – from gasless trading to MEV protection and surplus.
      </>
    ),
  },
  {
    question: 'What are the official CoW Swap social channels?',
    answer: (
      <>
        Please beware of fake links and phishing scams. The official CoW DAO channels can be found at the footer of all
        our pages on{' '}
        <Link
          href="https://www.cow.fi"
          utmContent="cow-website"
          onClick={() => sendGAEventHandler(GAEventCategories.COWSWAP, 'click-website')}
        >
          www.cow.fi
        </Link>
        .
        <br />
        <br />
        For reference, here is our full list of social channels:
        <br />
        X:{' '}
        <Link
          href="https://x.com/CoWSwap"
          external
          utmContent="cow-twitter"
          onClick={() => sendGAEventHandler(GAEventCategories.COWSWAP, 'click-twitter')}
        >
          https://x.com/CoWSwap
        </Link>
        <br />
        Discord:{' '}
        <Link
          href="https://discord.gg/cowprotocol"
          external
          utmContent="cow-discord"
          onClick={() => sendGAEventHandler(GAEventCategories.COWSWAP, 'click-discord')}
        >
          https://discord.gg/cowprotocol
        </Link>
        <br />
        Forum:{' '}
        <Link
          href="https://forum.cow.fi/"
          external
          utmContent="cow-forum"
          onClick={() => sendGAEventHandler(GAEventCategories.COWSWAP, 'click-forum')}
        >
          https://forum.cow.fi/
        </Link>
        <br />
        Snapshot:{' '}
        <Link
          href="https://snapshot.org/#/cow.eth"
          external
          utmContent="cow-snapshot"
          onClick={() => sendGAEventHandler(GAEventCategories.COWSWAP, 'click-snapshot')}
        >
          https://snapshot.org/#/cow.eth
        </Link>
        <br />
        Github:{' '}
        <Link
          href="https://github.com/cowprotocol/"
          external
          utmContent="cow-github"
          onClick={() => sendGAEventHandler(GAEventCategories.COWSWAP, 'click-github')}
        >
          https://github.com/cowprotocol/
        </Link>
      </>
    ),
  },
  {
    question: 'Can I get a refund from CoW Swap?',
    answer: '',
  },
  {
    question: 'How do I get support?',
    answer: (
      <>
        While CoW Swap is a decentralized project, community members and contributors are available to help and answer
        questions. To request support or to ask a question, please ping a community member in the CoW DAO Discord.
        <br />
        <br />
        CoW DAO Discord:{' '}
        <Link
          href="https://discord.gg/cowprotocol"
          external
          utmContent="cow-discord"
          onClick={() => sendGAEventHandler(GAEventCategories.COWSWAP, 'click-discord')}
        >
          https://discord.gg/cowprotocol
        </Link>
      </>
    ),
  },
]
