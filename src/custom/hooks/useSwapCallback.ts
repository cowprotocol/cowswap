import { SwapCallbackState } from '@src/hooks/useSwapCallback'
import { INITIAL_ALLOWED_SLIPPAGE } from 'constants/index'

// import { useSwapCallback as useSwapCallbackUniswap } from '@src/hooks/useSwapCallback'
import { ChainId, Percent, Trade, TradeType } from '@uniswap/sdk'
import { useActiveWeb3React } from '@src/hooks'
import useENS from '@src/hooks/useENS'
import { useMemo } from 'react'
import useTransactionDeadline from '@src/hooks/useTransactionDeadline'
import { BigNumber } from 'ethers'
import { useAddPendingOrder } from '../state/operator/hooks'
import { AddPendingOrderParams, OrderCreation, OrderID, OrderKind, OrderStatus } from '../state/operator/actions'
import { isAddress, shortenAddress } from '@src/utils'
import { delay } from '../utils/misc'

interface PostOrderParams {
  account: string
  chainId: ChainId
  trade: Trade
  validTo: number
  recipient: string
  recipientAddressOrName: string | null
  addPendingOrder: (order: AddPendingOrderParams) => void
}

const MAX_VALID_TO_EPOCH = BigNumber.from('0xFFFFFFFF').toNumber() // Max uint32 (Feb 07 2106 07:28:15 GMT+0100)
const DEFAULT_APP_ID = 0

type UnsignedOrder = Omit<OrderCreation, 'signature'>

function getSummary(params: PostOrderParams): string {
  const { trade, account, recipient, recipientAddressOrName } = params

  const inputSymbol = trade.inputAmount.currency.symbol
  const outputSymbol = trade.outputAmount.currency.symbol
  const inputAmount = trade.inputAmount.toSignificant(3)
  const outputAmount = trade.outputAmount.toSignificant(3)

  const base = `Swap ${inputAmount} ${inputSymbol} for ${outputAmount} ${outputSymbol}`

  if (recipient === account) {
    return base
  } else {
    const toAddress =
      recipientAddressOrName && isAddress(recipientAddressOrName)
        ? shortenAddress(recipientAddressOrName)
        : recipientAddressOrName

    return `${base} to ${toAddress}`
  }
}

function signOrder(unsignedOrder: UnsignedOrder): string {
  console.log('TODO: Sign order', unsignedOrder)
  // TODO: Mocked, next PR
  return '0xd6741f8031e7a7ea70f1b6c14a71e9d0d7d5aae54c157d8368ad4cabd7279a363955fa169a634469da01010bfefbacc2c1e2e7aaeb0c42049192e6359ed572281b'
}

async function postOrderApi(params: PostOrderParams, signature: string): Promise<OrderID> {
  const { inputAmount } = params.trade
  // TODO: Pretend we call the API
  console.log('TODO: call API and include the signature', signature)

  // Fake a delay
  await delay(3000)

  if (inputAmount.toExact() === '0.1') {
    // Force error for testing
    console.log('[useSwapCallback] Ups, we had a small issue!')
    throw new Error('Mock error: The flux capacitor melted')
  } else {
    // Pretend all went OK
    console.log('[useSwapCallback] Traded successfully!')
    return '123456789'
  }
}

async function postOrder(params: PostOrderParams): Promise<string> {
  const { addPendingOrder, chainId, trade, validTo, account } = params
  const { inputAmount, outputAmount } = trade

  const path = trade.route.path
  const selToken = path[0]
  const buyToken = path[path.length - 1]

  // Prepare order
  const summary = getSummary(params)
  const unsignedOrder: UnsignedOrder = {
    sellToken: selToken.address,
    buyToken: buyToken.address,
    sellAmount: inputAmount.raw.toString(10),
    buyAmount: outputAmount.raw.toString(10),
    validTo,
    appData: DEFAULT_APP_ID, // TODO: Add appData by env var
    feeAmount: '0', // TODO: Get fee
    orderType: trade.tradeType === TradeType.EXACT_INPUT ? OrderKind.SELL : OrderKind.BUY,
    partiallyFillable: false // Always fill or kill
  }
  const signature = signOrder(unsignedOrder)
  const creationTime = new Date().toISOString()

  // Call API
  const orderId = await postOrderApi(params, signature)

  // Update the state
  addPendingOrder({
    chainId,
    id: orderId,
    order: {
      id: orderId,
      owner: account,
      ...unsignedOrder,
      creationTime,
      signature,
      status: OrderStatus.PENDING
    }
    //summary
  })

  console.log('[useSwapCallback] TODO: Add summary also to new pendingOrder', summary)

  return orderId
}

// returns a function that will execute a swap, if the parameters are all valid
// and the user has approved the slippage adjusted input amount for the trade
export function useSwapCallback(
  trade: Trade | undefined, // trade to execute, required
  allowedSlippage: number = INITIAL_ALLOWED_SLIPPAGE, // in bips
  recipientAddressOrName: string | null // the ENS name or address of the recipient of the trade, or null if swap should be returned to sender
): { state: SwapCallbackState; callback: null | (() => Promise<string>); error: string | null } {
  const { account, chainId, library } = useActiveWeb3React()
  const { address: recipientAddress } = useENS(recipientAddressOrName)
  const recipient = recipientAddressOrName === null ? account : recipientAddress

  const validTo = useTransactionDeadline()?.toNumber() || MAX_VALID_TO_EPOCH
  const addPendingOrder = useAddPendingOrder()

  return useMemo(() => {
    if (!trade || !library || !account || !chainId) {
      return { state: SwapCallbackState.INVALID, callback: null, error: 'Missing dependencies' }
    }
    if (!recipient) {
      if (recipientAddressOrName !== null) {
        return { state: SwapCallbackState.INVALID, callback: null, error: 'Invalid recipient' }
      } else {
        return { state: SwapCallbackState.LOADING, callback: null, error: null }
      }
    }

    return {
      state: SwapCallbackState.VALID,
      callback: async function onSwap(): Promise<string> {
        const { executionPrice, inputAmount, nextMidPrice, outputAmount, priceImpact, route, tradeType } = trade

        const slippagePercent = new Percent(allowedSlippage.toString(10), '10000')
        const routeDescription = route.path.map(token => token.symbol || token.name || token.address).join(' → ')

        console.log(
          `[useSwapCallback] Trading ${routeDescription}. Input = ${inputAmount.toExact()}, Output = ${outputAmount.toExact()}, Price = ${executionPrice.toFixed()}, Details: `,
          {
            inputAmount: inputAmount.toExact(),
            outputAmount: outputAmount.toExact(),
            executionPrice: executionPrice.toFixed(),
            validTo,
            maximumAmountIn: trade.maximumAmountIn(slippagePercent).toExact(),
            minimumAmountOut: trade.minimumAmountOut(slippagePercent).toExact(),
            nextMidPrice: nextMidPrice.toFixed(),
            priceImpact: priceImpact.toSignificant(),
            tradeType: tradeType.toString(),
            allowedSlippage,
            slippagePercent: slippagePercent.toFixed() + '%',
            recipient,
            recipientAddressOrName,
            chainId
          }
        )
        return postOrder({
          account,
          chainId,
          trade,
          validTo,
          recipient,
          recipientAddressOrName,
          addPendingOrder
        })
      },
      error: null
    }
  }, [trade, library, account, chainId, recipient, allowedSlippage, recipientAddressOrName, addPendingOrder, validTo])
}
