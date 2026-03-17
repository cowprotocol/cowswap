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
import { Currency, CurrencyAmount } from '@cowprotocol/currency'
import { getChainCurrencySymbols } from '@cowprotocol/tokens'
import { Command } from '@cowprotocol/types'

import { t } from '@lingui/core/macro'
import { type Hash, type PublicClient, type WalletClient, Chain } from 'viem'
import { arbitrum, avalanche, base, bsc, gnosis, ink, linea, mainnet, plasma, polygon, sepolia } from 'viem/chains'

import { useTransactionAdder } from 'legacy/state/enhancedTransactions/hooks'

import { CowSwapAnalyticsCategory } from 'common/analytics/types'
import { WethContractData } from 'common/hooks/useContract'
import { logEthSendingIntention, logEthSendingTransaction } from 'common/services/logEthSendingTransaction'

// Use a 180K gas as a fallback if there's issue calculating the gas estimation (fixes some issues with some nodes failing to calculate gas costs for SC wallets)
const WRAP_UNWRAP_GAS_LIMIT_DEFAULT = 180_000n

const CHAIN_ID_TO_CHAIN: Partial<Record<SupportedChainId, Chain>> = {
  [SupportedChainId.MAINNET]: mainnet,
  [SupportedChainId.BNB]: bsc,
  [SupportedChainId.GNOSIS_CHAIN]: gnosis,
  [SupportedChainId.POLYGON]: polygon,
  [SupportedChainId.BASE]: base,
  [SupportedChainId.PLASMA]: plasma,
  [SupportedChainId.ARBITRUM_ONE]: arbitrum,
  [SupportedChainId.AVALANCHE]: avalanche,
  [SupportedChainId.LINEA]: linea,
  [SupportedChainId.INK]: ink,
  [SupportedChainId.SEPOLIA]: sepolia,
}

export interface WrapDescription {
  confirmationMessage: string
  operationMessage: string
  summary: string
}

export type WrapUnwrapCallback = (params?: WrapUnwrapCallbackParams) => Promise<{ hash: Hash } | null>

export interface WrapUnwrapCallbackParams {
  useModals?: boolean
}

export interface WrapUnwrapContext {
  chainId: SupportedChainId
  account: string
  wethContract: WethContractData
  walletClient: WalletClient | undefined
  publicClient: PublicClient | undefined
  amount: CurrencyAmount<Currency>
  addTransaction: TransactionAdder
  closeModals: Command
  openTransactionConfirmationModal: Command
  analytics: ReturnType<typeof useCowAnalytics>
}

type TransactionAdder = ReturnType<typeof useTransactionAdder>

type WrapAction = 'Send' | 'Sign' | 'Reject' | 'Error'

interface WrapUnwrapTxData {
  hash: Hash
}

// TODO: Reduce function complexity by extracting logic
// eslint-disable-next-line complexity
export async function wrapUnwrapCallback(
  context: WrapUnwrapContext,
  params: WrapUnwrapCallbackParams = { useModals: true },
): Promise<{ hash: Hash } | null> {
  const {
    chainId,
    account,
    amount,
    wethContract,
    walletClient,
    publicClient,
    addTransaction,
    openTransactionConfirmationModal,
    closeModals,
    analytics,
  } = context
  const isNativeIn = getIsNativeToken(amount.currency)
  const amountHex = `0x${amount.quotient.toString(RADIX_HEX)}` as `0x${string}`

  const useModals = params.useModals
  const { operationMessage, summary } = getWrapDescription(chainId, isNativeIn, amount)

  try {
    useModals && openTransactionConfirmationModal()
    sendWrapEvent(analytics, 'Send', operationMessage, amount)

    const wrapUnwrap = isNativeIn ? wrapContractCall : unwrapContractCall
    const { hash } = await wrapUnwrap(wethContract, walletClient, publicClient, amountHex, chainId, account)

    sendWrapEvent(analytics, 'Sign', operationMessage, amount)

    addTransaction({
      hash,
      summary,
    })
    useModals && closeModals()

    return { hash }
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

function _handleGasEstimateError(error: unknown): bigint {
  console.log(
    '[useWrapCallback] Error estimating gas for wrap/unwrap. Using default gas limit ' +
      WRAP_UNWRAP_GAS_LIMIT_DEFAULT.toString(),
    error,
  )
  return WRAP_UNWRAP_GAS_LIMIT_DEFAULT
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

async function unwrapContractCall(
  wethContract: WethContractData,
  walletClient: WalletClient | undefined,
  publicClient: PublicClient | undefined,
  amountHex: `0x${string}`,
  chainId: SupportedChainId,
  _account: string,
): Promise<WrapUnwrapTxData> {
  if (!walletClient?.account) throw new Error('Wallet not connected')
  const address = wethContract.address as `0x${string}`
  const args = [BigInt(amountHex)] as const
  let gasLimit: bigint
  try {
    const estimated = publicClient
      ? await publicClient.estimateContractGas({
          address,
          abi: wethContract.abi,
          functionName: 'withdraw',
          args,
          account: walletClient.account,
        })
      : WRAP_UNWRAP_GAS_LIMIT_DEFAULT
    gasLimit = calculateGasMargin(estimated)
  } catch (e) {
    gasLimit = calculateGasMargin(_handleGasEstimateError(e))
  }
  const chain = CHAIN_ID_TO_CHAIN[chainId]
  const hash = await walletClient.writeContract({
    address,
    abi: wethContract.abi,
    functionName: 'withdraw',
    args,
    account: walletClient.account,
    gas: gasLimit,
    chain: chain ?? undefined,
  })
  return { hash }
}

async function wrapContractCall(
  wethContract: WethContractData,
  walletClient: WalletClient | undefined,
  publicClient: PublicClient | undefined,
  amountHex: `0x${string}`,
  chainId: SupportedChainId,
  _account: string,
): Promise<WrapUnwrapTxData> {
  if (!walletClient?.account) throw new Error('Wallet not connected')
  const address = wethContract.address as `0x${string}`
  const value = BigInt(amountHex)
  let gasLimit: bigint
  try {
    const estimated = publicClient
      ? await publicClient.estimateContractGas({
          address,
          abi: wethContract.abi,
          functionName: 'deposit',
          value,
          account: walletClient.account,
        })
      : WRAP_UNWRAP_GAS_LIMIT_DEFAULT
    gasLimit = calculateGasMargin(estimated)
  } catch (e) {
    gasLimit = calculateGasMargin(_handleGasEstimateError(e))
  }
  const intentionEventId = logEthSendingIntention({
    chainId,
    amount: amountHex,
    urlChainId: getRawCurrentChainIdFromUrl(),
    account: _account,
    tx: { to: wethContract.address as `0x${string}`, value: BigInt(amountHex), data: '0x' },
  })
  const chain = CHAIN_ID_TO_CHAIN[chainId]
  const hash = await walletClient.writeContract({
    address,
    abi: wethContract.abi,
    functionName: 'deposit',
    value,
    account: walletClient.account,
    gas: gasLimit,
    chain: chain ?? undefined,
  })
  logEthSendingTransaction({ txHash: hash, intentionEventId })
  return { hash }
}
