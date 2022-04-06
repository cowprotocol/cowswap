import { Link } from 'react-router-dom'

import {
  GPAUDIT_LINK,
  COWWIKI_LINK,
  GNOSIS_FORUM_ROADTODECENT_LINK,
  FLASHBOYS_LINK,
  DISCORD_LINK,
  MEV_TOTAL,
  FLASHBOTS_LINK,
} from 'constants/index'
import Page, { Content } from 'components/Page'
import { ExternalLinkFaq, Wrapper, ButtonNav, FooterWrapper } from './styled'
import { FaqMenu } from './Menu'
import { StyledInternalLink } from 'theme'

import { useToC } from './hooks'
import ToC from './ToC'

export interface TocSection {
  section: TocItem
  items: TocItem[]
}

export interface TocItem {
  label: string
  id: string
}

export function Footer() {
  return (
    <FooterWrapper>
      <p>
        Didn&#39;t find an answer? Join the{' '}
        <ExternalLinkFaq href={DISCORD_LINK} target="_blank" rel="noopener noreferrer">
          community on Discord
        </ExternalLinkFaq>{' '}
        <br />
        <br />
        We really hope you like CowSwap. If you do,&nbsp;<Link to="/">Milk it!</Link>
        <span role="img" aria-label="glass of milk">
          🥛
        </span>
      </p>
      <ButtonNav onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>Back to top ↑</ButtonNav>
    </FooterWrapper>
  )
}

export default function Faq() {
  const { toc, faqRef } = useToC()
  return (
    <Wrapper ref={faqRef}>
      <FaqMenu />
      <Page>
        <ToC toc={toc} name="General FAQ" />
        <Content>
          <h2 id="general">General</h2>
          <h3 id="what-is-cowswap">What is CowSwap?</h3>
          <p>CowSwap is the first trading interface built on top of CoW Protocol.</p>
          <p>
            CowSwap is a Meta DEX aggregator that allows you to buy and sell tokens using gasless orders that are
            settled peer-to-peer among its users, or into any on-chain liquidity source while providing MEV protection.
          </p>

          <h3 id="why-is-cowswap-a-meta-dex-aggregator">What makes CowSwap a &quot;Meta&quot; DEX aggregator?</h3>
          <p>
            Cowswap is built on top of the CoW Protocol which matches trades via batch auctions for a variety of
            on-chain liquidity sources.
          </p>
          <p>
            Trades can be settled via underlying on-chain AMMs directly or via DEX Aggregators, depending on which
            pool/path offers the best price. It is thus essentially acting as a DexAggregator of the DexAggregators.
          </p>
          <p>
            In addition to that, before finding the best price for a trade from available on-chain liquidity, CoW
            Protocol first seeks a coincidence of wants within the existing batch to offer an even better price than any
            pool can.
          </p>

          <h3 id="what-is-mev-and-how-much-mev-has-been-extracted-from-users-to-date">
            What is MEV and how much MEV has been extracted from users to date?
          </h3>

          <p>
            Defined by Phil Daian et al. in the{' '}
            <ExternalLinkFaq href={FLASHBOYS_LINK}>paper Flash Boys 2.0 </ExternalLinkFaq>, MEV is a measure of the
            profit a miner (or validator, sequencer, etc.) can make through their ability to arbitrarily include,
            exclude, or re-order transactions within the blocks they produce.
          </p>

          <p>
            As of today the total amount of value extracted by miners (etc.) on Ethereum transactions has reached{' '}
            <ExternalLinkFaq href={FLASHBOTS_LINK}>USD {MEV_TOTAL}</ExternalLinkFaq>, including successful and failed
            transactions.
          </p>

          <h3 id="to-what-does-the-term-coincidence-of-wants-cows-refer">
            To what does the term Coincidence of Wants (CoWs) refer?
          </h3>

          <p>
            <ExternalLinkFaq href={COWWIKI_LINK}>Coincidence of Wants (CoWs)</ExternalLinkFaq> can be explained as “an
            economic phenomenon where two parties each hold an item the other wants, so they exchange these items
            directly.” CowSwap facilitates CoWs among traders and their orders through using batch auctions as a core
            mechanism.
          </p>

          <p>
            This means, on CowSwap, when two traders each hold an asset the other wants, a trade can be settled directly
            between them without an external market maker or liquidity provider. This leads to better prices for the
            individual traders (because traditionally market makers add a fee — referred to as spread — for their
            service).
          </p>

          <p>
            CowSwap allows for coincidence of wants (CoWs) orders to be traded directly against one another. Only the
            excess order amounts that cannot be settled directly with other CowSwap traders are sent to the underlying
            AMMs (automated market makers).
          </p>

          <h3 id="how-am-i-protected-from-mev-arbitrage-front-running-sandwiching-with-cowswap">
            How am I protected from MEV (Arbitrage, Front running, Sandwiching) with CowSwap?
          </h3>

          <p>
            CowSwap leverages batch auctions with uniform clearing prices for all trades in the same batch. Because of
            the uniform clearing price, there is no need for ordering the transactions within a single batch. Because
            everyone receives the same price across assets it&apos;s not possible for <b>any</b> value to be extracted
            by placing transactions in a certain order. This prevents the primary strategy used in MEV.
          </p>

          <p>
            Batches are decentrally settled by external, independent parties (called “solvers”) on-chain. A solver is a
            person or entity who submits order settlement solutions that maximize trade surplus for a given batch.
            Solvers are incentivized to implement professional transaction management techniques that allow them to set
            very tight slippage bounds on any interactions with external liquidity sources (e.g., trading CoW excess on
            Uniswap). This dramatically reduces the manipulation surface of miners and front-runners.
          </p>

          <p>
            Additionally, depending on the composition of the orders that are submitted and are valid for a given batch,
            the existence of CoWs may significantly reduce the amount that has to be exchanged via external MEV-prone
            protocols, such as Uniswap.
          </p>

          <h3 id="how-does-cowswap-determine-prices">How does CowSwap determine prices?</h3>

          <p>
            CowSwap settles batch auctions in discrete time intervals. In the absence of other traders, CowSwap matches
            traders against the best available on-chain liquidity (note: currently the solvers have integrated liquidity
            from Uni v2, Uni v3, Balancer, Balancer v2, Sushiswap and the liquidity that Aggregators such as Paraswap,
            Matcha and 1inch leverage).
          </p>

          <p>
            If CoWs (Coincidence of Wants) orders exist in a batch, the “smaller” order is matched fully with the larger
            order. The excess of the larger order is settled with the best available base liquidity CowSwap integrates
            with, which is, for now, Uniswap. The clearing price for both orders will be the price of the token with the
            excess amount on external liquidity sources to which the protocol is connected.
          </p>

          <p>
            Finding the best settlement for orders is a challenging task, which very soon may have its own{' '}
            <ExternalLinkFaq href={GNOSIS_FORUM_ROADTODECENT_LINK}>decentralized competition</ExternalLinkFaq>.
          </p>

          <h3 id="is-cowswap-secure-to-use">Is CowSwap secure to use?</h3>

          <p>
            As of August 11th, 2021, CowSwap is no longer in alpha and moves to a final, stable version. The underlying
            CoW Protocol Smart contracts have been upgraded to integrate tightly with Balancer v2.
          </p>

          <p>
            With this upgrade, CowSwap evolves into its most stable, performant form: the code has been thoroughly and
            carefully tested, peer-reviewed and fully <ExternalLinkFaq href={GPAUDIT_LINK}>audited</ExternalLinkFaq>.
            Whilst CowSwap has taken a major step forward in terms of security and stability, as with other crypto
            protocols or dapps, your use is at your own risk.{' '}
            <strong>
              Please review our{' '}
              <StyledInternalLink to="/terms-and-conditions">
                <strong>Terms and Conditions</strong>
              </StyledInternalLink>
              .
            </strong>
          </p>
          <Footer />
        </Content>
      </Page>
    </Wrapper>
  )
}
