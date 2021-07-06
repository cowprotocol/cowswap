import { useEffect, useRef } from 'react'
import { batch } from 'react-redux'
import { Token } from '@uniswap/sdk-core'

import { Order, OrderStatus, OrderKind } from './actions'
import { useActiveWeb3React } from 'hooks/web3'
import { useAddPendingOrder, usePendingOrders, useFulfillOrder } from './hooks'
import { useCombinedActiveList } from 'state/lists/hooks'
import { registerOnWindow } from 'utils/misc'
import { RADIX_DECIMAL } from 'constants/index'

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

const getRandomElementFromArray = <T>(array: T[]): T => {
  const ind = randomIntInRangeExcept(0, array.length - 1)
  return array[ind]
}

const getTwoRandomElementsFromArray = <T>(array: T[]): [T, T] => {
  const ind1 = randomIntInRangeExcept(0, array.length - 1)
  const ind2 = randomIntInRangeExcept(0, array.length - 1, ind1)

  return [array[ind1], array[ind2]]
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

const generateOrder = ({ owner, sellToken, buyToken }: GenerateOrderParams): Order => {
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
    sellToken: sellToken.address.replace('0x', ''), // address, without '0x' prefix
    buyToken: buyToken.address.replace('0x', ''), // address, without '0x' prefix
    sellAmount: sellAmount.toString(RADIX_DECIMAL), // in atoms
    buyAmount: buyAmount.toString(RADIX_DECIMAL), // in atoms
    // 20sec - 4min
    validTo: Date.now() / 1000 + randomIntInRangeExcept(20, 240), // uint32. unix timestamp, seconds, use new Date(validTo * 1000)
    appData: 1, // arbitrary identifier sent along with the order
    feeAmount: (1e18).toString(), // in atoms
    kind,
    partiallyFillable: false,
    // hacky typing..
    signature: (orderN++).toString().repeat(65 * 2), // 65 bytes encoded as hex without `0x` prefix. v + r + s from the spec
    receiver: owner.replace('0x', ''),
  }
}

// add more orders if less than minPendingOrders currently
const useAddOrdersOnMount = (minPendingOrders = 5) => {
  const { account, chainId, library } = useActiveWeb3React()

  const pendingOrders = usePendingOrders({ chainId })

  // ref, so we don't rerun useEffect
  const pendingOrdersRef = useRef(pendingOrders)
  pendingOrdersRef.current = pendingOrders

  const addOrder = useAddPendingOrder()

  const lists = useCombinedActiveList()

  useEffect(() => {
    const addNOrders = (ordersNum: number) => {
      if (!account || !chainId || !library) return
      const tokenMap = lists[chainId]

      const tokenList = Object.values(tokenMap)
      if (tokenList.length === 0) return

      const newTempOrders = Array.from({ length: ordersNum }, () => {
        const [sellToken, buyToken] = getTwoRandomElementsFromArray(tokenList)

        return generateOrder({
          owner: account,
          sellToken: sellToken.token,
          buyToken: buyToken.token,
        })
      })

      batch(() => {
        newTempOrders.forEach((order) => {
          addOrder({ order, id: order.id, chainId })
        })
      })
    }
    registerOnWindow({ addNOrders })

    // don't just keep adding orders when there's already enough pending
    if (pendingOrdersRef.current.length >= minPendingOrders) return

    addNOrders(10)
  }, [account, addOrder, chainId, library, lists, minPendingOrders])
}

const useFulfillOrdersRandomly = (interval = 30000 /* ms */) => {
  const { chainId } = useActiveWeb3React()
  const pendingOrders = usePendingOrders({ chainId })

  // ref, so we don't rerun useEffect
  const pendingOrdersRef = useRef(pendingOrders)
  pendingOrdersRef.current = pendingOrders

  const fulfillOrder = useFulfillOrder()

  useEffect(() => {
    if (!chainId) return

    const fulfillRandomOrder = () => {
      // no more pending orders
      // but don't clearInterval so we can restart when there are new orders
      if (pendingOrdersRef.current.length === 0) return

      const randomOrder = getRandomElementFromArray(pendingOrdersRef.current)

      batch(() => {
        fulfillOrder({ chainId, id: randomOrder.id, fulfillmentTime: new Date().toISOString(), transactionHash: '0x0' })
      })
    }
    registerOnWindow({ fulfillRandomOrder })

    const intervalId = setInterval(fulfillRandomOrder, interval)

    return () => clearInterval(intervalId)
  }, [chainId, fulfillOrder, interval])
}

interface EventUpdaterProps {
  minPendingOrders?: number
}

export function EventUpdater({ minPendingOrders }: EventUpdaterProps): null {
  useAddOrdersOnMount(minPendingOrders)
  useFulfillOrdersRandomly()

  return null
}
