import { RADIX_DECIMAL } from '@cowprotocol/common-const'
import { OrderClass, OrderKind, SigningScheme } from '@cowprotocol/cow-sdk'
import { Token } from '@uniswap/sdk-core'

import { Order, OrderStatus } from './actions'

// TODO: Add proper return type annotation
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
const randomNumberInRange = (min: number, max: number) => {
  return Math.random() * (max - min) + min
}

// Infinity to not trigger condition
// TODO: Add proper return type annotation
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
const randomIntInRangeExcept = (min: number, max: number, exception = Infinity) => {
  let num = Math.floor(randomNumberInRange(min, max))
  // >= because we Math.floor
  if (num >= exception) ++num
  return num
}

interface GenerateOrderParams extends Pick<Order, 'owner'> {
  sellSymbol?: string
  buySymbol?: string
  buyToken: Token
  sellToken: Token
}

// increment for OrderId
let orderN = 1
// TODO: Add proper return type annotation
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
const generateOrderId = (ind: number) => {
  return `OrderId_${ind}_`.padEnd(56 * 2, 'X')
}

export const generateOrder = ({ owner, sellToken, buyToken }: GenerateOrderParams): Order => {
  const sellAmount = randomNumberInRange(0.5, 5) * 10 ** sellToken.decimals // in atoms
  const buyAmount = randomNumberInRange(0.5, 5) * 10 ** buyToken.decimals // in atoms

  const kind = orderN % 2 ? OrderKind.BUY : OrderKind.SELL

  const summary = `Order ${kind.toUpperCase()} ${(sellAmount / 10 ** sellToken.decimals).toFixed(2)} ${
    sellToken.symbol
  } for ${(buyAmount / 10 ** buyToken.decimals).toFixed(2)} ${buyToken.symbol}`

  return {
    id: generateOrderId(orderN), // Unique identifier for the order: 56 bytes encoded as hex without 0x
    owner: owner.replace('0x', ''),
    status: OrderStatus.PENDING,
    creationTime: new Date().toISOString(),
    summary, // for dapp use only, readable by user
    inputToken: sellToken,
    outputToken: buyToken,
    sellToken: sellToken.address?.replace('0x', ''), // address, without '0x' prefix
    buyToken: buyToken.address?.replace('0x', ''), // address, without '0x' prefix
    sellAmount: sellAmount.toString(RADIX_DECIMAL), // in atoms
    sellAmountBeforeFee: sellAmount.toString(RADIX_DECIMAL), // in atoms
    buyAmount: buyAmount.toString(RADIX_DECIMAL), // in atoms
    // 20sec - 4min
    validTo: Date.now() / 1000 + randomIntInRangeExcept(20, 240), // uint32. unix timestamp, seconds, use new Date(validTo * 1000)
    appData: '1', // arbitrary identifier sent along with the order
    feeAmount: (1e18).toString(), // in atoms
    kind,
    partiallyFillable: false,
    // hacky typing..
    signature: (orderN++).toString().repeat(65 * 2), // 65 bytes encoded as hex without `0x` prefix. v + r + s from the spec
    signingScheme: SigningScheme.EIP712,
    receiver: owner.replace('0x', ''),
    apiAdditionalInfo: undefined,
    class: OrderClass.MARKET,
  }
}
