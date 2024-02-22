import { wrapAnalytics } from '@cowprotocol/analytics'
import { getChainCurrencySymbols, RADIX_HEX } from '@cowprotocol/common-const'
import {
  calculateGasMargin,
  formatTokenAmount,
  getIsNativeToken,
  isRejectRequestProviderError,
} from '@cowprotocol/common-utils'
import { SupportedChainId } from '@cowprotocol/cow-sdk'
import { Command } from '@cowprotocol/types'
import { BigNumber } from '@ethersproject/bignumber'
import { Contract } from '@ethersproject/contracts'
import { TransactionResponse } from '@ethersproject/providers'
import { Currency, CurrencyAmount } from '@uniswap/sdk-core'

import { useTransactionAdder } from 'legacy/state/enhancedTransactions/hooks'

// Use a 180K gas as a fallback if there's issue calculating the gas estimation (fixes some issues with some nodes failing to calculate gas costs for SC wallets)
const WRAP_UNWRAP_GAS_LIMIT_DEFAULT = BigNumber.from('180000')

export interface WrapUnwrapCallbackParams {
  useModals?: boolean
}

export type WrapUnwrapCallback = (params?: WrapUnwrapCallbackParams) => Promise<TransactionResponse | null>

type TransactionAdder = ReturnType<typeof useTransactionAdder>

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
  closeModals: Command
  openTransactionConfirmationModal: Command
}

export async function wrapUnwrapCallback(
  context: WrapUnwrapContext,
  params: WrapUnwrapCallbackParams = { useModals: true }
): Promise<TransactionResponse | null> {
  const { chainId, amount, wethContract, addTransaction, openTransactionConfirmationModal, closeModals } = context
  const isNativeIn = getIsNativeToken(amount.currency)
  const amountHex = `0x${amount.quotient.toString(RADIX_HEX)}`

  const useModals = params.useModals
  const { operationMessage, summary } = getWrapDescription(chainId, isNativeIn, amount)

  try {
    useModals && openTransactionConfirmationModal()
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
  const baseSummarySuffix = isWrap ? `${native} to ${wrapped}` : `${wrapped} to ${native}`
  const baseSummary = `${formatTokenAmount(inputAmount)} ${baseSummarySuffix}`
  const summary = `${isWrap ? 'Wrap' : 'Unwrap'} ${baseSummary}`
  const confirmationMessage = `${isWrap ? 'Wrapping' : 'Unwrapping'} ${baseSummary}`
  const operationMessage = isWrap ? 'Wrapping ' + native : 'Unwrapping ' + wrapped

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
