import { Page, Content } from 'modules/application/pure/Page'
import { LinkScrollable } from 'components/Link'

import { ExternalLinkFaq, Wrapper } from './styled'
import { Footer } from '.'
import { useToC } from './hooks'
import ToC from './ToC'
import { FaqMenu } from './Menu'
import { PageTitle } from 'modules/application/containers/PageTitle'

// AmplitudeAnalytics
import { PageName } from 'components/AmplitudeAnalytics/constants'
import { Trace } from 'components/AmplitudeAnalytics/Trace'

export default function ProtocolFaq() {
  const { toc, faqRef } = useToC()

  return (
    <Trace page={PageName.FAQ_PROTOCOL_PAGE} shouldLogImpression>
      <Wrapper ref={faqRef}>
        <PageTitle title="Protocol FAQ" />
        <FaqMenu />
        <Page>
          <ToC toc={toc} name="Protocol FAQ" />
          <Content>
            <h2 id="protocol">Protocol</h2>
            <h3 id="what-is-cowswap-s-fee-model">What is CoW Swap’s fee model?</h3>
            <p>
              Each executed order has a fee which is captured by the protocol. Part of the fee is paid to solvers
              (entities which provide order settlement solutions) to incentivize their participation.
            </p>
            <p>
              The fee consists of the &quot;base cost to execute the trade&quot; and the &quot;protocol fee&quot;
              (although it is only exposed to the user as one fee). As a user, you are only signing a message to submit
              your trade and the underlying solver will end up submitting the transaction for you. Essentially you are
              paying this &quot;base cost to execute the trade&quot;, aka &quot;gas costs&quot;, with your sell token
              and the cost is already included in your price estimation. The protocol is currently subsidizing a portion
              of the gas costs, while the protocol fee is currently switched off.
            </p>
            <p>
              <strong>
                Note that you will only have to pay fees IF your trade is executed. No more gas costs on any failed
                transactions!
              </strong>
            </p>
            <h3 id="how-does-cowswap-connect-to-all-on-chain-liquidity">
              How does CoW Swap connect to all on-chain liquidity?
            </h3>
            <p>CoW Swap can connect to all on-chain liquidity.</p>
            <p>
              When CoW Swap does not have enough CoWs (Coincidence of Wants) among the orders available for a batch, it
              taps other AMMs’ liquidity to be able to settle the traders’ orders. CoW Protocol can be connected to any
              on-chain liquidity sources and can therefore enjoy the benefits of concentrating the fragmented liquidity
              across decentralized finance.
            </p>
            <h3 id="how-is-cowswap-able-to-offer-better-prices-than-aggregators-themselves">
              How is CoW Swap able to offer better prices?
            </h3>
            <p>
              Before using on-chain liquidity, CoW Swap tries to find CoWs (Coincidences of Wants) within the set of
              currently valid orders and match them directly with one another. CoWs result in better prices because no
              fee is paid to the liquidity provider (e.g., 0.3% for Uniswap v2). In the case that CoW Swap does not have
              CoWs, it taps into the DEX that gives the next best price. This results in the same or better performance
              than existing DEX aggregators.
            </p>
            <h3 id="how-can-i-become-a-liquidity-provider">How can I become a liquidity provider?</h3>
            <p>
              CoW Swap does not have liquidity providers. Instead, it connects to all on-chain liquidity that is
              provided across different protocols. Since orders only incur a cost if traded, active market makers can
              observe the orderbook and place counter orders (creating a CoW) to prevent settling trades via external
              liquidity.
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
              with off-chain signing. Thus, you might find your wallet is not supported. If that is the case for you,
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
              In the future, the protocol might provide{' '}
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
            <h3 id="what-are-gnosis-protocol-v2-solvers">What are CoW Protocol&apos;s Solvers?</h3>
            <p>
              In CoW Protocol, instead of using a central operator or a constant function market maker to determine
              trade settlements, the protocol uses a party called a &quot;solver&quot;, who is the party in charge of
              providing the settlement solution to the batch auctions. Solvers compete against each other to submit the
              best possible batch settlement solution. Each time a solver submits a successful batch settlement
              solution, the protocol rewards them with tokens, meaning that the protocol rewards solvers for solving the
              batch auction optimization problem. By meeting certain requirements, anyone can become a solver:
            </p>
            <ol>
              <li>
                To become a solver, an Ethereum address needs to deposit a bond in the form of tokens. Asset type and
                amounts are pending to be defined by the CoW DAO.
              </li>
              <li>
                Once the tokens have been staked (locked up), CoW DAO must vote to approve or reject the Ethereum
                address that will identify the solver. If the vote is successful, the solver Ethereum address will be
                included in the allowlist (verification) solvers contract.
              </li>
              <li>
                Additionally, a solver must have the technical knowledge to create the appropriate batch settlement
                solutions, or take the risk of being slashed by the CoW DAO for wrongdoing.
              </li>
            </ol>
            <h3 id="what-interactions-can-i-encounter-when-using-Cowswap">
              What interactions can I encounter when using CoW Swap?
            </h3>
            <p>
              <strong>CoW Swap Operations</strong>
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
                  Signature of a gasless off-chain order. You define your limit price and expiration date. The order
                  will try to be executed using MEV protection against different on-chain liquidity sources or other CoW
                  Swap users trading in the same block.
                </p>
              </li>
              <li>
                <p>
                  <strong>Cancel an order (Sign cancellation)</strong> <br />
                  Signature of a gasless off-chain cancellation request. This cancellation is considered
                  &ldquo;soft&rdquo; as it might not be placed with enough time for the solvers to take into
                  consideration. See more via{' '}
                  <LinkScrollable href={'/faq/trading#can-i-cancel-an-order'}>this FAQ entry</LinkScrollable>.
                </p>
              </li>
            </ul>

            <p>
              <strong>Smart contracts</strong>
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
                    <td>Pre-sign</td>
                    <td />
                    <td>
                      <span role="img" aria-label="pre-sign order in an ethereum tx and costs gas">
                        ✅
                      </span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
            <ul>
              <li>
                <p>
                  <strong>Pre-sign order</strong> <br />
                  Alternative signing method offered by the protocol to allow Smart Contract integration. See{' '}
                  <LinkScrollable href={'/faq/protocol#smart-contract-support'}>
                    Smart Contract support
                  </LinkScrollable>{' '}
                  for more information.
                </p>
              </li>
            </ul>
            <Footer />
          </Content>
        </Page>
      </Wrapper>
    </Trace>
  )
}
