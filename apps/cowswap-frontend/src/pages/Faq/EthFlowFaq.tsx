import { PageWithToC } from 'legacy/components/PageWithToC'

import { PageTitle } from 'modules/application/containers/PageTitle'
import { Page, Content } from 'modules/application/pure/Page'

import { useToC } from './hooks'
import { FaqMenu } from './Menu'
import { ExternalLinkFaq } from './styled'
import ToC from './ToC'

import { Footer } from '.'

export default function EthFlowFAQ() {
  const { toc, faqRef } = useToC()

  return (
    <>
      <PageWithToC ref={faqRef}>
        <PageTitle title="Selling Native tokens (ETH, xDAI) " />
        <FaqMenu />
        <Page>
          <ToC toc={toc} name="Selling Native tokens (ETH, xDAI) " />
          <Content>
            {/* ------------------------------------Overview-------------------------------------- */}
            <h2 id="overview">Overview</h2>
            <h3 id="what-is-wrapping">But why all this complicated technical stuff, what is wrapping anyway?</h3>
            <p>Fair point. </p>
            <p>
              As you may know, there are multiple different standards for creating tokens: ERC20, ERC721, ERC1155, and
              so on. These types of tokens are the ones that smart contract protocols in DeFi are built to interact
              with. But Ether (ETH), as the native token of the Ethereum blockchain, is not an ERC-standard token itself
              – and is therefore not able to interact with smart contracts directly.
            </p>
            <p>
              The workaround is to “wrap” the native token, ETH, into WETH (which is an ERC20 token) via a special
              contract that mints the token 1:1.
            </p>
            <h3 id="how-is-trading-ETH-different">
              How is trading ETH different from trading other tokens on CoW Protocol?
            </h3>
            <p>
              {' '}
              CoW Protocol settlement contract is only capable of handling ERC20 tokens. To sell ETH, you must therefore
              either wrap ETH into WETH (an ERC20 token) yourself, or let CoW Protocol do it for you. If you choose the
              latter, you must interact with the CoW ETH Flow Contract, which holds and places ETH trade orders on your
              behalf.
            </p>
            <p>
              The CoW ETH Flow Contract is different from the CoW Protocol Settlement Contract. It is an implementation
              of ERC1271 (production and barn) that handles the entire process of approving, wrapping, and creating an
              order on CoW Protocol for the user.
            </p>
            <p>
              Selling ETH is different from selling other tokens on CoW Protocol:{' '}
              <ul>
                <li>ETH is not an ERC20 token</li>
                <li>CoW Protocol can only handle ERC20 tokens, so you need to wrap ETH to trade it</li>
                <li>
                  We created a contract that wraps ETH for you, called the CoW ETH Flow Contract
                  <p>
                    <strong>
                      Note that this contract works differently than how you may be used to interacting with CoW
                      Protocol as it adds an intermediary step where you send your ETH.
                    </strong>
                  </p>
                </li>
              </ul>
            </p>
            <h3 id="how-does-eth-flow-contract-work">
              How does the CoW ETH Flow Contract work? What is this intermediate contract I’m interacting with?
            </h3>
            <p>
              {' '}
              The CoW ETH Flow Contract implements ERC1271, and handles everything needed for the user, such as the
              approval, wrapping, and order placement. All of these are done automatically without the user needing to
              do anything. The trading steps are the following:{' '}
              <ul>
                <li>User places a sell order of ETH </li>
                <li>The ETH leaves the users wallet and goes onto the CoW ETH Flow Contract</li>
                <li>
                  The CoW ETH Flow Contract then creates a ERC1271 smart contract order with the parameters the user
                  specified in the CoW Swap UI
                </li>
                <li>
                  The order is registered in CoW Protocol’s batch auction so that the solvers take it into consideration
                  when settling the batch
                </li>
                <li>
                  If the order can be filled / settled by the solvers, then the settlement contract triggers the
                  execution of the pre-interactions from the CoW ETH Flow Contract that result in selling the ETH and
                  obtaining the user wanted token in return
                </li>
              </ul>
            </p>
            <p>
              For more information on the specifics of each step, check out our detailed article{' '}
              <ExternalLinkFaq href="https://medium.com/@cow-protocol/moooove-over-weth-native-eth-trading-is-now-live-on-cow-protocol-96f107e53a49">
                here
              </ExternalLinkFaq>
              .
            </p>
            <h3 id="what-is-ERC1271-order">What is an ERC1271 order?</h3>
            <p>
              {' '}
              An ERC1271 order is one that is created by a smart contract and signed without the need for a private key.
              This verification scheme allows the contract placing the order to programmatically enforce certain
              behaviors like interacting with protocol, setting order limits, etc.
            </p>
            <p>
              The implementation of ERC1271 into the CoW Protocol Settlement Contract gave it the power to allow smart
              contracts to implement their own signature validation scheme for signing messages. This is what makes the
              native ETH sell flow possible.
            </p>
            <h3 id="why-does-ETH-leave-wallet-before-trade-is-settled">
              Why does my ETH leave my wallet before the trade has settled?
            </h3>
            <p>
              {' '}
              ETH is not an ERC20 token. It is the native token of the Ethereum blockchain. Because ETH is not
              controlled by another smart contract the way ERC20 tokens are, the token cannot interact with smart
              contracts directly itself.
            </p>
            <p>
              In order to allow a user to sell ETH without any additional steps, we needed to create a new contract that
              holds ETH for a short period of time so it can automatically place an order on the user’s behalf.
            </p>
            <h3 id="why-is-transaction-pending-so-long">Why is my transaction pending for so long?</h3>
            <p>
              If your transaction shows &quot;Pending&quot;, it hasn’t been validated yet. This might be because:{' '}
              <ul>
                <li>
                  When submitting your transaction through your wallet, it was sent with a low gas price. The order in
                  which transactions are validated on the blockchain depends on the gas price you set: high gas fee
                  transactions can get validated faster, and low gas fee transactions have to wait longer to get
                  validated. You can check Etherscan for a time estimate on how long your transaction will take to get
                  validated
                </li>
                <li>
                  You have sent multiple transactions at once with your wallet and the first transaction with a low gas
                  price delays the rest
                </li>
              </ul>
            </p>
            <h3 id="what-are-recommanded-gas-prices-for-eth-flow">
              What are the recommended gas prices when trading with the ETH Flow?
            </h3>
            <p>
              {' '}
              We recommend you use the default gas price your wallet provider suggests at the moment of executing the
              transaction. That said – typically – the more gas you pay validators, the faster your transaction is
              validated.
            </p>
            <p>
              Therefore, your CoW ETH sell order is more likely to execute successfully if you pay more gas. That is
              because the faster the order gets settled, the more likely it is that your order will stay within the
              current market prices, and the less likely it is that your order will fail because the market price moved
              against it.
            </p>
            <h3 id="is-it-cheaper-to-wrap-or-directly-trad-eth">
              Is it cheaper overall to wrap first and then trade, or to trade directly with ETH?
            </h3>
            <p>
              Honestly, it depends on what type of CoW you are…{' '}
              <ul>
                <li>
                  If it is your first time using CoW Swap, it will likely be more expensive to wrap ETH. This is because
                  you need to approve ETH (tx cost), wrap ETH (tx cost), and approve WETH (tx cost) before placing the
                  trade. However, for subsequent trades, wrapping should always be cheaper than trading directly with
                  ETH
                </li>
                <li>
                  If you are a diehard CoW Swap fan, and have already gone through all the approval transactions, it is
                  a different story as you only need to execute the wrapping transaction. Trading with WETH will usually
                  be cheaper for you
                </li>
              </ul>
            </p>
            <p>
              The reason native ETH sell flow was developed is because of the demand from the CoWmunity for this
              feature, and in order to allow users to trade more quickly while avoiding extra token approvals. However,
              if you are going to stick around for a while, and if you care about costs, we recommend wrapping your ETH
              instead of trading it directly.
            </p>
            <h3 id="has-contract-been-audited">Has the contract been audited?</h3>
            <p>
              Yes, the CoW Protocol team always takes security very seriously and, as a practice that has continued
              after our spin out from Gnosis DAO, we audit all smart contracts before deploying them.
            </p>
            <p>
              The audit was done by G0 and you can find the result{' '}
              <ExternalLinkFaq href="https://github.com/cowprotocol/ethflowcontract/tree/main/audits">
                here
              </ExternalLinkFaq>
              .
            </p>
            {/* ------------------------------------Trading Questions-------------------------------------- */}
            <h2 id="trading-questions">Trading Questions</h2>
            <h3 id="why-is-default-slippage-set-to-2">
              Why is the default slippage setting set to 2% instead of the usual 0.5% for other tokens?
            </h3>
            <p>
              {' '}
              Unlike for other tokens, the default slippage is set to 2% as there are more intermediate steps in the ETH
              sell process than in any other sell tokens. This slippage is meant to be able to cover the price updates
              that can happen within the market from the time it takes to create the sell order, get the transaction for
              the ETH transfer into the CoW ETH Flow Contract validated, place the order, and have it executed.
            </p>
            <p>
              If there is not enough slippage to account for market shifts within this timeframe, the sell order is most
              likely to fail.
            </p>
            <p>
              As mentioned above, this slippage % has been decided to be the minimum slippage required to be able to
              execute these types of orders.
            </p>
            <p>But don’t worry, if the trade reverts, you always get your trading ETH back.</p>
            <h3 id="what-happens-if-my-order-expires">
              What happens if my order expires or if I cancel? Do I get my ETH back?
            </h3>
            <p> Yes you will ALWAYS get your ETH back if the order is not executed successfully.</p>
            <p>
              If because the order expired or you canceled the transaction, the protocol was not able to execute the ETH
              sell order, the ETH held by the contract on your behalf is returned to your wallet so that it is yours
              again.
            </p>
            <h3 id="do-i-pay-any-sort-of-fee-for-cancelation">
              Do I pay any sort of fee for the cancellation and/or expiration of my order?
            </h3>
            <p>
              {' '}
              If you cancel or your order reverts, CoW Protocol will give your ETH back but the validators will keep the
              validation fee.
            </p>
            <p>
              You do not pay a trading fee to CoW Protocol, however, you do pay a fee to validators. This fee is paid to
              validators when you execute the transactions that transfers the ETH from your wallet, to the CoW ETH Flow
              Contract. This is something CoW Protocol does not control or benefit from – it is part of the way the
              network works.
            </p>
            <h3 id="what-does-sending-tx-in-1st-step-mean">What does sending tx in the 1st step mean? </h3>
            <p>The 1st step that you see in the UI is represented by the first circle of the process.</p>
            <p>
              This circle informs you that the first transaction you do in the CoW ETH Flow process is the one sending
              your ETH to the contract so that it can place the order on your behalf.
            </p>
            <h3 id="what-does-order-crating-mean">
              Once the tx is sent, what does order creating mean (the 2nd step)?
            </h3>
            <p> The 2nd step that you see in the UI is represented by the second circle of the process.</p>
            <p>
              This circle informs you that the transaction with the ETH transfer from the 1st step has been mined, and
              that your order has been placed with the CoW ETH Flow Contract, and a ERC1271 smart order will be created
              and placed on the CoW Protocol Settlement contract.
            </p>
            <h3 id="what-does-order-crated-mean">What does “order is created” mean?</h3>
            <p>
              It means that the CoW ETH Flow Contract has already created the ERC1271 smart order and placed it on the
              settlement contract.
            </p>
            <h3 id="what-does-open-order-mean">What does Open order mean? </h3>
            <p>
              It means that the CoW ETH Flow Contract has successfully created the ERC1271 smart order and placed it on
              the settlement contract. The order is valid, and will eventually get settled by CoW Protocol solvers or
              expire if it is not executed within a timeframe of 3 hours.
            </p>
            <h3 id="what-does-order-is-filled-mean">What does “order is filled” mean?</h3>
            <p>
              It means that your order has been completely filled and executed. You have now sold ETH natively through
              CoW Swap.
            </p>
            <h3 id="what-does-order-expired-mean">What does “order expired” mean? </h3>
            <p>
              It means that your order has not been filled within the 10 minute window enforced. The main reason for
              your order to expire is market volatility, a shift in the price of ETH shifted or that original order
              placed is out of price for a long period of time.
            </p>

            <h3 id="why-is-my-order-being-refunded">Why is my order being refunded after the order expired? </h3>
            <p>
              Since the protocol was not able to execute the ETH sell order within the average time window set, the ETH
              held by the contract on your behalf is returned to your wallet so that it is yours again.
            </p>
            <p>
              This is because on the 1st step of the sell process, your ETH was transferred to the CoW ETH Flow Contract
              and since CoW Protocol is all about self-custody, it is right to return the transferred ETH immediately if
              the order expires.
            </p>

            <h3 id="how-can-i-check-i-received-the-refund-when-expired">
              How can I check I actually received the refund after my order expired?
            </h3>
            <p>
              You can click on the hyperlink “View transaction” on the progress modal which will redirect you to
              etherscan.io to see the actual transaction on the blockchain.
            </p>
            <p>
              You can search for your wallet address on etherscan.io and see that the balance is right where it should
              be.
            </p>
            <p>
              Additionally, you can also check the smart contract interactions via etherscan (
              <ExternalLinkFaq href="https://etherscan.io/address/0x40A50cf069e992AA4536211B23F286eF88752187">
                production
              </ExternalLinkFaq>{' '}
              and{' '}
              <ExternalLinkFaq href="https://etherscan.io/address/0xD02De8Da0B71E1B59489794F423FaBBa2AdC4d93">
                barn
              </ExternalLinkFaq>
              ) and find the one that corresponds to your wallet, although this method may be more cumbersome.
            </p>

            <h3 id="what-does-order-creation-failed-mean">
              What does “order creation failed - price quote expired” mean?{' '}
            </h3>
            <p>
              Even though the CoW ETH Flow Contract successfully received your ETH, the amount of time between when you
              sent the transaction and when it was included in a block was too long.
            </p>
            <p>
              During that time frame, the market price shifted against you, and the CoW ETH Flow Contract was not able
              to place a viable order in CoW Protocol.
            </p>
            <p>
              Not to worry, though, you do get your ETH back when the order does not execute successfully. You are only
              charged a gas fee for executing the transaction that is paid to the validators of Ethereum and not CoW
              Protocol. You can check the status of your refund by clicking on the “Initiating refund” hyperlink under
              the round flag icon.
            </p>

            <h3 id="why-is-my-rder-refunded-after-creation-failed">
              Why is my order being refunded after “order creation failed - expired before creation”?
            </h3>
            <p>
              Because the ETH held by the contract on your behalf is no longer needed since the order creation failed,
              it is returned to your wallet.
            </p>
            <p>
              This is because on the 1st step of the sell process, your ETH was transferred to the CoW ETH Flow Contract
              and since CoW Protocol is all about self-custody, it is right to return the transferred ETH immediately if
              the order expired.
            </p>
            <p>
              While this is operational for the first release, keep in mind that cancellation will NOT ALWAYS be free.
            </p>
            <Footer />
          </Content>
        </Page>
      </PageWithToC>
    </>
  )
}
