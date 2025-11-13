import { useCowAnalytics } from '@cowprotocol/analytics'
import { RADIX_HEX } from '@cowprotocol/common-const'
import {
  calculateGasMargin,
  formatTokenAmount,
  getIsNativeToken,
  getRawCurrentChainIdFromUrl,
  isRejectRequestProviderError,
} from '@cowprotocol/common-utils'
import { SupportedChainId } from '@cowprotocol/cow-sdk'
import { getChainCurrencySymbols } from '@cowprotocol/tokens'
import { Command } from '@cowprotocol/types'
import { BigNumber } from '@ethersproject/bignumber'
import { Contract } from '@ethersproject/contracts'
import { TransactionResponse } from '@ethersproject/providers'
import { Currency, CurrencyAmount } from '@uniswap/sdk-core'

import { t } from '@lingui/core/macro'

import { useTransactionAdder } from 'legacy/state/enhancedTransactions/hooks'

import { CowSwapAnalyticsCategory } from 'common/analytics/types'
import { logEthSendingIntention, logEthSendingTransaction } from 'common/services/logEthSendingTransaction'
import { assertProviderNetwork } from 'common/utils/assertProviderNetwork'

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
  account: string
  wethContract: Contract
  amount: CurrencyAmount<Currency>
  addTransaction: TransactionAdder
  closeModals: Command
  openTransactionConfirmationModal: Command
  analytics: ReturnType<typeof useCowAnalytics>
}

type WrapAction = 'Send' | 'Sign' | 'Reject' | 'Error'

function sendWrapEvent(
  analytics: WrapUnwrapContext['analytics'],
  action: WrapAction,
  operationMessage: string,
  amount: CurrencyAmount<Currency>,
): void {
  analytics.sendEvent({
    category: CowSwapAnalyticsCategory.WRAP_NATIVE_TOKEN,
    action,
    label: operationMessage,
    value: Number(amount.toSignificant(6)),
  })
}

interface WrapUnwrapTxData {
  txResponse: TransactionResponse
}

// TODO: Reduce function complexity by extracting logic
// eslint-disable-next-line complexity
export async function wrapUnwrapCallback(
  context: WrapUnwrapContext,
  params: WrapUnwrapCallbackParams = { useModals: true },
): Promise<TransactionResponse | null> {
  const {
    chainId,
    account,
    amount,
    wethContract,
    addTransaction,
    openTransactionConfirmationModal,
    closeModals,
    analytics,
  } = context
  const isNativeIn = getIsNativeToken(amount.currency)
  const amountHex = `0x${amount.quotient.toString(RADIX_HEX)}`

  const useModals = params.useModals
  const { operationMessage, summary } = getWrapDescription(chainId, isNativeIn, amount)

  try {
    useModals && openTransactionConfirmationModal()
    sendWrapEvent(analytics, 'Send', operationMessage, amount)

    const wrapUnwrap = isNativeIn ? wrapContractCall : unwrapContractCall
    const { txResponse } = await wrapUnwrap(wethContract, amountHex, chainId, account)

    sendWrapEvent(analytics, 'Sign', operationMessage, amount)

    addTransaction({
      hash: txResponse.hash,
      summary,
    })
    useModals && closeModals()

    return txResponse
  } catch (error: unknown) {
    useModals && closeModals()

    const isRejected = isRejectRequestProviderError(error)
    const action = isRejected ? t`Reject` : t`Error`
    sendWrapEvent(analytics, action as WrapAction, operationMessage, amount)

    const errorMessage = (isRejected ? t`Reject` : t`Error`) + ' ' + t`Signing transaction`
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
  inputAmount: CurrencyAmount<Currency>,
): WrapDescription {
  const { native, wrapped } = getChainCurrencySymbols(chainId)
  const amountStr = formatTokenAmount(inputAmount)
  const summary = isWrap ? t`Wrap ${amountStr} ${native} to ${wrapped}` : t`Unwrap ${amountStr} ${wrapped} to ${native}`
  const confirmationMessage = isWrap
    ? t`Wrapping ${amountStr} ${native} to ${wrapped}`
    : t`Unwrapping ${amountStr} ${wrapped} to ${native}`
  // Keep analytics label un-translated on purpose
  const operationMessage = isWrap ? t`Wrapping` + ' ' + native : t`Unwrapping` + ' ' + wrapped

  return {
    summary,
    operationMessage,
    confirmationMessage,
  }
}

async function wrapContractCall(
  wethContract: Contract,
  amountHex: string,
  chainId: SupportedChainId,
  account: string,
): Promise<WrapUnwrapTxData> {
  const estimatedGas = await wethContract.estimateGas.deposit({ value: amountHex }).catch(_handleGasEstimateError)
  const gasLimit = calculateGasMargin(estimatedGas)

  const network = await assertProviderNetwork(chainId, wethContract.provider, 'wrap')

  const tx = await wethContract.populateTransaction.deposit({ value: amountHex, gasLimit })

  const intentionEventId = logEthSendingIntention({
    chainId,
    amount: amountHex,
    urlChainId: getRawCurrentChainIdFromUrl(),
    account,
    tx,
  })

  const txResponse = await wethContract.signer.sendTransaction({ ...tx, chainId: network })

  logEthSendingTransaction({ txHash: txResponse.hash, intentionEventId })

  return {
    txResponse,
  }
}

async function unwrapContractCall(
  wethContract: Contract,
  amountHex: string,
  chainId: SupportedChainId,
  _account: string,
): Promise<WrapUnwrapTxData> {
  const estimatedGas = await wethContract.estimateGas.withdraw(amountHex).catch(_handleGasEstimateError)
  const gasLimit = calculateGasMargin(estimatedGas)

  const tx = await wethContract.populateTransaction.withdraw(amountHex, { gasLimit })

  const network = await assertProviderNetwork(chainId, wethContract.provider, 'unwrap')

  const txResponse = await wethContract.signer.sendTransaction({ ...tx, chainId: network })

  return {
    txResponse,
  }
}

function _handleGasEstimateError(error: unknown): BigNumber {
  console.log(
    '[useWrapCallback] Error estimating gas for wrap/unwrap. Using default gas limit ' +
      WRAP_UNWRAP_GAS_LIMIT_DEFAULT.toString(),
    error,
  )
  return WRAP_UNWRAP_GAS_LIMIT_DEFAULT
}
