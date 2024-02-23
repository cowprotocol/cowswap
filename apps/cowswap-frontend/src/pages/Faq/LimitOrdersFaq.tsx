import { PageWithToC } from 'legacy/components/PageWithToC'

import { PageTitle } from 'modules/application/containers/PageTitle'
import { Content, Page } from 'modules/application/pure/Page'

import { useToC } from './hooks'
import { FaqMenu } from './Menu'
import { ExternalLinkFaq, InternalLinkFaq } from './styled'
import ToC from './ToC'

import { Footer } from '.'

export default function LimitOrderFAQ() {
  const { toc, faqRef } = useToC()

  return (
    <>
      <PageWithToC ref={faqRef}>
        <PageTitle title="Limit orders FAQ" />
        <FaqMenu />
        <Page>
          <ToC toc={toc} name="Limit orders FAQ" />
          <Content>
            <h2 id="limit-orders">Limit orders</h2>

            <h3 id="what-are-limit-orders">What are limit orders?</h3>
            <p>Limit orders are orders to buy or sell tokens at a specified price or better.</p>
            <p>
              A buy limit order allows a trader to specify the maximum price they are willing to pay for a token, while
              a sell limit order allows a trader to specify the minimum price they are willing to sell a token for.
            </p>
            <p>
              Limit orders are different from market orders, which are orders to buy or sell a token at the best
              available price.
            </p>
            <p>
              Limit orders can be useful for traders who want to control the price at which they buy or sell a token.
              For example, a trader who wants to buy a token but is concerned about it going up in price can place a buy
              limit order at a lower price to ensure they get the token at a price they are comfortable with. Similarly,
              a trader who wants to sell a token but is concerned about it going down in price can place a sell limit
              order at a higher price to ensure they get a price they are comfortable with for the token.
            </p>
            <p>
              You can use limit orders to control the price you pay or the price you get – over any time horizon (up to
              one year). Using limit orders is like setting a trap for the price you want.
            </p>

            <h3 id="what-type-of-limit-orders-does-cow-protocol-support">
              What types of limit orders does CoW Protocol support?
            </h3>
            <p>CoW Protocol supports Fill or kill as well as Partially fillable limit orders.</p>
            <p>With Fill or kill, the limit order is either executed in its entirety, or not at all.</p>
            <p>
              With Partially fillable limit orders, meanwhile, the order can be filled gradually as liquidity becomes
              available. Partially fillable orders usually complete faster than Fill or kill orders and also provide
              better prices, so they are the default mechanism used to execute limit orders on CoW Swap. Users can turn
              off Partially fillable limit orders and revert back to Fill or kill through the swap panel settings.
            </p>
            <h3 id="How-can-I-place-a-partially-fillable-limit-order">
              How can I place a partially fillable limit order?
            </h3>
            <p>
              Solvers now support Partially fillable orders, which are enabled by default for all limit order trades.
              Once you place a limit order trade, you will be able to see the % of the order that has been filled
              through your order history panel.
            </p>
            <p>
              If you are interested in building a solver that specializes in Partially-fillable orders, please reach out
              <ExternalLinkFaq href="https://t.me/+60olZD2C2HswMzRh" />.
            </p>
            <h3 id="how-can-I-disable-partially-fillable-limit-orders">
              How can I disable partially fillable limit orders?
            </h3>
            <p>
              Partially fillable limit orders usually provide faster order execution and better prices over Fill or kill
              orders, so they’re the default mechanism for executing limit orders on CoW Swap. If you’d like to turn off
              Partially fillable orders and go back to Fill or kill, you can use the toggle in your swap panel settings.
            </p>
            <h3 id="how-do-fees-work">How do fees work?</h3>
            <p>
              Placing and canceling limit orders is completely free on CoW Protocol. (This is notably not the case for
              all DEXs and DEX aggregators – which often charge for placing orders, canceling orders, or both.) CoW
              Protocol does, however, take a fee when your order is executed. This fee covers transaction fees for the
              liquidity pools your order is sourced from. CoW Protocol takes no fee for itself.
            </p>
            <p>
              Fees are taken from the surplus CoW Protocol generates for your order – that is, by executing your order
              at a better price than your limit price. CoW Protocol is capable of finding much better prices than are
              otherwise available due to its unique batch auction mechanism; in situations where it can't find a better
              price, it will wait until the market price is sufficient to cover both your limit price and the network
              fees. This means that your order may not execute exactly when the market price hits your limit price.
            </p>
            <p>
              For example, if you place a limit order to buy 10 ETH for $10,000 and network fees are $5, the market
              price of ETH would need to hit ~$999.50 for the trade to go through. BUT, if we find a full CoW when the
              market price of ETH hits $1000, CoW Swap will save you $30 in AMM fees (assuming a 0.3% AMM swap fee on
              UniV2), take the $5 in network fees from that $30, and give you 10.0125 ETH (a nice surplus of 0.0125 ETH
              more than you initially expected to get).
            </p>
            <p>
              CoW Swap's unique fee model for limit orders ensures that you will always get the token amount you ordered
              at the limit price you set – or better.
            </p>

            <h3 id="do-i-really-not-pay-fees-for-placing-limit-orders">
              Do I really not pay fees for placing limit orders?{' '}
            </h3>
            <p>Yes. Placing a limit order with CoW Protocol is completely FREE.</p>

            <h3 id="do-i-really-not-pay-fees-for-canceling-limit-orders">
              Do I really not pay fees for canceling limit orders?
            </h3>
            <p>Yes. Canceling a limit order with CoW Protocol is completely FREE.</p>

            <h3 id="what-if-my-limit-order-reverts-or-expires">What if my limit order reverts or expires?</h3>
            <p>
              Limit orders placed through CoW Protocol cannot revert. You therefore don't need to pay fees for reverted
              orders. If an order expires, you won't pay for that either.
            </p>

            <h3 id="so-i-can-shamelessly-place-a-bunch-of-orders">
              So I can shamelessly place a bunch of orders, cancel them, and do it again without fear of being charged
              until my orders go through?
            </h3>
            <p>Yes. Exactly.</p>
            <p>Thanks to multiple cancellations, you can even cancel several orders with a single click. </p>

            <h3 id="do-my-funds-get-locked">Do my funds get locked when I place a limit order?</h3>
            <p>No. You can place many orders at once, no matter what balance you hold in your wallet.</p>
            <p>
              CoW Protocol fills your orders as they hit their limit prices, and stops filling them once you run out of
              the relevant tokens in your wallet.{' '}
            </p>
            <p>
              If you have outstanding orders but not enough balance to cover them, your orders will become fillable the
              moment you top up your wallet balance – and, if the limit price you set is available when you top up your
              balance, your order will be executed immediately.
            </p>

            <h3 id="who-is-the-counterparty">Who is the counterparty in CoW Protocol's limit orders?</h3>
            <p>
              Limit orders on CoW Protocol don't need a counterparty to function properly. CoW Protocol – through its
              decentralized network of solvers – sources liquidity from AMMs, DEX aggregators, private market makers,
              and other CoW Protocol users. As soon as a solver is able to find an execution path that meets the
              conditions of a limit order, CoW Protocol will execute the order.
            </p>

            <h3 id="what-does-surplus-capturing-limit-orders-mean">What does “surplus-capturing limit orders” mean?</h3>
            <p>
              CoW Protocol's limit orders are different from all other DeFi limit orders because they are
              surplus-capturing.
            </p>
            <p>
              Surplus-capturing means that the protocol tries to improve prices even more than what users expect when
              they place their limit orders. CoW Protocol can do this by matching{' '}
              <ExternalLinkFaq href="https://docs.cow.fi/cow-protocol/concepts/how-it-works/coincidence-of-wants">
                Coincidences of Wants
              </ExternalLinkFaq>{' '}
              within batches, and by capturing favorable price movements between the time orders are sent and the time
              they are settled on-chain.
            </p>
            <p>
              For example, if you have an outstanding limit order to buy ETH at $1000 and the price drops from $1005 to
              $995 between two blocks, you will only pay $995 (giving you a $5 surplus per ETH). On any other exchange
              your limit order will be matched at the original $1000 price.
            </p>

            <h3 id="how-will-i-know-when-my-order-is-filled">How will I know when my order is filled?</h3>
            <p>
              If you trade through CoW Swap, and your limit order fills while you have the dApp open, a cheerful MOOOO
              sound will play to let you know when your order is filled.
            </p>
            <p>
              If you miss the MOOOO sound, you can always check your order history in{' '}
              <InternalLinkFaq to="/limit">CoW Swap</InternalLinkFaq> and in the{' '}
              <ExternalLinkFaq href="https://explorer.cow.fi">CoW Explorer</ExternalLinkFaq>.
            </p>

            <h3 id="why-isnt-my-order-getting-filled">
              Why isn't my order getting filled when the market price hits my limit price?
            </h3>
            <p>
              There are a few possible reasons for this:
              <ul>
                <li>
                  Though the market price reached your limit price, there wasn't enough liquidity to fill your order.
                  For Fill or kill orders, if there isn't enough liquidity to fill an order completely, the order won't
                  get filled at all. Limit orders now also support Partially fillable orders, which mitigates this risk
                  substantially.
                </li>
                <li>
                  CoW Swap covers fees on limit orders by executing the order at a slightly better price than the limit
                  price. If the market price hit your limit price exactly but did not exceed it, CoW Swap would not be
                  able to cover your fee and your order would not execute.
                </li>
              </ul>
            </p>

            <h3 id="why-do-i-see-orders-i-didnt-place">
              Why do I see orders I didn't place in my limit order history?
            </h3>
            <p>
              The order history panel visible in the limit orders tab of CoW Swap shows both limit orders and market
              orders. This is so you can have a full picture of your recent trading activity while placing your limit
              orders.
            </p>

            <h3 id="why-cant-i-trade-eth">Why can't I trade ETH?</h3>
            <p>
              You can't trade ETH directly because ETH is not an ERC-20 token. Limit orders on CoW Protocol currently
              only work for ERC-20 tokens. If you wish to sell ETH using limit orders on CoW Protocol, you can wrap your
              ETH and place the limit order with WETH.
            </p>

            <h3 id="why-did-my-limit-order-expire">Why did my limit order expire?</h3>
            <p>
              Your limit order expired because the time limit you set when you placed your order expired. Unfortunately,
              the market price you tried to achieve was not available while your order was live.
            </p>
            <p>
              But you can try again :-). The expired order did not cost you anything and placing orders is free of
              charge!
            </p>
            <h3 id="why-did-the-cow-go-to-outer-space">Why did the cow go to outer space?</h3>
            <p>Because he wanted to see the moooooo-n.</p>
            <Footer />
          </Content>
        </Page>
      </PageWithToC>
    </>
  )
}
