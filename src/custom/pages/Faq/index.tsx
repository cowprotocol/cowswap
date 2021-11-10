import { useCallback, useState } from 'react'
import Page, { Content, Title } from 'components/Page'
import styled from 'styled-components/macro'
import { DISCORD_LINK } from 'constants/index'
import { Link } from 'react-router-dom'
import { ExternalLink as ExternalLinkTheme, StyledInternalLink } from 'theme'
import { LinkScrollable } from 'components/Link'

const ExternalLink = styled(ExternalLinkTheme)``

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
    > div ${ExternalLink}, > p ${ExternalLink}, > p ${StyledInternalLink} {
      color: ${({ theme }) => theme.text1};
      text-decoration: underline;
      font-weight: 400;
      transition: color 0.2s ease-in-out;

      &:hover {
        color: ${({ theme }) => theme.textLink};
      }
    }

    > div > ${ExternalLink} {
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
              <LinkScrollable href={'#' + section.id}>{section.label}</LinkScrollable>
              <ul>
                {items.map((tocItem) => (
                  <li key={tocItem.id}>
                    <LinkScrollable href={'#' + tocItem.id}>{tocItem.label}</LinkScrollable>
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
            CowSwap is a Meta DEX aggregator that allows you to buy and sell tokens using gas-less orders that are
            settled peer-to-peer among its users, or into any on-chain liquidity source while providing MEV protection.
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
            Defined by Phil Daian et al. in the{' '}
            <ExternalLink href="https://arxiv.org/abs/1904.05234" target="_blank" rel="noopener noreferrer">
              {' '}
              paper Flash Boys 2.0{' '}
            </ExternalLink>
            , MEV is a measure of the profit a miner (or validator, sequencer, etc.) can make through their ability to
            arbitrarily include, exclude, or re-order transactions within the blocks they produce.
          </p>

          <p>
            Since January 2020 until now (July&#39;21), the total amount of value extracted by miners (etc.) on Ethereum
            transactions has reached{' '}
            <ExternalLink href="https://explore.flashbots.net/" target="_blank" rel="noopener noreferrer">
              $ 796.8 Million, including successful and failed transactions.
            </ExternalLink>
          </p>

          <h3 id="to-what-does-the-term-coincidence-of-wants-cows-refer">
            To what does the term Coincidence of Wants (CoWs) refer?
          </h3>

          <p>
            <ExternalLink
              href="https://en.wikipedia.org/wiki/Coincidence_of_wants"
              target="_blank"
              rel="noopener noreferrer"
            >
              Coincidence of Wants (CoWs)
            </ExternalLink>{' '}
            can be explained as “an economic phenomenon where two parties each hold an item the other wants, so they
            exchange these items directly.” CowSwap facilitates CoWs among traders and their orders through using batch
            auctions as a core mechanism.
          </p>

          <p>
            This means, on CowSwap, when two traders each hold an asset the other wants, a trade can be settled directly
            between them without an external market maker or liquidity provider. This leads to better prices for the
            individual traders (because traditionally market makers add a fee — referred to as spread — for their
            service).
          </p>

          <p>
            CowSwap allows for coincidence of wants (CoWs) orders to be traded directly against one another. Only the
            excess order amount that cannot be settled directly with other CowSwap traders are sent to the underlying
            AMMs (automated market makers).
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
            <ExternalLink
              href="https://forum.gnosis.io/t/gpv2-road-to-decentralization/1245"
              target="_blank"
              rel="noopener noreferrer"
            >
              decentralized competition
            </ExternalLink>
            .
          </p>

          <h3 id="is-cowswap-secure-to-use">Is CowSwap secure to use?</h3>

          <p>
            As of August 11th, 2021, CowSwap is no longer in alpha and moves to a final, stable version. The underlying
            Gnosis Protocol Smart contracts have been upgraded to integrate tightly with Balancer v2.
          </p>

          <p>
            With this upgrade, CowSwap evolves into its most stable, performant form: the code has been thoroughly and
            carefully tested, peer-reviewed and fully{' '}
            <ExternalLink
              href="https://github.com/gnosis/gp-v2-contracts/blob/main/audits/GnosisProtocolV2May2021.pdf"
              target="_blank"
              rel="noopener noreferrer"
            >
              audited
            </ExternalLink>
            . Whilst CowSwap has taken a major step forward in terms of security and stability, as with other crypto
            protocols or dapps, your use is at your own risk.{' '}
            <strong>
              Please review our{' '}
              <StyledInternalLink to="/terms-and-conditions">
                <strong>Terms and Conditions</strong>
              </StyledInternalLink>
              .
            </strong>
          </p>
        </Content>
      </Page>

      <Page>
        <Content>
          <h2 id="protocol">Protocol</h2>
          <h3 id="does-cowswap-have-a-token">Does CowSwap have a token?</h3>
          <p>
            There is currently no CowSwap specific token, however, the community has expressed it&#39;s desire to
            participate in this exciting project. That is why there is an ongoing discussion in the{' '}
            <ExternalLink href="https://forum.gnosis.io/c/gnosis-protocol" target="_blank" rel="noopener noreferrer">
              Forum
            </ExternalLink>{' '}
            and{' '}
            <ExternalLink href="https://chat.cowswap.exchange" target="_blank" rel="noopener noreferrer">
              Discord
            </ExternalLink>{' '}
            about the possibility of creating one, so make sure your voice is heard!
          </p>
          <p>
            Be cautious, some people may create fake COW tokens, that are not affiliated with this project. Please note
            that any token listed in any AMM is <strong>NOT</strong> associated with this project in any way, shape, or
            form.
          </p>
          <p>
            Follow{' '}
            <ExternalLink href="https://twitter.com/mevprotection" target="_blank" rel="noopener noreferrer">
              @MEVProtection
            </ExternalLink>{' '}
            on Twitter to be up to date!
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
            existing DEX aggregators.
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
            settlements, the protocol uses a party called a &quot;solver&quot;, whom is the party in charge of providing
            the settlement solution to the batch auctions. Solvers compete against each other to submit the most optimal
            batch settlement solution. Each time a solver submits a successful batch settlement solution, the protocol
            rewards them with tokens, meaning that the protocol rewards solvers for solving the batch auction
            optimization problem. By meeting certain requirements, anyone can become a solver:
          </p>
          <ol>
            <li>
              To become a solver, an Ethereum address needs to deposit a bond in the form of tokens. Asset type and
              amounts are pending to be defined by the GnosisDAO or GnosisProtocolDAO.
            </li>
            <li>
              Once the tokens have been staked (locked up), GnosisDAO/GnosisProtocolDAO must vote to approve or reject
              the Ethereum address that will identify the solver. If the vote is successful, the solver Ethereum address
              will be included in the allowlist (verification) solvers contract.
            </li>
            <li>
              Additionally, a solver must have the technical knowledge to create the appropriate batch settlement
              solutions, or take the risk of being slashed by the GnosisDAO/GnosisProtocolDAO for wrongdoing.
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
                consideration. See more via{' '}
                <LinkScrollable href={'#can-i-cancel-an-order'}>this FAQ entry</LinkScrollable>.
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
            the trade’s details, such as limit price, amount, timestamp, and so on.
          </p>

          <h3 id="do-i-need-eth-to-trade">Do I need ETH to trade?</h3>

          <p>
            For the trade itself you do not need to hold ETH. Although, in order to be able to trade on CowSwap, you
            first need to approve your funds for spending on the dapp<small>*</small>. For that action, you need ETH to
            pay for gas fees. Once you’ve done this, ETH is no longer required as CowSwap charges the fee from the sell
            token.
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
              signed has been filled in a batch auction.
            </li>
            <li>
              Once the approval has been mined, the next step is to sign a meta-tx in which you will see the parameters
              of the order you are about to place in the CowSwap interface. After that, there&#39;s nothing else to do.
            </li>
            <li>
              Once the order is executed, you will see a notification in the CowSwap UI and hear a confirming “Moo”
              sound.
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
            via the GPv2 Vault Relayer (for more information read{' '}
            <ExternalLink
              href="https://github.com/gnosis/gp-v2-contracts/blob/main/src/contracts/GPv2VaultRelayer.sol"
              target="_blank"
              rel="noopener noreferrer"
            >
              Smart Contract Architecture
            </ExternalLink>
            ). In order to allow that to happen, the trader must first approve the GPv2 Vault Relayer contract to spend
            tokens on their behalf. The smart contract logic ensures that no token can be spent without deliberately
            signing an order for it.
          </p>

          <h3 id="why-do-i-sign-a-message-instead-of-sending-a-transaction-to-place-an-order">
            Why do I sign a message instead of sending a transaction to place an order?
          </h3>

          <p>
            Signing a message incurs no gas cost and is therefore free. When placing an order, the protocol cannot
            guarantee that the order will be executed (e.g. the price could change to no longer satisfy the specified
            limit). By only signing the intent to trade, we can ensure that users only incur a cost when their trade is
            successfully executed.
          </p>

          <p>
            Furthermore, by splitting the intent to trade (that is token, amount, and limit price) from the actual
            on-chain execution, the protocol can react to on-chain race conditions and, for example, change the trading
            route an order is matched against without requiring the user to submit a new order.
          </p>

          <h3 id="can-i-buy-and-sell-eth-in-cowswap">Can I buy and sell ETH in CowSwap?</h3>

          <p>
            Yes, you can directly place buy and sell orders for ETH. Before the actual order is placed, the UI will
            allow you to wrap and unwrap ETH into WETH without needing to leave the dapp’s UI.
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

      <Page>
        <Content>
          <h2 id="affiliate">Affiliate program</h2>

          <h3 id="what-is-the-profile-page">What is the Profile page?</h3>

          <p>
            It’s a page where you can see your number of trades and volume that you have done with the wallet you have
            connected with.
          </p>

          <p>
            Additionally, you will be able to get your own referral/affiliate link, so you can share it with others, and
            if you do so, you will also be able to see the number of trades and volume that your referral link gets
            credited from the users who followed your link and interacted with the DEX.
          </p>

          <h3 id="in-which-networks-it-is-available">In which networks it&apos;s available?</h3>

          <p>At this time, the affiliate program only works for Ethereum Mainnet.</p>

          <h3 id="are-there-any-rewards-for-sharing-the-referral-link">
            Are there any rewards for sharing the referral link?
          </h3>

          <p>
            The affiliate program will initially run as a trial, and therefore there are currently no announced rewards,
            the tracking however, has already started.
          </p>

          <p>
            The CowSwap team wants to allow users to spread the word of the benefits of our dapp & protocol, while
            tracking the volume they generate and see the impact they have on our cow-mmunity.{' '}
          </p>

          <p>
            CowSwap’s positive network effect scales exponentially with more people using it, therefore, the idea behind
            the affiliate program is to see which users are contributing more to the success of the protocol.
          </p>

          <h3 id="who-can-share-the-referral-link">Who can share the referral link?</h3>

          <p>
            Everyone can share a link, you only need a valid Ethereum wallet address to create your own personal link.
          </p>

          <h3 id="who-can-follow-the-referral-link">Who can follow the referral link?</h3>

          <p>
            Everyone! Please share the excitement for the CowSwap protocol & Dapp. It would really make a difference for
            the Cow-mmunity if you share it with your friends, twitter/youtube followers, or anyone that would be
            interested.
          </p>

          <p>
            Share your referral link with all your friends if you think they can be interested in the qualities Cowswap
            has to offer. These qualities range from ETH-less trading experience, MEV protection, no fees for failed
            transactions, and more.{' '}
            <span role="img" aria-label="cow">
              🐮
            </span>
          </p>

          <p>
            Note that trades and volume will only be credited to your wallet if the user hasn’t traded in CowSwap with
            that address before, and their first trade is done after following your link.
          </p>

          <h3 id="what-is-the-source-of-truth-for-accounting-trade-volume">
            What is the source of truth for accounting trade volume?
          </h3>

          <p>
            The referral program fetches data from Dune, and therefore, the USD value is taken from the information
            available in Dune under price feed. If the token is not in the Dune price feed, then volume will not be
            counted.
          </p>

          <h3 id="why-do-not-i-see-any-referral-trades-in-my-profile-page">
            I shared my referral with a friend, who then also traded. Why don’t I see any referral trades in my profile
            page?
          </h3>

          <p>There could be a few reasons for this:</p>
          <ol>
            <li>
              Your friend was trading tokens that don’t have a price feed available (see FAQ entry{' '}
              <LinkScrollable href={'#why-is-my-total-trade-referral-trade-volume-smaller-than-the-real-volume'}>
                Why is the volume smaller than the real volume?
              </LinkScrollable>
              ).
            </li>
            <li>The data has not yet propagated from the chain to our backend.</li>
            <li>
              Your friend had already traded with that account, which does not count towards referral volume (see FAQ
              entry{' '}
              <LinkScrollable href={'#who-can-follow-the-referral-link'}>
                Who can follow the referral link?
              </LinkScrollable>
              ).
            </li>
          </ol>

          <h3 id="why-is-my-total-trade-referral-trade-volume-smaller-than-the-real-volume">
            Why is my total trade/referral trade volume smaller than the real volume?
          </h3>

          <p>
            Some tokens might not yet have a proper price feed linking them to a USD estimation at the date/time when
            your trade was executed. When that happens the trade volume is set to 0. Thus, your total volume can be
            smaller, or even be shown as 0 (see FAQ entry{' '}
            <LinkScrollable href={'#what-is-the-source-of-truth-for-accounting-trade-volume'}>
              What is the source of truth for accounting trade volume?
            </LinkScrollable>
            ).
          </p>

          <hr />

          <p>
            Didn&#39;t find an answer? Join the{' '}
            <ExternalLink href={DISCORD_LINK} target="_blank" rel="noopener noreferrer">
              community on Discord
            </ExternalLink>
          </p>
          <p>
            We really hope you like CowSwap. If you do,&nbsp;<Link to="/">Milk it!</Link>
            <span role="img" aria-label="glass of milk">
              🥛
            </span>
          </p>
        </Content>
      </Page>
    </Wrapper>
  )
}
