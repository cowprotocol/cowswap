import React, { useCallback, useState } from 'react'
import Page, { Content, Title } from 'components/Page'
import styled from 'styled-components'
import { ContentLink } from 'components/ContentLink'
import { DISCORD_LINK } from 'constants/index'

const Wrapper = styled.div`
  h2 {
    color: ${({ theme }) => theme.primary1};
  }

  > div:not(:first-child) {
    margin: 2rem 0;
  }

  ${Content} {
    > h3 {
      margin: 0;

      ::before {
        border-top: none;
      }
    }
  }
`

interface TocSection {
  section: TocItem
  items: TocItem[]
}

interface TocItem {
  label: string
  id: string
}

function getToc(node: HTMLDivElement) {
  const headingNodes = node.querySelectorAll('h2,h3')

  const tocSections: TocSection[] = []
  let items: TocItem[] = []
  let lastH2: TocItem | undefined = undefined

  const addNewSection = () => {
    if (lastH2 !== undefined) {
      tocSections.push({
        section: lastH2,
        items
      })
      items = []
    }
  }

  headingNodes.forEach(entry => {
    if (entry.tagName === 'H2') {
      // If H2
      addNewSection()
      lastH2 = {
        id: entry.id,
        label: entry.innerHTML
      }
    } else {
      // If H3
      items.push({
        id: entry.id,
        label: entry.innerHTML
      })
    }
  })

  addNewSection()

  return tocSections
}

export default function Faq() {
  const [toc, setToc] = useState<TocSection[]>([])

  const faqRef = useCallback((node: HTMLDivElement) => {
    if (node !== null) {
      const tocSections = getToc(node)
      setToc(tocSections)
    }
  }, [])

  return (
    <Wrapper ref={faqRef}>
      <Page>
        <Title id="cowswap-faq">CowSwap FAQ</Title>
        <Content>
          {toc.map(({ section, items }) => (
            <div key={section.id}>
              <ContentLink href={'#' + section.id}>{section.label}</ContentLink>
              <ul>
                {items.map(tocItem => (
                  <li key={tocItem.id}>
                    <ContentLink href={'#' + tocItem.id}>{tocItem.label}</ContentLink>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </Content>
      </Page>
      <Page>
        <Content>
          <h2 id="general">General</h2>
          <h3 id="what-is-cowswap">What is CowSwap?</h3>
          <p>
            CowSwap is a proof-of-concept dapp (decentralized application) built on Gnosis Protocol v2 (GPv2). CowSwap
            offers the decentralized finance community a teaser of the capabilities of GPv2 through testing upcoming
            features while placing gas free trades. Milk it!{' '}
          </p>

          <h3 id="what-is-mev-and-how-much-mev-has-been-extracted-from-users-to-date">
            What is MEV and how much MEV has been extracted from users to date?
          </h3>

          <p>
            Initially <a href="https://research.paradigm.xyz/MEV">defined</a> by the Paradigm research team, MEV is “a
            measure of the profit a miner (or validator, sequencer, etc.) can make through their ability to arbitrarily
            include, exclude, or re-order transactions within the blocks they produce.”{' '}
          </p>

          <p>
            Since January 2020 until now (April&#39;21), the total amount of value extracted by miners (etc.) on
            Ethereum transactions has reached{' '}
            <a href="https://explore.flashbots.net/">$ 382.4 Million, including successful and failed transactions.</a>
          </p>

          <h3 id="to-what-does-the-term-coincidence-of-wants-cows-refer">
            To what does the term Coincidence of Wants (CoWs) refer?
          </h3>

          <p>
            Coincidence of Wants (CoWs) can be{' '}
            <a href="https://en.wikipedia.org/wiki/Coincidence_of_wants">explained</a> as “an economic phenomenon where
            two parties each hold an item the other wants, so they exchange these items directly.” CowSwap facilitates
            CoWs among traders and their orders through using batch auctions as a core mechanism.{' '}
          </p>

          <p>
            This means, on CowSwap, when two traders each hold an asset the other wants, a trade can be settled directly
            between them without an external market maker or liquidity provider. This leads to better prices for the
            individual traders (because traditionally market makers add a fee — referred to as spread — for their
            surface).{' '}
          </p>

          <p>
            CowSwap allows for coincidence of wants (CoWs) orders to be traded directly against one another. Only the
            excess order amount that cannot be settled directly with other CowSwap traders are sent to the underlying
            AMMs (automated market makers).{' '}
          </p>

          <h3 id="how-am-i-protected-from-mev-arbitrage-front-running-sandwiching-with-cowswap">
            How am I protected from MEV (Arbitrage, Front running, Sandwiching) with CowSwap?
          </h3>

          <p>
            CowSwap leverages batch auctions with uniform clearing prices for all trades in the same batch. Because of
            the uniform clearing price , there is no need for ordering the transactions within a single batch. Because
            everyone receives the same price across assets it’s not possible for <em>any</em> value to be extracted by
            placing transactions in a certain order. This prevents the primary strategy used in MEV.
          </p>

          <p>
            Batches are decentrally settled by an external, independent party (called “solvers”) on-chain. Solvers are a
            person or entity who submits order settlement solutions that maximize trade surplus for a given batch.
            Solvers are incentivized to implement professional transaction management techniques that allow them to set
            very tight slippage bounds on any interactions with external liquidity sources (e.g. trading CoW excess on
            Uniswap). This dramatically reduces the manipulation surface of miners and front-runners.
          </p>

          <p>
            Additionally, depending on the composition of the orders submitted and valid for a given batch, the
            existence of CoWs may significantly reduce the amount that has to be exchanged via external MEV-prone
            protocols, such as Uniswap.
          </p>

          <h3 id="how-does-cowswap-determine-prices">How does CowSwap determine prices?</h3>

          <p>
            CowSwap settles batch auctions in discrete time intervals. In the absence of other traders, CowSwap matches
            traders against the best available Uniswap liquidity (note: other base-liquidity sources such as Balancer
            will be added soon).
          </p>

          <p>
            If CoWs (Coincidence of Wants) orders exist in a batch, the “smaller” order is matched fully with the larger
            order. The excess of the larger order is settled with the best available base liquidity CowSwap integrates
            with, which is, for now, Uniswap. The clearing price for both orders will be the price of the token with the
            excess amount on external liquidity sources to which the protocol is connected.
          </p>

          <p>
            Finding the order best settlement is a challenging task, which may have its own{' '}
            <a href="https://forum.gnosis.io/t/gpv2-road-to-decentralization/1245">decentralized competition</a> very
            soon.{' '}
          </p>

          <h3 id="is-cowswap-secure-to-use">Is CowSwap secure to use?</h3>

          <p>
            CowSwap is in ongoing development, and that is why this is not a beta product but rather a proo-of-concept
            dapp for the community to test and leverage before the final version is released.{' '}
          </p>

          <p>
            The code has been carefully tested and peer-reviewed. Although this can be seen as a step forward in terms
            of security, it&#39;s recommended to use the protocol at your own risk.{' '}
          </p>
        </Content>
      </Page>

      <Page>
        <Content>
          <h2 id="protocol">Protocol</h2>

          <h3 id="what-is-cowswap-s-fee-model">What is CowSwap’s fee model?</h3>

          <p>
            Each executed order has a fee which is captured by the protocol. Part of the fee is paid to solvers
            (entities which provide order settlement solutions) to incentivize their participation.
          </p>

          <p>
            The fee consists of the &quot;base cost to execute the trade&quot; and the &quot;protocol fee&quot;
            (although it is only exposed to the user as one fee). As a user, you are only signing a message to submit
            your trade and the underlying solver will end up submitting the transaction for you. Essentially you are
            paying this &quot;base cost to execute the trade&quot; aka &quot;gas costs&quot; with your sell token and
            the cost is already included in your price estimation. The protocol is currently subsidizing 90% of the gas
            cost, while the protocol fee is currently switched off.
          </p>
          <p>
            Note that you will only have to pay fees IF your trade is executed. No more gas-costs on any failed
            transactions!
          </p>

          <h3 id="how-does-cowswap-connect-to-all-on-chain-liquidity">
            How does CowSwap connect to all on-chain liquidity?
          </h3>

          <p>CowSwap can connect to all on-chain liquidity:</p>

          <p>
            When CowSwap does not have enough CoWs (Coincidence of Wants) among the orders available for a batch, it
            taps other AMMs’ liquidity to be able to settle the traders’ orders. Gnosis Protocol v2 can be connected to
            any on-chain liquidity sources and can therefore enjoy the benefits of concentrating the fragmented
            liquidity across decentralized finance.
          </p>

          <h3 id="how-is-cowswap-able-to-offer-better-prices-than-aggregators-themselves">
            How is CowSwap able to offer better prices?
          </h3>

          <p>
            Before using on-chain liquidity, CowSwap tries to find CoWs (Coincidences of Wants) within the set of
            currently valid orders and match them directly with one another. CoWs result in better prices because no fee
            is paid to the liquidity provider (e.g. 0.3% for Uniswap v2). In the case that CowSwap does not have CoWs,
            it taps into the DEX that gives the next best price. This results in the same or better performance than
            existing DEX aggregators.{' '}
          </p>

          <h3 id="how-can-i-become-a-liquidity-provider">How can I become a liquidity provider?</h3>

          <p>
            CowSwap does not have liquidity providers. Instead, it connects to all on-chain liquidity that is provided
            across different protocols. Since orders only incur a cost if traded, active market makers can observe the
            orderbook and place counter orders (creating a CoW) to prevent settling trades via external liquidity.
          </p>
        </Content>
      </Page>

      <Page>
        <Content>
          <h2 id="trading">Trading</h2>

          <h3 id="what-types-of-orders-does-cowswap-support">What types of orders does CowSwap support?</h3>

          <p>At the moment, only limit sell and buy orders (fill-or-kill) are enabled. </p>

          <h3 id="what-token-pairs-does-cowswap-allow-to-trade">What token pairs does CowSwap allow to trade?</h3>

          <p>Any valid ERC20 token pair for which there is some basic liquidity on a DEX (like Uniswap or Balancer).</p>

          <h3 id="why-is-cowswap-able-to-offer-gas-free-trades">Why is CowSwap able to offer gas-free trades?</h3>

          <p>
            CowSwap is able to offer gas-free trades because the orders are submitted off-chain via signed messages.
            Once you approve your funds for spending on the dapp, you can submit orders via signed messages that contain
            the trade’s details, such as limit price, amount, timestamp, and so on.{' '}
          </p>

          <h3 id="do-i-need-eth-to-trade">Do I need ETH to trade?</h3>

          <p>
            For the trade itself you do not need to hold ETH. Although, in order to be able to trade on CowSwap, you
            first need to approve your funds for spending on the dapp<small>**</small>. For that action, you need ETH to
            pay for gas fees. Once you’ve done this, ETH is no longer required as CowSwap charges the fee from the sell
            token.{' '}
          </p>

          <p>
            <small>
              ** In the neartime future, if you are trying to sell an ERC20 that allows offline approvals, then the ETH
              needed to pay for allowing your funds to be spent is not needed anymore, making the trading experience
              fully gas-free. Keep in mind that this is only possible with ERC20 tokens that have such functionality; if
              not, you will need ETH to execute the approval transaction only.
            </small>
          </p>

          <h3 id="how-does-a-trader-submit-a-valid-order-in-cowswap">
            How does a trader submit a valid order in CowSwap?
          </h3>

          <p>In order for a trader to submit a valid order to CowSwap, they must do the following steps:</p>

          <ol>
            <li>
              Approve the CowSwap smart contract to spend the token on your behalf. By executing this smart contract
              interaction you are approving the contract to withdraw the funds from your wallet once the trade you have
              signed has been filled in a batch auction.{' '}
            </li>
            <li>
              Once the approval has been mined, the next step is to sign a meta-tx in which you will see the parameters
              of the order you are about to place in the CowSwap interface. After that, there&#39;s nothing else to do.{' '}
            </li>
            <li>
              Once the order is executed, you will see a notification in the CowSwap UI and hear a confirming “Moo”
              sound.{' '}
            </li>
          </ol>

          <h3 id="why-does-the-ui-dapp-have-a-warning-fees-exceed-from-amount">
            Why does the UI dapp have a warning ”Fees exceed From amount”?
          </h3>

          <p>
            In order for solvers (order settlement solution providers) to be economically viable, they need to take into
            account how much gas they spend executing the settlement transaction. The protocol’s fee ensures that
            solvers are incentivized to include the order in a settlement (similar to how gas is paid on traditional
            DEXs). The fee is directly taken from the sell amount, which therefore has to have a certain minimum size.
          </p>

          <h3 id="why-do-i-need-to-approve-a-token-before-trading">Why do I need to approve a token before trading?</h3>

          <p>
            When an order is executed, the settlement contract withdraws the sell amount from the trader’s token balance
            via the Allowance Manager (for more information cf.{' '}
            <a href="https://github.com/gnosis/gp-v2-contracts">Smart Contract Architecture</a>). In order to allow that
            to happen, the trader has to first approve the Allowance Manager contract to spend tokens on their behalf.
            The smart contract logic ensures that no token can be spent without deliberately signing an order for it.
          </p>

          <h3 id="why-do-i-sign-a-message-instead-of-sending-a-transaction-to-place-an-order">
            Why do I sign a message instead of sending a transaction to place an order?
          </h3>

          <p>
            Signing a message incurs no gas cost and is therefore free to the user. When placing an order, the protocol
            cannot guarantee that the order will be executed (e.g. the price could change to no longer satisfy the
            specified limit). By only signing the intent to trade, we can ensure that users only incur a cost when their
            trade is successfully executed.{' '}
          </p>

          <p>
            Furthermore, by splitting the intent to trade (that is token, amount, and limit price) from the actual
            on-chain execution, the protocol can react to on-chain race conditions and, for example, change the trading
            route an order is matched against without requiring the user to submit a new order.
          </p>

          <h3 id="can-i-buy-and-sell-eth-in-cowswap">Can I buy and sell ETH in CowSwap?</h3>

          <p>
            Yes, you can directly place buy and sell orders for ETH. Before the actual order is placed, the UI will
            allow you to wrap and unwrap ETH into WETH without needing to leave the dapp’s UI.{' '}
          </p>

          <hr />

          <p>
            Didn&#39;t find an answer? Join the <a href={DISCORD_LINK}>community on Discord</a> for support.
          </p>

          {/* 
        <h2 id="discardedquestionstobeaddedlater">Discarded Questions to be added later</h2>

        <ul>
          <li>
            **How can I cancel an order that I placed on CowSwap? Canceling an order in CowSwap can be done in two
            different ways:
          </li>
        </ul>

        <ol>
          <li>
            Calling the Cowsap API to signal that you want to cancel a specific order. In this case, the cancellation is
            completely free as it does not require any onchain interaction.{' '}
          </li>

          <li>
            Calling the CowSwap contract to register onchain that you want to cancel a specific order. In this case the
            cancellation does have a cost as the onchain interaction requires gas fees.{' '}
          </li>
        </ol>
        */}
        </Content>
      </Page>
    </Wrapper>
  )
}
