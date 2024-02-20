import {
  GPAUDIT_LINK,
  COWWIKI_LINK,
  FLASHBOYS_LINK,
  DISCORD_LINK,
  MEV_TOTAL,
  FLASHBOTS_LINK,
} from '@cowprotocol/common-const'

import { Link } from 'react-router-dom'

import { LinkScrollable } from 'legacy/components/Link'
import { PageWithToC } from 'legacy/components/PageWithToC'
import { StyledInternalLink } from 'legacy/theme'

import { PageTitle } from 'modules/application/containers/PageTitle'
import { Page, Content } from 'modules/application/pure/Page'

import { Routes } from 'common/constants/routes'

import { useToC } from './hooks'
import { FaqMenu } from './Menu'
import { ExternalLinkFaq, ButtonNav, FooterWrapper } from './styled'
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
        We really hope you like CoW Swap. If you do,&nbsp;<Link to={Routes.HOME}>Milk it!</Link>
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
    <>
      <PageWithToC ref={faqRef}>
        <PageTitle title="General FAQ" />
        <FaqMenu />
        <Page>
          <ToC toc={toc} name="General FAQ" />
          <Content>
            <h2 id="general">General</h2>
            <h3 id="what-is-cowswap">What is CoW Swap?</h3>
            <p>CoW Swap is the first trading interface built on top of CoW Protocol.</p>
            <p>
              CoW Swap is a Meta DEX aggregator that allows you to buy and sell tokens using gasless orders that are
              settled peer-to-peer among users, or into any on-chain liquidity source while providing protection from
              MEV.
            </p>

            <h3 id="why-is-cowswap-a-meta-dex-aggregator">What makes CoW Swap a &quot;Meta&quot; DEX aggregator?</h3>
            <p>
              CoW Swap is built on top of CoW Protocol and is a fully permissionless trading protocol that leverages
              Batch Auctions as its price finding mechanism.
            </p>
            <p>
              Trades can be settled via underlying on-chain AMMs directly or via DEX Aggregators, depending on which
              pool/path offers the best price. It is thus essentially acting as a DexAggregator of the DexAggregators.
            </p>
            <p>
              In addition to that, before finding the best price for a trade from available on-chain liquidity, CoW
              Protocol first seeks a Coincidence of Wants within the existing batch to offer an even better price than
              any pool can.
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
              directly.” CoW Swap facilitates CoWs among traders and their orders through using batch auctions as a core
              mechanism.
            </p>

            <p>
              This means, on CoW Swap, when two traders each hold an asset the other wants, a trade can be settled
              directly between them without an external market maker or liquidity provider. This leads to better prices
              for the individual traders (because traditionally market makers add a fee — referred to as spread — for
              their service).
            </p>

            <p>
              CoW Swap allows for coincidence of wants (CoWs) orders to be traded directly against one another. Only the
              excess order amounts that cannot be settled directly with other CoW Swap traders are sent to the
              underlying AMMs (automated market makers).
            </p>

            <h3 id="how-am-i-protected-from-mev-arbitrage-front-running-sandwiching-with-cowswap">
              How am I protected from MEV (Arbitrage, Front running, Sandwiching) with CoW Swap?
            </h3>

            <p>
              CoW Swap leverages batch auctions with uniform clearing prices for all trades in the same batch. Because
              of the uniform clearing price, there is no need for ordering the transactions within a single batch.
              Because everyone receives the same price across assets it&apos;s not possible for <b>any</b> value to be
              extracted by placing transactions in a certain order. This prevents the primary strategy used in MEV.
            </p>

            <p>
              Batches are decentrally settled by external, independent parties (called “solvers”) on-chain. A solver is
              a person or entity who submits order settlement solutions that maximize users trade surplus for a given
              batch. Solvers are incentivized to implement professional transaction management techniques that allow
              them to set very tight slippage bounds on any interactions with external liquidity sources (e.g., trading
              CoW excess on Uniswap). This dramatically reduces the manipulation surface of MEV bots.
            </p>

            <p>
              Additionally, depending on the composition of the orders that are submitted and are valid for a given
              batch, the existence of CoWs may significantly reduce the amount that has to be exchanged via external
              MEV-prone protocols, such as Uniswap.
            </p>

            <h3 id="how-does-cowswap-determine-prices">How does CoW Swap determine prices?</h3>

            <p>
              CoW Swap settles batch auctions in discrete time intervals. In the absence of other traders, CoW Swap
              matches traders against the best available on-chain liquidity.
            </p>

            <p>
              If CoWs (Coincidence of Wants) orders exist in a batch, the “smaller” order is matched fully with the
              larger order. The excess of the larger order is settled with the best available base on-chain liquidity.
              The clearing price for both orders will be the price of the token with the excess amount on external
              liquidity sources to which the protocol is connected.
            </p>

            <h3 id="wallet-not-supported">Why is my wallet not supported?</h3>
            <p>
              CoW Swap uses offline signatures to offer gasless orders. Additionally, Smart Contract (SC) wallets are
              supported through an alternative signing method called{' '}
              <LinkScrollable href={'/faq/protocol#what-is-presign'}>pre-sign</LinkScrollable>.
            </p>
            <p>
              Regular, non Smart Contract wallets (called EOA) require the wallet to support off-chain signing (
              <ExternalLinkFaq href="https://eips.ethereum.org/EIPS/eip-712">EIP-712</ExternalLinkFaq> standard).
            </p>
            <p>
              Through our own internal testing and user reports, we identified some EOA wallets that do not yet work
              with off-chain signing. Thus, your individual wallet may not be supported.. If that is the case for you,
              reach out to your wallet developers and ask for it.
            </p>
            <h3 id="smart-contract-support">Are Smart Contract wallets supported?</h3>
            <p>
              Yes! Any Smart Contract (be it a wallet or regular contract) can trade in CoW Swap by using one signing
              method called pre-sign.
            </p>
            <p>
              Pre-sign is a protocol operation that can be invoked by any contract. The operation has a single parameter
              that is the &quot;orderId&quot; which identifies the order being approved. Pre-signing your order in the
              settlement contract is equivalent to providing an off-chain signature for the orderId.
            </p>
            <p>
              Additionally, the protocol provides{' '}
              <ExternalLinkFaq href="https://eips.ethereum.org/EIPS/eip-1271">EIP-1271</ExternalLinkFaq> support for
              off-chain signing also for smart contracts, making gasless trading possible also for smart contracts.
            </p>

            <h3 id="what-is-presign">What is pre-sign?</h3>
            <p>
              It is an alternative way of signing orders offered by the protocol, that is especially interesting for
              smart contract integrations and Smart Contract wallets. See{' '}
              <LinkScrollable href={'/faq/protocol#smart-contract-support'}>Smart Contract support</LinkScrollable> for
              more information.
            </p>

            <h3 id="is-cowswap-secure-to-use">Is CoW Swap secure to use?</h3>

            <p>
              The code has been thoroughly and carefully tested, peer-reviewed and fully audited twice{' '}
              <ExternalLinkFaq href={GPAUDIT_LINK}>audited</ExternalLinkFaq>. Whilst CoW Swap has taken a major step
              forward in terms of security and stability, as with other crypto protocols or dapps, your use is at your
              own risk.{' '}
              <strong>
                Please review our{' '}
                <StyledInternalLink to={Routes.TERMS_CONDITIONS}>
                  <strong>Terms and Conditions</strong>
                </StyledInternalLink>
                .
              </strong>
            </p>
            <Footer />
          </Content>
        </Page>
      </PageWithToC>
    </>
  )
}
