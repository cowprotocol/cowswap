import { SwapCallbackState } from '@src/hooks/useSwapCallback'
import { INITIAL_ALLOWED_SLIPPAGE } from 'constants/index'

// import { useSwapCallback as useSwapCallbackUniswap } from '@src/hooks/useSwapCallback'
import { ChainId, Percent, Trade, TradeType } from '@uniswap/sdk'
import { useActiveWeb3React } from '@src/hooks'
import useENS from '@src/hooks/useENS'
import { useMemo } from 'react'
import useTransactionDeadline from '@src/hooks/useTransactionDeadline'
import { BigNumber, Signer } from 'ethers'
import { isAddress, shortenAddress } from '@src/utils'
import { AddPendingOrderParams, OrderCreation, OrderID, OrderStatus } from 'state/orders/actions'
import { useAddPendingOrder } from 'state/orders/hooks'
import { delay } from 'utils/misc'
import { ORDER_KIND_BUY, ORDER_KIND_SELL, signOrder, UnsignedOrder } from 'utils/signatures'

interface PostOrderParams {
  account: string
  chainId: ChainId
  signer: Signer
  trade: Trade
  validTo: number
  recipient: string
  recipientAddressOrName: string | null
  addPendingOrder: (order: AddPendingOrderParams) => void
}

const MAX_VALID_TO_EPOCH = BigNumber.from('0xFFFFFFFF').toNumber() // Max uint32 (Feb 07 2106 07:28:15 GMT+0100)
const DEFAULT_APP_ID = 0

function _getSummary(params: PostOrderParams): string {
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

async function _postOrderApi(order: OrderCreation): Promise<OrderID> {
  const { sellAmount, signature } = order
  // TODO: Pretend we call the API
  console.log('TODO: call API and include the signature', signature, order)

  // Fake a delay
  await delay(3000)

  if (sellAmount === '100000000000000000') {
    // Force error for testing
    console.log('[useSwapCallback] Ups, we had a small issue!')
    throw new Error('Mock error: The flux capacitor melted')
  } else {
    // Pretend all went OK
    console.log('[useSwapCallback] Traded successfully!')
    return '123456789'
  }
}

async function _postOrder(params: PostOrderParams): Promise<string> {
  const { addPendingOrder, chainId, trade, validTo, account, signer } = params
  const { inputAmount, outputAmount } = trade

  const path = trade.route.path
  const selToken = path[0]
  const buyToken = path[path.length - 1]

  // Prepare order
  const summary = _getSummary(params)
  const unsignedOrder: UnsignedOrder = {
    sellToken: selToken.address,
    buyToken: buyToken.address,
    sellAmount: inputAmount.raw.toString(10),
    buyAmount: outputAmount.raw.toString(10),
    validTo,
    appData: DEFAULT_APP_ID, // TODO: Add appData by env var
    feeAmount: '0', // TODO: Get fee
    kind: trade.tradeType === TradeType.EXACT_INPUT ? ORDER_KIND_SELL : ORDER_KIND_BUY,
    // orderType: trade.tradeType === TradeType.EXACT_INPUT ? OrderKind.SELL : OrderKind.BUY,
    partiallyFillable: false // Always fill or kill
  }

  const signature = await signOrder({
    chainId,
    signer,
    order: unsignedOrder
  })
  const creationTime = new Date().toISOString()

  // Call API
  const orderId = await _postOrderApi({
    ...unsignedOrder,
    signature
  })

  // Update the state
  addPendingOrder({
    chainId,
    id: orderId,
    order: {
      ...unsignedOrder,
      id: orderId,
      owner: account,
      creationTime,
      signature,
      status: OrderStatus.PENDING,
      summary
    }
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
        return _postOrder({
          account,
          chainId,
          trade,
          validTo,
          recipient,
          recipientAddressOrName,
          addPendingOrder,
          signer: library.getSigner()
        })
      },
      error: null
    }
  }, [trade, library, account, chainId, recipient, allowedSlippage, recipientAddressOrName, addPendingOrder, validTo])
}
