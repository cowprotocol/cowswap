import { Token } from '@uniswap/sdk-core'

import { Order, OrderStatus, SerializedOrder, addPendingOrder, AddPendingOrderParams } from './actions'
import { OrderClass, OrderKind } from '@cowprotocol/cow-sdk'
import { RADIX_DECIMAL } from 'constants/index'
import { serializeToken } from 'state/user/hooks'
import store from '..'

const randomNumberInRange = (min: number, max: number) => {
  return Math.random() * (max - min) + min
}

// Infinity to not trigger condition
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
    receiver: owner.replace('0x', ''),
    apiAdditionalInfo: undefined,
    class: OrderClass.MARKET,
  }
}

export function generateSerializedOrder(props: GenerateOrderParams): SerializedOrder {
  const order = generateOrder(props)
  return {
    ...order,
    inputToken: serializeToken(order.inputToken),
    outputToken: serializeToken(order.outputToken),
  }
}

// can use to test toast notification and state updates for different order types
export const mockOrderDispatches = {
  ethFlowOrder: () => {
    const id = generateOrderId(orderN)
    const actionParams: AddPendingOrderParams = {
      id,
      chainId: 5,
      order: {
        id,
        owner: '123',
        status: OrderStatus.PENDING,
        creationTime: '2022-10-24T10:44:30.098Z',
        summary: 'Order SELL 4.44 ETH for 1.04 USDC',
        inputToken: {
          chainId: 5,
          address: '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE',
          decimals: 18,
          symbol: 'ETH',
          name: 'Ether',
        },
        outputToken: {
          chainId: 5,
          address: '0xD87Ba7A50B2E7E660f678A895E4B72E7CB4CCd9C',
          decimals: 6,
          symbol: 'USDC',
          name: 'USD Coin',
        },
        sellToken: '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE',
        buyToken: 'D87Ba7A50B2E7E660f678A895E4B72E7CB4CCd9C',
        sellAmount: '4438298998862267400',
        sellAmountBeforeFee: '4438298998862267400',
        buyAmount: '1040872.2954106238',
        validTo: 1666608443.098,
        appData: '1',
        feeAmount: '1000000000000000000',
        kind: OrderKind.SELL,
        partiallyFillable: false,
        signature:
          '1111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111',
        receiver: '123',
        class: OrderClass.MARKET,
      },
    }

    store.dispatch(addPendingOrder(actionParams))
  },
}
