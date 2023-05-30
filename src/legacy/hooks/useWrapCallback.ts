import { BigNumber } from '@ethersproject/bignumber'
import { Contract } from '@ethersproject/contracts'
import { TransactionResponse } from '@ethersproject/providers'
import { Currency, CurrencyAmount } from '@uniswap/sdk-core'

import { t } from '@lingui/macro'

import { wrapAnalytics } from 'legacy/components/analytics'
import { ConfirmOperationType } from 'legacy/components/TransactionConfirmationModal'
import { getOperationMessage } from 'legacy/components/TransactionConfirmationModal/LegacyConfirmationPendingContent'
import { RADIX_HEX } from 'legacy/constants'
import { useWETHContract } from 'legacy/hooks/useContract'
import { useCloseModals } from 'legacy/state/application/hooks'
import { useTransactionAdder } from 'legacy/state/enhancedTransactions/hooks'
import { useDerivedSwapInfo } from 'legacy/state/swap/hooks'
import { calculateGasMargin } from 'legacy/utils/calculateGasMargin'
import { getChainCurrencySymbols } from 'legacy/utils/gnosis_chain/hack'

import { useDetectNativeToken } from 'modules/swap/hooks/useDetectNativeToken'
import { useTransactionConfirmModal } from 'modules/swap/hooks/useTransactionConfirmModal'
import useCurrencyBalance from 'modules/tokens/hooks/useCurrencyBalance'
import { useWalletInfo } from 'modules/wallet'

import { formatTokenAmount } from 'utils/amountFormat'
import { formatSymbol } from 'utils/format'

import { isRejectRequestProviderError } from '../utils/misc'

// Use a 180K gas as a fallback if there's issue calculating the gas estimation (fixes some issues with some nodes failing to calculate gas costs for SC wallets)
const WRAP_UNWRAP_GAS_LIMIT_DEFAULT = BigNumber.from('180000')

export enum WrapType {
  NOT_APPLICABLE,
  WRAP,
  UNWRAP,
}

export interface WrapUnwrapCallbackParams {
  useModals?: boolean
}

export type WrapUnwrapCallback = (params?: WrapUnwrapCallbackParams) => Promise<TransactionResponse | null>

type TransactionAdder = ReturnType<typeof useTransactionAdder>

export type OpenSwapConfirmModalCallback = (message: string, operationType: ConfirmOperationType) => void

export interface WrapUnwrapContext {
  wrapType: WrapType
  wethContract: Contract
  amountHex: string
  confirmationMessage: string
  operationMessage: string
  summary: string
  addTransaction: TransactionAdder
  closeModals: () => void
  openTransactionConfirmationModal: OpenSwapConfirmModalCallback
}

export function useHasEnoughWrappedBalanceForSwap(inputAmount?: CurrencyAmount<Currency>): boolean {
  const { currencies } = useDerivedSwapInfo()
  const { account } = useWalletInfo()
  const wrappedBalance = useCurrencyBalance(account ?? undefined, currencies.INPUT?.wrapped)

  // is an native currency trade but wrapped token has enough balance
  return !!(wrappedBalance && inputAmount && !wrappedBalance.lessThan(inputAmount))
}

export function useWrapType(): WrapType {
  const { isNativeIn, isNativeOut, isWrappedIn, isWrappedOut } = useDetectNativeToken()

  const isWrap = isNativeIn && isWrappedOut
  const isUnwrap = isWrappedIn && isNativeOut
  const isWrapOrUnwrapApplicable = isWrap || isUnwrap

  if (!isWrapOrUnwrapApplicable) {
    return WrapType.NOT_APPLICABLE
  }

  return isNativeIn ? WrapType.WRAP : WrapType.UNWRAP
}

export function useWrapUnwrapError(wrapType: WrapType, inputAmount?: CurrencyAmount<Currency>): string | undefined {
  const { chainId, account } = useWalletInfo()
  const { currencies } = useDerivedSwapInfo()
  const { native, wrapped } = getChainCurrencySymbols(chainId)
  const balance = useCurrencyBalance(account ?? undefined, currencies.INPUT)

  const symbol = wrapType === WrapType.WRAP ? native : wrapped
  // Check if user has enough balance for wrap/unwrap
  const sufficientBalance = !!(inputAmount && balance && !balance.lessThan(inputAmount))
  const isZero = balance && !inputAmount

  if (isZero) {
    return t`Enter an amount`
  }

  return !sufficientBalance ? t`Insufficient ${formatSymbol(symbol)} balance` : undefined
}

export function useWrapUnwrapContext(
  inputAmount: CurrencyAmount<Currency> | null | undefined
): WrapUnwrapContext | null {
  const { chainId } = useWalletInfo()
  const closeModals = useCloseModals()
  const wethContract = useWETHContract()
  const { native, wrapped } = getChainCurrencySymbols(chainId)
  const { isNativeIn } = useDetectNativeToken()
  const addTransaction = useTransactionAdder()
  const wrapType = isNativeIn ? WrapType.WRAP : WrapType.UNWRAP
  const isWrap = isNativeIn
  const openTxConfirmationModal = useTransactionConfirmModal()

  if (!wethContract || !chainId || !inputAmount) {
    return null
  }

  const openTransactionConfirmationModal = (pendingText: string, operationType: ConfirmOperationType) => {
    openTxConfirmationModal({ operationType, pendingText })
  }
  const amountHex = `0x${inputAmount.quotient.toString(RADIX_HEX)}`
  const operationType = isWrap ? ConfirmOperationType.WRAP_ETHER : ConfirmOperationType.UNWRAP_WETH
  const baseSummarySuffix = isWrap ? `${native} to ${wrapped}` : `${wrapped} to ${native}`
  const baseSummary = `${formatTokenAmount(inputAmount)} ${baseSummarySuffix}`
  const summary = `${isWrap ? 'Wrap' : 'Unwrap'} ${baseSummary}`
  const confirmationMessage = `${isWrap ? 'Wrapping' : 'Unwrapping'} ${baseSummary}`
  const operationMessage = getOperationMessage(operationType, chainId)

  return {
    wrapType,
    closeModals,
    wethContract,
    amountHex,
    summary,
    confirmationMessage,
    operationMessage,
    addTransaction,
    openTransactionConfirmationModal,
  }
}

/**
 * Given the selected input and output currency, return a wrap callback
 */
export function useWrapCallback(inputAmount: CurrencyAmount<Currency> | null | undefined): WrapUnwrapCallback | null {
  const context = useWrapUnwrapContext(inputAmount)

  if (!context) {
    return null
  }

  return (params?: WrapUnwrapCallbackParams) => {
    return wrapUnwrapCallback(context, params)
  }
}

export async function wrapUnwrapCallback(
  context: WrapUnwrapContext,
  params: WrapUnwrapCallbackParams = { useModals: true }
): Promise<TransactionResponse | null> {
  const { useModals } = params
  const {
    wrapType,
    openTransactionConfirmationModal,
    confirmationMessage,
    operationMessage,
    summary,
    wethContract,
    amountHex,
    addTransaction,
    closeModals,
  } = context
  const isWrap = wrapType === WrapType.WRAP
  const operationType = isWrap ? ConfirmOperationType.WRAP_ETHER : ConfirmOperationType.UNWRAP_WETH

  try {
    useModals && openTransactionConfirmationModal(confirmationMessage, operationType)
    wrapAnalytics('Send', operationMessage)

    const wrapUnwrap = isWrap ? wrapContractCall : unwrapContractCall
    const txReceipt = await wrapUnwrap(wethContract, amountHex)
    wrapAnalytics('Sign', operationMessage)

    addTransaction({
      hash: txReceipt.hash,
      summary,
    })
    useModals && closeModals()

    return txReceipt
  } catch (error: any) {
    useModals && closeModals()

    const isRejected = isRejectRequestProviderError(error)
    const action = isRejected ? 'Reject' : 'Error'
    wrapAnalytics(action, operationMessage)

    const errorMessage = (isRejected ? 'Reject' : 'Error') + ' Signing transaction'
    console.error(errorMessage, error)

    if (isRejected) {
      return null
    }

    throw typeof error === 'string' ? new Error(error) : error
  }
}

async function wrapContractCall(wethContract: Contract, amountHex: string): Promise<TransactionResponse> {
  const estimatedGas = await wethContract.estimateGas.deposit({ value: amountHex }).catch(_handleGasEstimateError)
  const gasLimit = calculateGasMargin(estimatedGas)

  return wethContract.deposit({ value: amountHex, gasLimit })
}

async function unwrapContractCall(wethContract: Contract, amountHex: string): Promise<TransactionResponse> {
  const estimatedGas = await wethContract.estimateGas.withdraw(amountHex).catch(_handleGasEstimateError)
  const gasLimit = calculateGasMargin(estimatedGas)
  return wethContract.withdraw(amountHex, { gasLimit })
}

function _handleGasEstimateError(error: any): BigNumber {
  console.log(
    '[useWrapCallback] Error estimating gas for wrap/unwrap. Using default gas limit ' +
      WRAP_UNWRAP_GAS_LIMIT_DEFAULT.toString(),
    error
  )
  return WRAP_UNWRAP_GAS_LIMIT_DEFAULT
}
