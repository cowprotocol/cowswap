import { useMemo } from 'react'
import { Currency, /* Ether as ETHER, */ Percent, TradeType, CurrencyAmount } from '@uniswap/sdk-core'
import { OrderKind } from '@gnosis.pm/gp-v2-contracts'

import { INITIAL_ALLOWED_SLIPPAGE_PERCENT, NATIVE_CURRENCY_BUY_TOKEN } from 'constants/index'

import { useAddPendingOrder } from 'state/orders/hooks'

import { SwapCallbackState } from '@src/hooks/useSwapCallback'
import useENS from '@src/hooks/useENS'

import { useActiveWeb3React } from 'hooks/web3'
import { useWrapEther } from 'hooks/useWrapEther'

import { computeSlippageAdjustedAmounts } from 'utils/prices'
import { sendOrder } from 'utils/trade'
import TradeGp from 'state/swap/TradeGp'
import { useUserTransactionTTL } from '@src/state/user/hooks'
import { BigNumber } from 'ethers'
import { GpEther as ETHER } from 'constants/tokens'
import { useWalletInfo } from './useWalletInfo'

const MAX_VALID_TO_EPOCH = BigNumber.from('0xFFFFFFFF').toNumber() // Max uint32 (Feb 07 2106 07:28:15 GMT+0100)

function calculateValidTo(deadline: number): number {
  // Need the timestamp in seconds
  const now = Date.now() / 1000
  // Must be an integer
  const validTo = Math.floor(deadline + now)
  // Should not be greater than what the contract supports
  return Math.min(validTo, MAX_VALID_TO_EPOCH)
}

const _computeInputAmountForSignature = (params: {
  input: CurrencyAmount<Currency>
  inputWithSlippage: CurrencyAmount<Currency>
  fee?: CurrencyAmount<Currency>
  kind: OrderKind
}) => {
  const { input, inputWithSlippage, fee, kind } = params
  // When POSTing the order, we need to check inputAmount value depending on trade type
  // If we don't have an applicable fee amt, return the input as is
  if (!fee) return input

  if (kind === OrderKind.SELL) {
    // User SELLING? POST inputAmount as amount with fee applied
    return input
  } else {
    // User BUYING? POST inputAmount as amount with no fee
    return inputWithSlippage.subtract(fee)
  }
}

interface SwapCallbackParams {
  trade?: TradeGp // trade to execute, required
  allowedSlippage?: Percent // in bips
  recipientAddressOrName: string | null // the ENS name or address of the recipient of the trade, or null if swap should be returned to sender
  openTransactionConfirmationModal: () => void
  closeModals: () => void
}

// returns a function that will execute a swap, if the parameters are all valid
// and the user has approved the slippage adjusted input amount for the trade
export function useSwapCallback(params: SwapCallbackParams): {
  state: SwapCallbackState
  callback: null | (() => Promise<string>)
  error: string | null
} {
  const {
    trade,
    allowedSlippage = INITIAL_ALLOWED_SLIPPAGE_PERCENT,
    recipientAddressOrName,
    openTransactionConfirmationModal,
    closeModals,
  } = params
  const { account, chainId, library } = useActiveWeb3React()
  const { allowsOffchainSigning } = useWalletInfo()

  const { address: recipientAddress } = useENS(recipientAddressOrName)
  const recipient = recipientAddressOrName === null ? account : recipientAddress

  const [deadline] = useUserTransactionTTL()
  const addPendingOrder = useAddPendingOrder()
  const { INPUT: inputAmountWithSlippage, OUTPUT: outputAmountWithSlippage } = computeSlippageAdjustedAmounts(
    trade,
    allowedSlippage
  )
  const wrapEther = useWrapEther()

  return useMemo(() => {
    if (!trade || !library || !account || !chainId || !inputAmountWithSlippage || !outputAmountWithSlippage) {
      return { state: SwapCallbackState.INVALID, callback: null, error: 'Missing dependencies' }
    }
    if (!recipient) {
      if (recipientAddressOrName !== null) {
        return { state: SwapCallbackState.INVALID, callback: null, error: 'Invalid recipient' }
      } else {
        return { state: SwapCallbackState.LOADING, callback: null, error: null }
      }
    }

    const isBuyEth = ETHER.onChain(chainId).equals(trade.outputAmount.currency)
    const isSellEth = ETHER.onChain(chainId).equals(trade.inputAmount.currency)

    const sellToken = trade.inputAmount.currency.wrapped
    const buyToken = isBuyEth ? NATIVE_CURRENCY_BUY_TOKEN[chainId] : trade.outputAmount.currency.wrapped

    if (!sellToken || !buyToken || (isSellEth && !wrapEther)) {
      return { state: SwapCallbackState.INVALID, callback: null, error: 'Missing dependencies' }
    }

    return {
      state: SwapCallbackState.VALID,
      callback: async function onSwap(): Promise<string> {
        const {
          executionPrice,
          inputAmount: expectedInputAmount,
          inputAmountWithFee,
          fee,
          outputAmount: expectedOutputAmount,
          tradeType,
        } = trade

        const slippagePercent = allowedSlippage
        const kind = trade.tradeType === TradeType.EXACT_INPUT ? OrderKind.SELL : OrderKind.BUY
        const validTo = calculateValidTo(deadline)

        console.trace(
          `[useSwapCallback] >> Trading ${tradeType} 
            1. Original Input = ${inputAmountWithSlippage.toExact()}
            2. Fee = ${fee?.feeAsCurrency?.toExact() || '0'}
            3. Input Adjusted for Fee = ${inputAmountWithFee.toExact()}
            4. Expected Output = ${expectedOutputAmount.toExact()}
            4b. Output with SLIPPAGE = ${outputAmountWithSlippage.toExact()}
            5. Price = ${executionPrice.toFixed()} 
            6. Details: `,
          {
            expectedInputAmount: expectedInputAmount.toExact(),
            expectedOutputAmount: expectedOutputAmount.toExact(),
            inputAmountEstimated: inputAmountWithSlippage.toExact(),
            outputAmountEstimated: outputAmountWithSlippage.toExact(),
            executionPrice: executionPrice.toFixed(),
            sellToken,
            buyToken,
            validTo,
            isSellEth,
            isBuyEth,
            tradeType: tradeType.toString(),
            allowedSlippage,
            slippagePercent: slippagePercent.toFixed() + '%',
            recipient,
            recipientAddressOrName,
            chainId,
          }
        )

        const wrapPromise = isSellEth && wrapEther ? wrapEther(inputAmountWithSlippage) : undefined

        openTransactionConfirmationModal()

        const postOrderPromise = sendOrder({
          kind,
          account,
          chainId,
          // unadjusted inputAmount
          inputAmount: _computeInputAmountForSignature({
            input: trade.inputAmountWithFee,
            inputWithSlippage: inputAmountWithSlippage,
            fee: trade.fee?.feeAsCurrency,
            kind,
          }),
          // unadjusted outputAmount
          outputAmount: outputAmountWithSlippage,
          // pass Trade feeAmount as raw string or give 0
          feeAmount: fee?.feeAsCurrency,
          sellToken,
          buyToken,
          validTo,
          recipient,
          recipientAddressOrName,
          addPendingOrder,
          signer: library.getSigner(),
          allowsOffchainSigning,
        })
        postOrderPromise.finally(closeModals)

        if (wrapPromise) {
          const wrapTx = await wrapPromise
          console.log('[useSwapCallback] Wrapped ETH successfully. Tx: ', wrapTx)
        }

        return postOrderPromise
      },
      error: null,
    }
  }, [
    trade,
    library,
    account,
    chainId,
    inputAmountWithSlippage,
    outputAmountWithSlippage,
    recipient,
    recipientAddressOrName,
    allowedSlippage,
    deadline,
    wrapEther,
    addPendingOrder,
    openTransactionConfirmationModal,
    closeModals,
    allowsOffchainSigning,
  ])
}
