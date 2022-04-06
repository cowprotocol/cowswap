import Page, { Content } from 'components/Page'

import { LinkScrollable } from 'components/Link'
import { Wrapper, ExternalLinkFaq } from './styled'
import { Footer } from '.'
import { useToC } from './hooks'
import ToC from './ToC'
import { FaqMenu } from './Menu'

export default function TokenFaq() {
  const { toc, faqRef } = useToC()

  return (
    <Wrapper ref={faqRef}>
      <FaqMenu />
      <Page>
        <ToC toc={toc} name="Trading FAQ" />
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
            expects the received amount (e.g., from a Uniswap interaction) to be fully transferable to the trader.
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
            pay for gas fees. Once you have done this, ETH is no longer required as CowSwap charges the fee from the
            sell token.
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
              of the order you are about to place in the CowSwap interface. After that, there is nothing else to do.
            </li>
            <li>
              Once the order is executed, you will see a notification in the CowSwap UI and hear a confirming “Moo”
              sound.
            </li>
          </ol>
          <p>
            This workflow applies for normal Ethereum accounts (EOA). For smart contracts, instead of signing a meta-tx
            you would need to do a <LinkScrollable href={'/faq/protocol#what-is-presign'}>pre-sign</LinkScrollable>.
          </p>

          <h3 id="can-i-cancel-an-order">Can I cancel an order?</h3>

          <p>Yes! You can request to cancel any order while it is still pending.</p>
          <p>Cancellations, like orders, are free and require no gas to be paid.</p>
          <p>
            Keep in mind that even though the request to cancel an order succeeds, the order might still be executed.
          </p>
          <p>
            That is because when the offline order cancellation is received, a settlement solution may have already been
            prepared by one of the solvers and sent to the Ethereum network.
          </p>
          <p>
            Alternatively, there is the so-called hard cancellation, which allows to cancel an order on-chain. This is
            not currently supported by the CowSwap web interface, and you would need to pay for the gas of the on-chain
            cancellation. For more information, check the Smart Contract implementation.
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
            via the CoW Protocol Vault Relayer (for more information read{' '}
            <ExternalLinkFaq
              href="https://github.com/gnosis/gp-v2-contracts/blob/main/src/contracts/GPv2VaultRelayer.sol"
              target="_blank"
              rel="noopener noreferrer"
            >
              Smart Contract Architecture
            </ExternalLinkFaq>
            ). In order to allow that to happen, the trader must first approve the CoW Protocol Vault Relayer contract
            to spend tokens on their behalf. The smart contract logic ensures that no token can be spent without
            deliberately signing an order for it.
          </p>

          <h3 id="why-do-i-sign-a-message-instead-of-sending-a-transaction-to-place-an-order">
            Why do I sign a message instead of sending a transaction to place an order?
          </h3>

          <p>
            Signing a message incurs no gas cost and is therefore free. When placing an order, the protocol cannot
            guarantee that the order will be executed (e.g., the price could change to no longer satisfy the specified
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
          <Footer />
        </Content>
      </Page>
    </Wrapper>
  )
}
