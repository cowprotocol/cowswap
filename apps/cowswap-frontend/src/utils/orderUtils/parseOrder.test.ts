import { OrderClass, OrderKind, SigningScheme, SupportedChainId } from '@cowprotocol/cow-sdk'
import { Token } from '@cowprotocol/currency'

import { Order, OrderStatus } from 'legacy/state/orders/actions'

import { getFilledAmounts } from './getFilledAmounts'
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

function buildOrder(feeAmount: string | undefined): Order {
  return {
    id: 'solana-order',
    owner: wrappedSol.address,
    status: OrderStatus.PENDING,
    class: OrderClass.LIMIT,
    kind: OrderKind.SELL,
    inputToken: wrappedSol,
    outputToken: pyUsd,
    sellAmount: '1000000000',
    sellAmountBeforeFee: '1000000000',
    buyAmount: '2000000',
    feeAmount,
    creationTime: new Date('2026-10-08T09:46:13Z').toISOString(),
    validTo: 1791539173,
    partiallyFillable: false,
    signingScheme: SigningScheme.EIP712,
    apiAdditionalInfo: { executedSellAmount: '0', executedBuyAmount: '0' },
  } as unknown as Order
}

describe('parseOrder', () => {
  it('keeps the fee the order was created with', () => {
    expect(parseOrder(buildOrder('3000')).feeAmount).toBe('3000')
  })

  // A Solana order persisted before sdk-order-book started filling the field in: `addOrUpdateOrders`
  // merges onto it without ever overwriting `feeAmount`, so it stays undefined — and
  // `getFilledAmounts` then crashes the order receipt modal on `feeAmount.toString()`.
  it('treats a missing fee as zero', () => {
    const parsedOrder = parseOrder(buildOrder(undefined))

    expect(parsedOrder.feeAmount).toBe('0')
    expect(getFilledAmounts(parsedOrder).mainAmount.quotient.toString()).toBe('1000000000')
  })
})
