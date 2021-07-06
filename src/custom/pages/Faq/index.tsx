import React, { useCallback, useState } from 'react'
import Page, { Content, Title } from 'components/Page'
import styled from 'styled-components'
import { ContentLink } from 'components/ContentLink'
import { DISCORD_LINK } from 'constants/index'
import { Link } from 'react-router-dom'

const Wrapper = styled.div`
  #table-container {
    margin: auto;
    max-width: 100%;

    > table {
      width: 100%;
      border-spacing: 1px;
      color: ${({ theme }) => theme.text1};

      > thead {
        background: ${({ theme }) => theme.tableHeadBG};
      }

      > tbody > tr {
        background: ${({ theme }) => theme.tableRowBG};
      }

      > tbody > tr > td > span[role='img'] {
        font-size: 18px;
      }

      th,
      td {
        text-align: left;
        padding: 6px 12px;

        &:not(:first-child) {
          text-align: center;
        }
      }

      th {
        padding: 16px 12px;
      }
    }
  }

  h2 {
    color: ${({ theme }) => theme.primary1};
  }

  > div:not(:first-child) {
    margin: 2rem 0;
  }

  ${Content} {
    > div a {
      color: ${({ theme }) => theme.text1};
      transition: color 0.2s ease-in-out;

      &:hover {
        color: ${({ theme }) => theme.textLink};
      }
    }

    > div > a {
      font-size: 16px;
      font-weight: bold;
    }

    > div > ul {
      margin: 12px 0 24px;
      padding: 0 0 0 20px;
      color: ${({ theme }) => theme.primary1};
      line-height: 1.2;
    }

    > div > ul > li {
      margin: 0 0 12px;
    }

    > p a {
      color: ${({ theme }) => theme.textLink};
    }

    > h3 {
      margin: 0;

      ::before {
        border-top: none;
      }
    }
  }

  ol > li {
    margin-bottom: 0.5rem;
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
        items,
      })
      items = []
    }
  }

  headingNodes.forEach((entry) => {
    if (entry.tagName === 'H2') {
      // If H2
      addNewSection()
      lastH2 = {
        id: entry.id,
        label: entry.innerHTML,
      }
    } else {
      // If H3
      items.push({
        id: entry.id,
        label: entry.innerHTML,
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
                {items.map((tocItem) => (
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
          <p>CowSwap is the first trading interface built on top of Gnosis Protocol v2.</p>
          <p>
            It allows you to buy and sell tokens using gas-less orders that are settled peer-to-peer among its users or
            into any on-chain liquidity source while providing MEV protection.
          </p>

          <h3 id="why-is-cowswap-a-meta-dex-aggregator">What makes CowSwap a &quot;Meta&quot; DEX aggregator?</h3>
          <p>
            Cowswap is built on top of the Gnosis protocol which matches trades via batch auctions for a variety of
            on-chain liquidity sources.
          </p>
          <p>
            Trades can be settled via underlying on-chain AMMs directly or via DEX Aggregators, depending on which
            pool/path offers the best price. It is thus essentially acting as a DexAggregator of the DexAggregators.
          </p>
          <p>
            In addition to that, before finding the best price for a trade from available on-chain liquidity, Gnosis
            Protocol first seeks a coincidence of wants within the existing batch to offer an even better price than any
            pool can.
          </p>

          <h3 id="what-is-mev-and-how-much-mev-has-been-extracted-from-users-to-date">
            What is MEV and how much MEV has been extracted from users to date?
          </h3>

          <p>
            Defined by Phil Daian in the <a href="https://arxiv.org/abs/1904.05234"> paper Flash Boys 2.0 </a>, MEV is a
            measure of the profit a miner (or validator, sequencer, etc.) can make through their ability to arbitrarily
            include, exclude, or re-order transactions within the blocks they produce.
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
            <a href="https://en.wikipedia.org/wiki/Coincidence_of_wants"> Coincidence of Wants (CoWs)</a> can be
            explained as “an economic phenomenon where two parties each hold an item the other wants, so they exchange
            these items directly.” CowSwap facilitates CoWs among traders and their orders through using batch auctions
            as a core mechanism
          </p>

          <p>
            This means, on CowSwap, when two traders each hold an asset the other wants, a trade can be settled directly
            between them without an external market maker or liquidity provider. This leads to better prices for the
            individual traders (because traditionally market makers add a fee — referred to as spread — for their
            surface)
          </p>

          <p>
            CowSwap allows for coincidence of wants (CoWs) orders to be traded directly against one another. Only the
            excess order amount that cannot be settled directly with other CowSwap traders are sent to the underlying
            AMMs (automated market makers)
          </p>

          <h3 id="how-am-i-protected-from-mev-arbitrage-front-running-sandwiching-with-cowswap">
            How am I protected from MEV (Arbitrage, Front running, Sandwiching) with CowSwap?
          </h3>

          <p>
            CowSwap leverages batch auctions with uniform clearing prices for all trades in the same batch. Because of
            the uniform clearing price, there is no need for ordering the transactions within a single batch. Because
            everyone receives the same price across assets it’s not possible for <b>any</b> value to be extracted by
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
            Finding the best settlement for orders is a challenging task, which very soon may have its own{' '}
            <a href="https://forum.gnosis.io/t/gpv2-road-to-decentralization/1245">decentralized competition</a>.
          </p>

          <h3 id="is-cowswap-secure-to-use">Is CowSwap secure to use?</h3>

          <p>
            CowSwap is in ongoing development, and that is why this is not a beta product but rather a proof-of-concept
            dapp for the community to test and leverage before the final version is released
          </p>

          <p>
            The code has been carefully tested, peer-reviewed and fully{' '}
            <a
              href="https://github.com/gnosis/gp-v2-contracts/blob/main/audits/GnosisProtocolV2May2021.pdf"
              target="_blank"
              rel="noopener noreferrer"
            >
              audited
            </a>
            . Although this can be seen as a step forward in terms of security, it&#39;s recommended to use the protocol
            at <strong>your own risk</strong>.
          </p>
        </Content>
      </Page>

      <Page>
        <Content>
          <h2 id="protocol">Protocol</h2>
          <h3 id="does-cowswap-have-a-token">Does CowSwap have a token?</h3>
          <p>
            There is currently no plan for a CowSwap specific token. At the moment the value is already captured by the
            GNO token, as CowSwap is built on top of Gnosis Protocol. If you are curious about how the value is
            captured, you can <a href="https://forum.gnosis.io/t/gpv2-fee-model/1266"> read this forum post</a>.
          </p>
          <p>
            Be cautious, some people may create fake COW tokens, that are not affiliated with this project. Please note
            that any token listed in any AMM is <strong>NOT</strong> associated with this project in any way, shape or
            form.
          </p>
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
            the cost is already included in your price estimation. The protocol is currently subsidizing a portion of
            the gas costs, while the protocol fee is currently switched off.
          </p>
          <p>
            <strong>
              Note that you will only have to pay fees IF your trade is executed. No more gas-costs on any failed
              transactions!
            </strong>
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
            existing DEX aggregators
          </p>
          <h3 id="how-can-i-become-a-liquidity-provider">How can I become a liquidity provider?</h3>
          <p>
            CowSwap does not have liquidity providers. Instead, it connects to all on-chain liquidity that is provided
            across different protocols. Since orders only incur a cost if traded, active market makers can observe the
            orderbook and place counter orders (creating a CoW) to prevent settling trades via external liquidity.
          </p>
          <h3 id="wallet-not-supported">Why is my wallet not supported?</h3>
          <p>CowSwap uses offline signatures to offer gasless orders.</p>
          <p>
            Currently, Smart Contract (SC) wallets such as Gnosis Safe, Argent or Pillar are not supported because it
            would require signing an on-chain transaction to place the order, making it no longer gasless. We are
            working to make this a possibility and support will be added soon.
          </p>
          <p>
            Nevertheless, even if your wallet is not an SC wallet, it might be unsupported in some cases. Not all
            wallets implement the necessary signing methods from EIP712 standard. If that is the case for you, reach out
            to your wallet developers and ask for it.
          </p>
          <h3 id="what-are-gnosis-protocol-v2-solvers">What are Gnosis Protocol v2 Solvers?</h3>
          <p>
            In GPv2, instead of using a central operator or a constant function market maker to determine trade
            settlements, solvers compete against each other to submit the most optimal batch settlement solution. Each
            time a solver submits a successful batch settlement solution, the protocol rewards them with GNO. Anyone can
            become a solver, although, in order to become one, there are certain requirements:
          </p>
          <ol>
            <li>To become a solver, an Ethereum address needs to deposit a bond of GNO tokens to GnosisDAO.</li>
            <li>
              Once the GNO tokens have been staked (locked up), GnosisDAO has to vote to approve or reject the Ethereum
              address that will identify the solver.
            </li>
            <li>
              Additionally, a solver must have the technical knowledge to create the appropriate batch settlement
              solutions, or take the risk of being slashed by the GnosisDAO for wrongdoing.
            </li>
          </ol>
          <h3 id="what-interactions-can-i-encounter-when-using-Cowswap">
            What interactions can I encounter when using CowSwap?
          </h3>
          <p>
            <strong>Internal CowSwap Operations</strong>
          </p>
          <div id="table-container">
            <table>
              <thead>
                <tr>
                  <th>Action</th>
                  <th>Signed tx (free / gasless)</th>
                  <th>Ethereum tx (costs gas)</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Approve token</td>
                  <td />
                  <td>
                    <span role="img" aria-label="approve token in an ethereum tx and costs gas">
                      ✅
                    </span>
                  </td>
                </tr>
                <tr>
                  <td>Wrap/Unwrap ETH</td>
                  <td />
                  <td>
                    <span role="img" aria-label="wrap/unwrap ETH in an ethereum tx and costs gas">
                      ✅
                    </span>
                  </td>
                </tr>
                <tr>
                  <td>Submit order</td>
                  <td>
                    <span role="img" aria-label="submit order is a signed tx and costs no gas">
                      ✅
                    </span>
                  </td>
                  <td />
                </tr>
                <tr>
                  <td>Cancel order</td>
                  <td>
                    <span role="img" aria-label="cancel order is a signed tx and costs no gas">
                      ✅
                    </span>
                  </td>
                  <td />
                </tr>
              </tbody>
            </table>
          </div>
          <ul>
            <li>
              <p>
                <strong>Approve token</strong> <br />
                One-time-only, required step for being able to sell a token. Afterwards, you will be able to trade the
                token using gasless transactions.
              </p>
            </li>
            <li>
              <p>
                <strong>Wrap ETH</strong> <br />
                Convert native ETH into its ERC20 compatible token form: WETH. Only required if you need to sell ETH.
              </p>
            </li>

            <li>
              <p>
                <strong>Unwrap ETH</strong> <br />
                Convert ERC20 compatible token WETH back into native ETH. Only when you want to manually convert it to
                ETH.
              </p>
            </li>
            <li>
              <p>
                <strong>Submit order (Sign order)</strong> <br />
                Signature of a gasless off-chain order. You define your limit price and expiration date. The order will
                try to be executed using MEV protection against different on-chain liquidity sources or other CowSwap
                users trading in the same block.
              </p>
            </li>
            <li>
              <p>
                <strong>Cancel an order (Sign cancellation)</strong> <br />
                Signature of a gasless off-chain cancellation request. This cancellation is considered
                &ldquo;soft&rdquo; as it might not be placed with enough time for the solvers to take into
                consideration. See more via <ContentLink href={'#can-i-cancel-an-order'}>this FAQ entry</ContentLink>.
              </p>
            </li>
          </ul>
        </Content>
      </Page>

      <Page>
        <Content>
          <h2 id="trading">Trading</h2>

          <h3 id="what-types-of-orders-does-cowswap-support">What types of orders does CowSwap support?</h3>

          <p>At the moment, only limit sell and buy orders (fill-or-kill) are enabled. </p>

          <h3 id="what-token-pairs-does-cowswap-allow-to-trade">What token pairs does CowSwap allow you to trade?</h3>

          <p>
            Any valid ERC20 token pair that does not apply transfer fees, and for which there is some basic liquidity on
            a DEX (like Uniswap or Balancer).
          </p>

          <h3 id="what-token-pairs-does-cowswap-not-allow-to-trade">
            What token pairs does CowSwap NOT allow you to trade?
          </h3>

          <p>
            Unfortunately, CowSwap does not support some tokens. While these tokens implement the typical ERC20
            interface, when calling the transfer and transferFrom methods, the actual amount the receiver will get will
            be smaller than the specified sent amount. This causes problems with CowSwap&apos;s settlement logic which
            expects the received amount (e.g. from a Uniswap interaction) to be fully transferable to the trader.
          </p>

          <h3 id="why-is-cowswap-able-to-offer-gas-free-trades">Why is CowSwap able to offer gas-free trades?</h3>

          <p>
            CowSwap is able to offer gas-free trades because the orders are submitted off-chain via signed messages.
            Once you approve your funds for spending on the dapp, you can submit orders via signed messages that contain
            the trade’s details, such as limit price, amount, timestamp, and so on
          </p>

          <h3 id="do-i-need-eth-to-trade">Do I need ETH to trade?</h3>

          <p>
            For the trade itself you do not need to hold ETH. Although, in order to be able to trade on CowSwap, you
            first need to approve your funds for spending on the dapp<small>*</small>. For that action, you need ETH to
            pay for gas fees. Once you’ve done this, ETH is no longer required as CowSwap charges the fee from the sell
            token
          </p>

          <p>
            <small>
              * In the near future, if you are trying to sell an ERC20 that allows offline approvals, then the ETH
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
              signed has been filled in a batch auction
            </li>
            <li>
              Once the approval has been mined, the next step is to sign a meta-tx in which you will see the parameters
              of the order you are about to place in the CowSwap interface. After that, there&#39;s nothing else to do
            </li>
            <li>
              Once the order is executed, you will see a notification in the CowSwap UI and hear a confirming “Moo”
              sound
            </li>
          </ol>

          <h3 id="can-i-cancel-an-order">Can I cancel an order?</h3>

          <p>Yes! You can request to cancel any order while it is still pending.</p>
          <p>Cancellations, like orders, are free and require no gas to be paid.</p>
          <p>Keep in mind even though the request to cancel an order succeeds, the order might still be executed.</p>
          <p>
            That is because when the offline order cancellation is received, a settlement solution may have already been
            prepared by one of the solvers and sent to the Ethereum network.
          </p>

          <h3 id="why-does-the-ui-dapp-have-a-warning-fees-exceed-from-amount">
            Why does the UI dapp have a warning &ldquo;Fees exceed From amount&rdquo;?
          </h3>

          <p>
            In order for solvers (order settlement solution providers) to be economically viable, they need to take into
            account how much gas they spend executing the settlement transaction. The protocol’s fee ensures that
            solvers are incentivized to include the order in a settlement (similar to how gas is paid on traditional
            DEXes). The fee is directly taken from the sell amount, which therefore has to have a certain minimum size.
          </p>

          <h3 id="why-do-i-need-to-approve-a-token-before-trading">Why do I need to approve a token before trading?</h3>

          <p>
            When an order is executed, the settlement contract withdraws the sell amount from the trader’s token balance
            via the Allowance Manager (for more information read{' '}
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
            trade is successfully executed
          </p>

          <p>
            Furthermore, by splitting the intent to trade (that is token, amount, and limit price) from the actual
            on-chain execution, the protocol can react to on-chain race conditions and, for example, change the trading
            route an order is matched against without requiring the user to submit a new order.
          </p>

          <h3 id="can-i-buy-and-sell-eth-in-cowswap">Can I buy and sell ETH in CowSwap?</h3>

          <p>
            Yes, you can directly place buy and sell orders for ETH. Before the actual order is placed, the UI will
            allow you to wrap and unwrap ETH into WETH without needing to leave the dapp’s UI
          </p>

          <h3 id="why-is-selling-eth-more-troublesome">Why is selling ETH more troublesome?</h3>

          <p>
            CowSwap only operates with ERC20 tokens. ETH is the native Ethereum currency, which is not an ERC20 token.
          </p>

          <p>
            In order to sell ETH, you need to wrap it first to make it ERC20 compatible. Wrapping is done by making an
            ETH deposit into the WETH contract. After doing so, you will get a balance of WETH in the amount of ETH
            previously deposited.
          </p>

          <p>You can withdraw your ETH from the WETH contract at any time, and this is called unwrapping WETH.</p>

          <p>
            Wrapping and unwrapping ETH are simple Ethereum transactions not related to CowSwap, meaning gas costs for
            executing the transactions are involved.
          </p>

          <p>
            Although CowSwap does not allow you to sell ETH directly, it will assist you with the wrapping/unwrapping,
            so you can easily handle ETH/WETH, as needed.
          </p>

          <p>
            While ETH cannot be sold directly, it is possible to directly buy ETH. This is because CowSwap allows you to
            buy WETH and will directly unwrap it for you.
          </p>

          <hr />

          <p>
            Didn&#39;t find an answer? Join the <a href={DISCORD_LINK}>community on Discord</a>
          </p>
          <p>
            We really hope you like CowSwap. If you do,&nbsp;<Link to="/">Milk it!</Link>
            <span role="img" aria-label="glass of milk">
              🥛
            </span>
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
            completely free as it does not require any onchain interaction
          </li>

          <li>
            Calling the CowSwap contract to register onchain that you want to cancel a specific order. In this case the
            cancellation does have a cost as the onchain interaction requires gas fees
          </li>
        </ol>
        */}
        </Content>
      </Page>
    </Wrapper>
  )
}
