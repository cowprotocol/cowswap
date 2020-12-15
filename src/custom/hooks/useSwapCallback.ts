import { SwapCallbackState } from '@src/hooks/useSwapCallback'
import { INITIAL_ALLOWED_SLIPPAGE } from 'constants/index'

// import { useSwapCallback as useSwapCallbackUniswap } from '@src/hooks/useSwapCallback'
import { Percent, Trade } from '@uniswap/sdk'
import { useActiveWeb3React } from '@src/hooks'
import useENS from '@src/hooks/useENS'
import { useMemo } from 'react'
import useTransactionDeadline from '@src/hooks/useTransactionDeadline'
import { BigNumber } from 'ethers'

import { useAddPendingOrder } from 'state/orders/hooks'
import { postOrder } from '../utils/trade'

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
          addPendingOrder,
          signer: library.getSigner()
        })
      },
      error: null
    }
  }, [trade, library, account, chainId, recipient, allowedSlippage, recipientAddressOrName, addPendingOrder, validTo])
}
