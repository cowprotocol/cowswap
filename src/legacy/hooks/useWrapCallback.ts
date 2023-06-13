import { SupportedChainId } from '@cowprotocol/cow-sdk'
import { BigNumber } from '@ethersproject/bignumber'
import { Contract } from '@ethersproject/contracts'
import { TransactionResponse } from '@ethersproject/providers'
import { Currency, CurrencyAmount } from '@uniswap/sdk-core'

import { Nullish } from 'types'

import { wrapAnalytics } from 'legacy/components/analytics'
import { ConfirmOperationType } from 'legacy/components/TransactionConfirmationModal'
import { getOperationMessage } from 'legacy/components/TransactionConfirmationModal/LegacyConfirmationPendingContent'
import { RADIX_HEX } from 'legacy/constants'
import { useWETHContract } from 'legacy/hooks/useContract'
import { useCloseModals } from 'legacy/state/application/hooks'
import { useTransactionAdder } from 'legacy/state/enhancedTransactions/hooks'
import { calculateGasMargin } from 'legacy/utils/calculateGasMargin'
import { getChainCurrencySymbols } from 'legacy/utils/gnosis_chain/hack'

import { useTransactionConfirmModal } from 'modules/swap/hooks/useTransactionConfirmModal'
import { useNativeTokenContext } from 'modules/trade/hooks/useNativeTokenContext'
import { useWalletInfo } from 'modules/wallet'

import { formatTokenAmount } from 'utils/amountFormat'

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

export interface WrapDescription {
  confirmationMessage: string
  operationMessage: string
  summary: string
}

export interface WrapUnwrapContext {
  chainId: SupportedChainId
  wethContract: Contract
  amount: CurrencyAmount<Currency>
  addTransaction: TransactionAdder
  closeModals: () => void
  openTransactionConfirmationModal: OpenSwapConfirmModalCallback
}

export function useWrapType(): WrapType {
  const { isNativeIn, isNativeOut, isWrappedIn, isWrappedOut } = useNativeTokenContext()

  const isWrap = isNativeIn && isWrappedOut
  const isUnwrap = isWrappedIn && isNativeOut
  const isWrapOrUnwrapApplicable = isWrap || isUnwrap

  if (!isWrapOrUnwrapApplicable) {
    return WrapType.NOT_APPLICABLE
  }

  return isNativeIn ? WrapType.WRAP : WrapType.UNWRAP
}

export function useWrapUnwrapContext(inputAmount: Nullish<CurrencyAmount<Currency>>): WrapUnwrapContext | null {
  const { chainId } = useWalletInfo()
  const closeModals = useCloseModals()
  const wethContract = useWETHContract()
  const addTransaction = useTransactionAdder()
  const openTxConfirmationModal = useTransactionConfirmModal()

  if (!wethContract || !chainId || !inputAmount) {
    return null
  }

  const openTransactionConfirmationModal = (pendingText: string, operationType: ConfirmOperationType) => {
    openTxConfirmationModal({ operationType, pendingText })
  }

  return {
    chainId,
    wethContract,
    amount: inputAmount,
    addTransaction,
    closeModals,
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
  const { chainId, amount, wethContract, addTransaction, openTransactionConfirmationModal, closeModals } = context
  const isNativeIn = amount.currency.isNative
  const amountHex = `0x${amount.quotient.toString(RADIX_HEX)}`
  const operationType = isNativeIn ? ConfirmOperationType.WRAP_ETHER : ConfirmOperationType.UNWRAP_WETH

  const useModals = params.useModals
  const { confirmationMessage, operationMessage, summary } = getWrapDescription(chainId, isNativeIn, amount)

  try {
    useModals && openTransactionConfirmationModal(confirmationMessage, operationType)
    wrapAnalytics('Send', operationMessage)

    const wrapUnwrap = isNativeIn ? wrapContractCall : unwrapContractCall
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

function getWrapDescription(
  chainId: SupportedChainId,
  isWrap: boolean,
  inputAmount: CurrencyAmount<Currency>
): WrapDescription {
  const { native, wrapped } = getChainCurrencySymbols(chainId)
  const operationType = isWrap ? ConfirmOperationType.WRAP_ETHER : ConfirmOperationType.UNWRAP_WETH
  const baseSummarySuffix = isWrap ? `${native} to ${wrapped}` : `${wrapped} to ${native}`
  const baseSummary = `${formatTokenAmount(inputAmount)} ${baseSummarySuffix}`
  const summary = `${isWrap ? 'Wrap' : 'Unwrap'} ${baseSummary}`
  const confirmationMessage = `${isWrap ? 'Wrapping' : 'Unwrapping'} ${baseSummary}`
  const operationMessage = getOperationMessage(operationType, chainId)

  return {
    summary,
    operationMessage,
    confirmationMessage,
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
