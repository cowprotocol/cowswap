import { PageWithToC } from 'legacy/components/PageWithToC'

import { PageTitle } from 'modules/application/containers/PageTitle'
import { Page, Content } from 'modules/application/pure/Page'

import { useToC } from './hooks'
import { FaqMenu } from './Menu'
import ToC from './ToC'

import { Footer } from '.'

export default function ProtocolFaq() {
  const { toc, faqRef } = useToC()

  return (
    <>
      <PageWithToC ref={faqRef}>
        <PageTitle title="Protocol FAQ" />
        <FaqMenu />
        <Page>
          <ToC toc={toc} name="Protocol FAQ" />
          <Content>
            <h2 id="protocol">Protocol</h2>
            <h3 id="what-is-cowprotocols-s-fee-model">What is CoW Protocol fee model?</h3>
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
            <h3 id="how-does-cowprotocol-connect-to-all-on-chain-liquidity">
              How does CoW Protocol connect to all on-chain liquidity?
            </h3>
            <p>CoW Protocol can connect to all on-chain liquidity as it is a layer on top of all trading venues.</p>
            <p>
              When CoW Protocol does not have enough CoWs (Coincidence of Wants) among the orders available for a batch,
              it taps other AMMs’ liquidity to be able to settle the traders’ orders. CoW Protocol can be connected to
              any on-chain liquidity sources and can therefore enjoy the benefits of concentrating the fragmented
              liquidity across DeFi.
            </p>
            <h3 id="how-is-cowswap-able-to-offer-better-prices-than-aggregators-themselves">
              How is CoW Protocol able to offer better prices?
            </h3>
            <p>
              Before using on-chain liquidity, CoW Protocol tries to find CoWs (Coincidences of Wants) within the set of
              currently valid orders and match them directly with one another. CoWs result in better prices because no
              fee is paid to the liquidity provider (e.g., 0.3% for Uniswap v2). In the case that CoW Swap does not have
              any CoWs, it taps into the DEX that gives the next best price. This results in the same or better
              performance than existing DEX aggregators.
            </p>
            <h3 id="how-can-i-become-a-liquidity-provider">How can I become a liquidity provider?</h3>
            <p>
              CoW Protocol <b>does not</b> have liquidity providers. Instead, it connects to all on-chain liquidity that
              is provided across different protocols. Since orders only incur a cost if traded, active market makers can
              observe the orderbook and place counter orders (creating a CoW) to prevent settling trades via external
              liquidity.
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

            <Footer />
          </Content>
        </Page>
      </PageWithToC>
    </>
  )
}
