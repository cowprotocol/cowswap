import { useMemo } from 'react'
import { Currency, /* Ether as ETHER, */ Percent, TradeType, CurrencyAmount, Token } from '@uniswap/sdk-core'
import { OrderKind } from '@gnosis.pm/gp-v2-contracts'

import { INITIAL_ALLOWED_SLIPPAGE_PERCENT, NATIVE_CURRENCY_BUY_TOKEN } from 'constants/index'

import { AddOrderCallback, AddUnserialisedPendingOrderParams, useAddPendingOrder } from 'state/orders/hooks'

import { SwapCallbackState } from '@src/hooks/useSwapCallback'
import useENS from '@src/hooks/useENS'

import { useActiveWeb3React } from 'hooks/web3'
import { useWrapEther, Wrap } from 'hooks/useWrapEther'

import { computeSlippageAdjustedAmounts } from 'utils/prices'
import { signAndPostOrder } from 'utils/trade'
import TradeGp from 'state/swap/TradeGp'
import { useUserTransactionTTL } from '@src/state/user/hooks'
import { BigNumber } from 'ethers'
import { GpEther as ETHER } from 'constants/tokens'
import { useWalletInfo } from './useWalletInfo'
import { usePresignOrder, PresignOrder } from 'hooks/usePresignOrder'
import { Web3Provider } from '@ethersproject/providers'

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

interface SwapParams {
  chainId: number
  account: string
  allowsOffchainSigning: boolean
  isGnosisSafeWallet: boolean
  library: Web3Provider

  // Trade details and derived data
  trade: TradeGp
  slippagePercent: Percent // in bips
  deadline: number
  inputAmountWithSlippage: CurrencyAmount<Currency>
  outputAmountWithSlippage: CurrencyAmount<Currency>
  sellToken: Token
  buyToken: Token
  isSellEth: boolean
  isBuyEth: boolean
  recipientAddressOrName: string | null
  recipient: string

  // Callbacks
  wrapEther: Wrap | null
  presignOrder: PresignOrder

  // Ui actions
  addPendingOrder: AddOrderCallback
  openTransactionConfirmationModal: () => void
  closeModals: () => void
}

/**
 * Internal swap function that does the actually swap logic.
 *
 * @param params All the required swap dependencies
 * @returns
 */
async function _swap(params: SwapParams): Promise<string> {
  const {
    chainId,
    account,
    allowsOffchainSigning,
    isGnosisSafeWallet,
    library,

    // Trade details and derived data
    trade,
    slippagePercent,
    deadline,
    inputAmountWithSlippage,
    outputAmountWithSlippage,
    sellToken,
    buyToken,
    isSellEth,
    isBuyEth,
    recipientAddressOrName,
    recipient,

    // Callbacks
    wrapEther,
    presignOrder,

    // Ui actions
    addPendingOrder,
    openTransactionConfirmationModal,
    closeModals,
  } = params

  const {
    executionPrice,
    inputAmount: expectedInputAmount,
    inputAmountWithFee,
    fee,
    outputAmount: expectedOutputAmount,
    tradeType,
  } = trade

  const kind = trade.tradeType === TradeType.EXACT_INPUT ? OrderKind.SELL : OrderKind.BUY
  const validTo = calculateValidTo(deadline)

  // Log the trade
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
      slippagePercent: slippagePercent.toFixed() + '%',
      recipient,
      recipientAddressOrName,
      chainId,
    }
  )

  // Wrap ETH if necessary
  const wrapPromise = isSellEth && wrapEther ? wrapEther(inputAmountWithSlippage) : undefined

  // Show confirmation modal
  openTransactionConfirmationModal()

  // Post order
  const postOrderPromise = signAndPostOrder({
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
    signer: library.getSigner(),
    allowsOffchainSigning,
  })

  let pendingOrderParams: AddUnserialisedPendingOrderParams

  // Wait for promises, and close modals
  try {
    if (wrapPromise) {
      // Wait for order and the wrap
      const [orderAux, wrapTx] = await Promise.all([postOrderPromise, wrapPromise])
      console.log('[useSwapCallback] Wrapped ETH successfully. Tx: ', wrapTx)
      pendingOrderParams = orderAux
    } else {
      // Wait just for the order
      pendingOrderParams = await postOrderPromise
    }
  } finally {
    closeModals()
  }

  const { id: orderId, order } = pendingOrderParams

  // Send pre-sign transaction, if necessary
  let presignGnosisSafeTxHash: string | undefined
  if (!allowsOffchainSigning) {
    const presignTx = await presignOrder(orderId)
    console.log('Pre-sign order has been sent with: ', pendingOrderParams, presignTx)

    if (isGnosisSafeWallet) {
      presignGnosisSafeTxHash = presignTx.hash
    }
  }

  // Update the state with the new pending order
  addPendingOrder({
    id: orderId,
    chainId,
    order: {
      ...order,
      presignGnosisSafeTxHash,
    },
  })

  return orderId
}

// returns a function that will execute a swap, if the parameters are all valid
// and the user has approved the slippage adjusted input amount for the trade

/**
 * Returns a callback function that will execute the swap (or null if any required param is missing)
 *
 * This callback will return the UID
 *
 * @param params
 * @returns
 */
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
  const { allowsOffchainSigning, gnosisSafeInfo } = useWalletInfo()

  const { address: recipientAddress } = useENS(recipientAddressOrName)
  const recipient = recipientAddressOrName === null ? account : recipientAddress

  const [deadline] = useUserTransactionTTL()
  const addPendingOrder = useAddPendingOrder()
  const { INPUT: inputAmountWithSlippage, OUTPUT: outputAmountWithSlippage } = computeSlippageAdjustedAmounts(
    trade,
    allowedSlippage
  )
  const wrapEther = useWrapEther()
  const presignOrder = usePresignOrder()

  return useMemo(() => {
    if (
      !trade ||
      !library ||
      !account ||
      !chainId ||
      !inputAmountWithSlippage ||
      !outputAmountWithSlippage ||
      !presignOrder
    ) {
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

    const swapParams: SwapParams = {
      chainId,
      account,
      allowsOffchainSigning,
      isGnosisSafeWallet: !!gnosisSafeInfo,
      library,

      // Trade details and derived data
      trade,
      slippagePercent: allowedSlippage,
      deadline,
      inputAmountWithSlippage,
      outputAmountWithSlippage,
      sellToken,
      buyToken,
      isBuyEth,
      isSellEth,
      recipientAddressOrName,
      recipient,

      // Callbacks
      wrapEther,
      presignOrder,

      // Ui actions
      addPendingOrder,
      closeModals,
      openTransactionConfirmationModal,
    }

    return {
      state: SwapCallbackState.VALID,
      callback: () => _swap(swapParams),
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
    allowsOffchainSigning,
    gnosisSafeInfo,
    wrapEther,
    addPendingOrder,
    openTransactionConfirmationModal,
    closeModals,
    presignOrder,
  ])
}
