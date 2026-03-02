import { useCowAnalytics } from '@cowprotocol/analytics'
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
import { Currency, CurrencyAmount } from '@uniswap/sdk-core'

import { t } from '@lingui/core/macro'
import { encodeFunctionData } from 'viem'
import { Config } from 'wagmi'
import { estimateGas, simulateContract, writeContract } from 'wagmi/actions'

import { useTransactionAdder } from 'legacy/state/enhancedTransactions/hooks'

import { CowSwapAnalyticsCategory } from 'common/analytics/types'
import { WethContractData } from 'common/hooks/useContract'
import { logEthSendingIntention, logEthSendingTransaction } from 'common/services/logEthSendingTransaction'

import type { Hex } from 'viem'

// Use a 180K gas as a fallback if there's issue calculating the gas estimation (fixes some issues with some nodes failing to calculate gas costs for SC wallets)
const WRAP_UNWRAP_GAS_LIMIT_DEFAULT = 180000n

export interface WrapUnwrapCallbackParams {
  useModals?: boolean
}

export type WrapUnwrapCallback = (params?: WrapUnwrapCallbackParams) => Promise<Hex | null>

type TransactionAdder = ReturnType<typeof useTransactionAdder>

export interface WrapDescription {
  confirmationMessage: string
  operationMessage: string
  summary: string
}

export interface WrapUnwrapContext {
  chainId: SupportedChainId
  config: Config
  account: string
  wethContract: WethContractData
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
  txHash: Hex
}

// TODO: Reduce function complexity by extracting logic
// eslint-disable-next-line complexity
export async function wrapUnwrapCallback(
  context: WrapUnwrapContext,
  params: WrapUnwrapCallbackParams = { useModals: true },
): Promise<Hex | null> {
  const {
    chainId,
    config,
    account,
    amount,
    wethContract,
    addTransaction,
    openTransactionConfirmationModal,
    closeModals,
    analytics,
  } = context
  const isNativeIn = getIsNativeToken(amount.currency)
  const amountBigInt = BigInt(amount.quotient.toString())

  const useModals = params.useModals
  const { operationMessage, summary } = getWrapDescription(chainId, isNativeIn, amount)

  try {
    useModals && openTransactionConfirmationModal()
    sendWrapEvent(analytics, 'Send', operationMessage, amount)

    const wrapUnwrap = isNativeIn ? wrapContractCall : unwrapContractCall
    const { txHash } = await wrapUnwrap({ wethContract, amount: amountBigInt, chainId, account, config })

    sendWrapEvent(analytics, 'Sign', operationMessage, amount)

    addTransaction({
      hash: txHash,
      summary,
    })
    useModals && closeModals()

    return txHash
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

async function wrapContractCall({
  wethContract,
  amount,
  chainId,
  account,
  config,
}: {
  wethContract: WethContractData
  amount: bigint
  chainId: SupportedChainId
  account: string
  config: Config
}): Promise<WrapUnwrapTxData> {
  const estimatedGas = await estimateGas(config, {
    to: wethContract.address,
    data: encodeFunctionData({
      abi: wethContract.abi,
      functionName: 'deposit',
    }),
    value: amount,
  }).catch(_handleGasEstimateError)

  const gasLimit = calculateGasMargin(estimatedGas)

  const tx = await simulateContract(config, {
    abi: wethContract.abi,
    address: wethContract.address,
    functionName: 'deposit',
    value: amount,
    gas: gasLimit,
  })

  const intentionEventId = logEthSendingIntention({
    chainId,
    amount: amount.toString(),
    urlChainId: getRawCurrentChainIdFromUrl(),
    account,
    tx: { ...tx.request, to: tx.request.address },
  })

  const txHash = await writeContract(config, tx.request)

  logEthSendingTransaction({ txHash, intentionEventId })

  return {
    txHash,
  }
}

async function unwrapContractCall({
  wethContract,
  amount,
  config,
}: {
  wethContract: WethContractData
  amount: bigint
  chainId?: SupportedChainId
  account?: string
  config: Config
}): Promise<WrapUnwrapTxData> {
  const estimatedGas = await estimateGas(config, {
    to: wethContract.address,
    data: encodeFunctionData({
      abi: wethContract.abi,
      functionName: 'withdraw',
      args: [amount],
    }),
  }).catch(_handleGasEstimateError)
  const gasLimit = calculateGasMargin(estimatedGas)

  const tx = await simulateContract(config, {
    abi: wethContract.abi,
    address: wethContract.address,
    functionName: 'deposit',
    value: amount,
    gas: gasLimit,
  })

  const txHash = await writeContract(config, tx.request)

  return {
    txHash,
  }
}

function _handleGasEstimateError(error: unknown): bigint {
  console.log(
    '[useWrapCallback] Error estimating gas for wrap/unwrap. Using default gas limit ' +
      WRAP_UNWRAP_GAS_LIMIT_DEFAULT.toString(),
    error,
  )
  return WRAP_UNWRAP_GAS_LIMIT_DEFAULT
}
