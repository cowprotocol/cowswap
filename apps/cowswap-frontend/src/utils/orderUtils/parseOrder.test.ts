import { SOLANA_LIMIT_ORDER_PROD_APP_DATA } from '@cowprotocol/common-const'
import { OrderKind, SigningScheme, SupportedChainId } from '@cowprotocol/cow-sdk'
import { Token } from '@cowprotocol/currency'
import { UiOrderType } from '@cowprotocol/types'

import { Order, OrderStatus } from 'legacy/state/orders/actions'

import { getFilledAmounts } from './getFilledAmounts'
import { getUiOrderType } from './getUiOrderType'
import { parseOrder } from './parseOrder'

const wrappedSol = new Token(
  SupportedChainId.SOLANA,
  'So11111111111111111111111111111111111111112',
  9,
  'SOL',
  'Wrapped SOL',
)
const pyUsd = new Token(
  SupportedChainId.SOLANA,
  '2b1kV6DkPAnxd5ixfnxCpjxmKwqjjaYmCZfHsFu24GXo',
  6,
  'PYUSD',
  'PayPal USD',
)

function buildOrder(overrides: Partial<Order> = {}): Order {
  return {
    id: 'solana-order',
    owner: wrappedSol.address,
    status: OrderStatus.PENDING,
    // Solana's order-book returns no `class`, so an order of its that came from the API has none.
    class: undefined,
    kind: OrderKind.SELL,
    inputToken: wrappedSol,
    outputToken: pyUsd,
    sellAmount: '1000000000',
    sellAmountBeforeFee: '1000000000',
    buyAmount: '2000000',
    appData: SOLANA_LIMIT_ORDER_PROD_APP_DATA,
    creationTime: new Date('2026-10-08T09:46:13Z').toISOString(),
    validTo: 1791539173,
    partiallyFillable: false,
    signingScheme: SigningScheme.EIP712,
    apiAdditionalInfo: { executedSellAmount: '0', executedBuyAmount: '0' },
    ...overrides,
  } as unknown as Order
}

describe('parseOrder', () => {
  it('keeps the fee the order was created with', () => {
    expect(parseOrder(buildOrder({ feeAmount: '3000' })).feeAmount).toBe('3000')
  })

  // A Solana order persisted before sdk-order-book started filling the field in: `addOrUpdateOrders`
  // merges onto it without ever overwriting `feeAmount`, so it stays undefined — and
  // `getFilledAmounts` then crashes the order receipt modal on `feeAmount.toString()`.
  it('treats a missing fee as zero', () => {
    const parsedOrder = parseOrder(buildOrder())

    expect(parsedOrder.feeAmount).toBe('0')
    expect(getFilledAmounts(parsedOrder).mainAmount.quotient.toString()).toBe('1000000000')
  })

  // The orders table classifies from the raw order and the receipt modal from the parsed one. With
  // `appData` dropped in between, the two disagreed: the order sat under the limit-orders tab while
  // its receipt read "Undefined sell order".
  it('carries appData through, so a Solana limit order stays classified as one', () => {
    expect(getUiOrderType(parseOrder(buildOrder()))).toBe(UiOrderType.LIMIT)
  })
})
