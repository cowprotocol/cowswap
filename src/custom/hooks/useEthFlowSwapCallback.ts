// eslint-disable-next-line no-restricted-imports
import { NativeCurrency } from '@uniswap/sdk-core'
import { useWeb3React } from '@web3-react/core'
import { SwapCallbackState as EthFlowSwapCallbackState } from 'lib/hooks/swap/useSwapCallback'
import { useMemo } from 'react'

import useENS from '@src/hooks/useENS'

import { OrderKind } from '@cowprotocol/contracts'
import { INITIAL_ALLOWED_SLIPPAGE_PERCENT } from 'constants/index'
import {
  AddEthFlowOrderCallback,
  AddUnserialisedPendingEthFlowOrderParams,
  useAddPendingOrder,
} from 'state/orders/hooks'
import { computeSlippageAdjustedAmounts } from 'utils/prices'
import { useUserTransactionTTL } from 'state/user/hooks'
import { GpEther as ETHER } from 'constants/tokens'
import { useWalletInfo } from './useWalletInfo'
import { useAppData } from 'hooks/useAppData'
import { useAddAppDataToUploadQueue } from 'state/appData/hooks'
import { MAX_VALID_TO_EPOCH, SwapCallbackParams, SwapParams } from './useSwapCallback'
import { EthFlowSwapCallback, useEthFlowOrder } from './useEthFlowOrder'

type EthFlowSwapCallbackParams = SwapCallbackParams
interface EthFlowSwapParams
  extends Omit<SwapParams, 'presignOrder' | 'wrapEther' | 'sellToken' | 'isSellEth' | 'isBuyEth' | 'addPendingOrder'> {
  sellToken: NativeCurrency
  // Callbacks
  ethFlowOrder: EthFlowSwapCallback
  addPendingOrder: AddEthFlowOrderCallback
}

/**
 * Internal swap function that does the actual swap logic.
 *
 * @param params All the required swap dependencies
 * @returns
 */
async function _ethFlowSwap(params: EthFlowSwapParams): Promise<string> {
  const {
    chainId,
    account,
    allowsOffchainSigning,
    provider,

    // Trade details and derived data
    trade,
    slippagePercent,
    inputAmountWithSlippage,
    outputAmountWithSlippage,
    sellToken,
    buyToken,
    recipientAddressOrName,
    recipient,
    appDataHash,

    // Callbacks
    addAppDataToUploadQueue,
    ethFlowOrder,

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

  const kind = OrderKind.SELL
  const validTo = MAX_VALID_TO_EPOCH

  // Log the trade
  console.trace(
    `[useEthFlowSwap]
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
      tradeType: tradeType.toString(),
      slippagePercent: slippagePercent.toFixed() + '%',
      recipient,
      recipientAddressOrName,
      chainId,
    }
  )

  // Show confirmation modal
  openTransactionConfirmationModal()

  const orderToSend = {
    kind,
    account,
    chainId,
    // unadjusted inputAmount
    inputAmount: trade.inputAmountWithFee,
    // unadjusted outputAmount
    outputAmount: outputAmountWithSlippage,
    sellAmountBeforeFee: trade.inputAmountWithoutFee,
    // pass Trade feeAmount as raw string or give 0
    feeAmount: fee?.feeAsCurrency,
    sellToken,
    buyToken,
    validTo,
    recipient,
    recipientAddressOrName,
    signer: provider.getSigner(),
    allowsOffchainSigning,
    appDataHash,
    quoteId: trade.quoteId,
  }

  try {
    // Wait just for the order
    const { txReceipt, order, orderId } = await ethFlowOrder(orderToSend)

    addPendingOrder({ id: orderId, chainId, order })
    addAppDataToUploadQueue(orderId)

    return txReceipt.hash
  } finally {
    // Set appData to be uploaded to IPFS in the background
    closeModals()
  }
}

/**
 * Returns a callback function that will execute the swap (or null if any required param is missing)
 *
 * This callback will return the UID
 *
 * @param params
 * @returns
 */
export function useEthFlowSwapCallback(params: EthFlowSwapCallbackParams): {
  state: EthFlowSwapCallbackState
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
  const { account, chainId, provider } = useWeb3React()
  const { allowsOffchainSigning, gnosisSafeInfo } = useWalletInfo()

  const { address: recipientAddress } = useENS(recipientAddressOrName)
  const recipient = recipientAddressOrName === null ? account : recipientAddress

  const [deadline] = useUserTransactionTTL()

  const appData = useAppData({ chainId, allowedSlippage })
  const { hash: appDataHash } = appData || {}
  const addAppDataToUploadQueue = useAddAppDataToUploadQueue(chainId, appData)

  const addPendingOrder = useAddPendingOrder<AddUnserialisedPendingEthFlowOrderParams>()
  const { INPUT: inputAmountWithSlippage, OUTPUT: outputAmountWithSlippage } = computeSlippageAdjustedAmounts(
    trade,
    allowedSlippage
  )

  const ethFlowOrder = useEthFlowOrder()

  return useMemo(() => {
    if (
      !trade ||
      !provider ||
      !account ||
      !chainId ||
      !inputAmountWithSlippage ||
      !outputAmountWithSlippage ||
      !ethFlowOrder ||
      !appDataHash
    ) {
      return {
        state: EthFlowSwapCallbackState.INVALID,
        callback: null,
        error: 'Missing dependencies',
      }
    }
    if (!recipient) {
      if (recipientAddressOrName !== null) {
        return { state: EthFlowSwapCallbackState.INVALID, callback: null, error: 'Invalid recipient' }
      } else {
        return { state: EthFlowSwapCallbackState.LOADING, callback: null, error: null }
      }
    }

    const sellToken = trade.inputAmount.currency
    const buyToken = trade.outputAmount.currency.wrapped

    const isSellEth = ETHER.onChain(chainId).equals(trade.inputAmount.currency) && sellToken instanceof NativeCurrency
    const isBuyEth = ETHER.onChain(chainId).equals(trade.outputAmount.currency)

    if (isBuyEth || !isSellEth || !sellToken || !buyToken) {
      return {
        state: EthFlowSwapCallbackState.INVALID,
        callback: null,
        error: 'Missing dependencies or not a native currency swap',
      }
    }

    const swapParams: EthFlowSwapParams = {
      chainId,
      account,
      allowsOffchainSigning,
      isGnosisSafeWallet: !!gnosisSafeInfo,
      provider,

      // Trade details and derived data
      trade,
      slippagePercent: allowedSlippage,
      deadline,
      inputAmountWithSlippage,
      outputAmountWithSlippage,
      sellToken,
      buyToken,
      recipientAddressOrName,
      recipient,
      appDataHash,

      // Callbacks
      ethFlowOrder,
      addAppDataToUploadQueue,

      // Ui actions
      addPendingOrder,
      closeModals,
      openTransactionConfirmationModal,
    }

    return {
      state: EthFlowSwapCallbackState.VALID,
      callback: () => _ethFlowSwap(swapParams),
      error: null,
    }
  }, [
    account,
    addPendingOrder,
    addAppDataToUploadQueue,
    allowedSlippage,
    allowsOffchainSigning,
    appDataHash,
    chainId,
    closeModals,
    deadline,
    ethFlowOrder,
    gnosisSafeInfo,
    inputAmountWithSlippage,
    openTransactionConfirmationModal,
    outputAmountWithSlippage,
    provider,
    recipient,
    recipientAddressOrName,
    trade,
  ])
}
