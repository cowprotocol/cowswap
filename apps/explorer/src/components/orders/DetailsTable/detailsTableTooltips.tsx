export const DetailsTableTooltips = {
  orderID: 'A unique identifier ID for this order.',
  from: 'The account address which signed the order.',
  to: 'The account address which will/did receive the bought amount.',
  hash: 'The onchain settlement transaction for this order. Can be viewed on Etherscan.',
  appData:
    'The AppData hash for this order. It can denote encoded metadata with info on the app, environment and more, although not all interfaces follow the same pattern. Show more will try to decode that information.',
  status: 'The order status is either Open, Filled, Expired or Canceled.',
  hooks: 'Hooks are interactions before/after order execution.',
  submission:
    'The date and time at which the order was submitted. The timezone is based on the browser locale settings.',
  expiration:
    'The date and time at which an order will expire and effectively be cancelled. Depending on the type of order, it may have partial fills upon expiration.',
  execution:
    'The date and time at which the order has been executed. The timezone is based on the browser locale settings.',
  type: (
    <div>
      CoW Protocol supports three type of orders – market, limit and liquidity:
      <ul>
        <li>
          <strong>Market order</strong>: Buy or sell at the current market&apos;s best available price
        </li>
        <li>
          <strong>Limit order</strong>: Buy or sell at an arbitrary price specified by the user
        </li>
        <li>
          <strong>Liquidity order</strong>: A special order type that market makers use to provide liquidity
        </li>
      </ul>
      In addition, orders can either allow or not allow partial execution:
      <ul>
        <li>
          <strong>Fill or kill</strong>: Either the order is fully filled, or not filled at all. Currently all market
          orders are fill or kill.
        </li>
        <li>
          <strong>Partial execution</strong>: The order can be executed partially, as long as the limit price is
          respected. (This could be relevant if a price were to become available for some but not all of an order.)
        </li>
      </ul>
    </div>
  ),
  amount: 'The total sell and buy amount for this order. Sell amount includes the fee.',
  priceLimit:
    'The limit price is the price at which this order shall be (partially) filled, in combination with the specified slippage. The fee is already deducted from the sell amount.',
  priceExecution:
    'The actual price at which this order has been matched and executed, after deducting fees from the amount sold.',
  surplus:
    'The (averaged) surplus for this order. This is the positive difference between the initial limit price and the actual (average) execution price.',
  filled:
    'Indicates what percentage amount this order has been filled and the amount sold/bought. Amount sold includes the fee.',
  fees: 'The amount of fees paid for this order. This will show a progressive number for orders with partial fills. Might take a few minutes to show the final value.',
}
