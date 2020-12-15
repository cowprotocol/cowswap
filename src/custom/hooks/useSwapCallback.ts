import { SwapCallbackState } from '@src/hooks/useSwapCallback'
import { INITIAL_ALLOWED_SLIPPAGE } from 'constants/index'

// import { useSwapCallback as useSwapCallbackUniswap } from '@src/hooks/useSwapCallback'
import { Percent, Trade, TradeType } from '@uniswap/sdk'
import { useActiveWeb3React } from '@src/hooks'
import useENS from '@src/hooks/useENS'
import { useMemo } from 'react'
import useTransactionDeadline from '@src/hooks/useTransactionDeadline'
import { BigNumber } from 'ethers'

import { useAddPendingOrder } from 'state/orders/hooks'
import { postOrder } from '../utils/trade'
import { computeSlippageAdjustedAmounts } from '@src/utils/prices'
import { OrderKind } from '../utils/signatures'

const MAX_VALID_TO_EPOCH = BigNumber.from('0xFFFFFFFF').toNumber() // Max uint32 (Feb 07 2106 07:28:15 GMT+0100)

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
  const { INPUT: inputAmount, OUTPUT: outputAmount } = computeSlippageAdjustedAmounts(trade, allowedSlippage)

  return useMemo(() => {
    if (!trade || !library || !account || !chainId || !inputAmount || !outputAmount) {
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
        const {
          executionPrice,
          inputAmount: expectedInputAmount,
          nextMidPrice,
          outputAmount: expectedOutputAmount,
          priceImpact,
          route,
          tradeType
        } = trade
        const path = route.path
        const sellToken = path[0]
        const buyToken = path[path.length - 1]

        const slippagePercent = new Percent(allowedSlippage.toString(10), '10000')
        const routeDescription = route.path.map(token => token.symbol || token.name || token.address).join(' → ')
        const kind = trade.tradeType === TradeType.EXACT_INPUT ? OrderKind.SELL : OrderKind.BUY

        console.log(
          `[useSwapCallback] Trading ${routeDescription}. Input = ${inputAmount.toExact()}, Output = ${outputAmount.toExact()}, Price = ${executionPrice.toFixed()}, Details: `,
          {
            expectedInputAmount: expectedInputAmount.toExact(),
            expectedOutputAmount: expectedOutputAmount.toExact(),
            inputAmountEstimated: inputAmount.toExact(),
            outputAmountEstimated: outputAmount.toExact(),
            executionPrice: executionPrice.toFixed(),
            sellToken,
            buyToken,
            validTo,
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
          kind,
          account,
          chainId,
          inputAmount,
          outputAmount,
          sellToken,
          buyToken,
          validTo,
          recipient,
          recipientAddressOrName,
          addPendingOrder,
          signer: library.getSigner()
        })
      },
      error: null
    }
  }, [
    trade,
    library,
    account,
    chainId,
    recipient,
    allowedSlippage,
    recipientAddressOrName,
    addPendingOrder,
    validTo,
    inputAmount,
    outputAmount
  ])
}
