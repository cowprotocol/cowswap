import { useCowAnalytics } from '@cowprotocol/analytics'
import { NATIVE_CURRENCIES, WRAPPED_NATIVE_CURRENCIES } from '@cowprotocol/common-const'
import {
  formatTokenAmount,
  getIsNativeToken,
  getProviderErrorMessage,
  isRejectRequestProviderError,
} from '@cowprotocol/common-utils'
import { SupportedChainId } from '@cowprotocol/cow-sdk'
import { Currency, CurrencyAmount } from '@cowprotocol/currency'
import { Command } from '@cowprotocol/types'

import { t } from '@lingui/core/macro'
import { Connection, PublicKey, Transaction, TransactionInstruction } from '@solana/web3.js'

import { WrapUnwrapCallbackParams } from 'legacy/hooks/useWrapCallback'
import { useTransactionAdder } from 'legacy/state/enhancedTransactions/hooks'

import { CowSwapAnalyticsCategory } from 'common/analytics/types'

import { buildUnwrapSolInstructions } from './buildUnwrapSolInstructions'
import { buildWrapSolInstructions } from './buildWrapSolInstructions'
import { getSolanaUnwrapPreview } from './getSolanaUnwrapPreview'
import { getSolanaWrapPreview } from './getSolanaWrapPreview'

import type { Provider as SolanaProvider } from '@reown/appkit-adapter-solana/react'

type TransactionAdder = ReturnType<typeof useTransactionAdder>

type WrapAction = 'Send' | 'Sign' | 'Reject' | 'Error'

/**
 * Both symbols are typed as optional on `TokenWithLogo`, but the SDK always defines them for Solana.
 * Pinning them here keeps the fallbacks correct instead of the meaningless "Ether"/"WETH" default that
 * `getChainCurrencySymbols` would return — and avoids pulling the browser-only tokens barrel into a
 * service module.
 */
const SOLANA_CURRENCY_SYMBOLS = {
  native: NATIVE_CURRENCIES[SupportedChainId.SOLANA].symbol ?? 'SOL',
  wrapped: WRAPPED_NATIVE_CURRENCIES[SupportedChainId.SOLANA].symbol ?? 'WSOL',
}

export interface SolanaWrapUnwrapContext {
  account: string
  amount: CurrencyAmount<Currency>
  connection: Connection
  provider: SolanaProvider
  addTransaction: TransactionAdder
  analytics: ReturnType<typeof useCowAnalytics>
  closeModals: Command
  /**
   * Takes the amounts the owner will actually send and receive so the pending screen can show them.
   * Neither is necessarily the typed amount — see `buildWrapPlan` and `buildUnwrapPlan` below.
   */
  openTransactionConfirmationModal: (preview: SolanaWrapUnwrapPreview) => void
  openErrorModal: (message: string) => void
}

export interface SolanaWrapUnwrapPreview {
  sendAmount: CurrencyAmount<Currency>
  receiveAmount: CurrencyAmount<Currency>
}

interface SolanaWrapPlan extends SolanaWrapUnwrapPreview {
  instructions: TransactionInstruction[]
}

/** A wallet's own signing confirmation can fail on an expired blockhash if the owner takes a while to
 * approve — refetching and retrying is the standard mitigation, not a sign of a broken transaction. */
const MAX_SEND_ATTEMPTS = 3

/**
 * Solana counterpart to `wrapUnwrapCallback`, mirroring its control flow: open the pending modal, send,
 * record the transaction, close. Only the transaction building differs.
 */
export async function solanaWrapUnwrapCallback(
  context: SolanaWrapUnwrapContext,
  params: WrapUnwrapCallbackParams = { useModals: true },
): Promise<{ hash: string } | null> {
  const {
    account,
    amount,
    connection,
    provider,
    addTransaction,
    analytics,
    openTransactionConfirmationModal,
    closeModals,
  } = context

  const isNativeIn = getIsNativeToken(amount.currency)
  const useModals = params.useModals
  const operationMessage = getSolanaOperationMessage(isNativeIn)

  try {
    const owner = new PublicKey(account)
    const lamports = amount.quotient

    const { instructions, sendAmount, receiveAmount } = isNativeIn
      ? await buildWrapPlan(connection, owner, lamports)
      : await buildUnwrapPlan(connection, owner, lamports)

    useModals && openTransactionConfirmationModal({ sendAmount, receiveAmount })
    sendWrapEvent(analytics, 'Send', operationMessage, amount)

    const { hash, lastValidBlockHeight } = await sendWithFreshBlockhash(connection, provider, owner, instructions)

    sendWrapEvent(analytics, 'Sign', operationMessage, amount)

    // `lastValidBlockHeight` lets the finalizer tell "not landed yet" apart from "dropped for good".
    addTransaction({
      hash,
      summary: getSolanaWrapSummary(isNativeIn, sendAmount, receiveAmount),
      data: { lastValidBlockHeight },
    })

    useModals && closeModals()

    return { hash }
  } catch (error: unknown) {
    return handleSendError(error, context, { useModals, operationMessage })
  }
}

/**
 * Unwrapping closes the WSOL account (Solana has no partial-unwrap primitive) and, when there's a
 * remainder, re-creates and re-funds it in the same transaction — see `buildUnwrapSolInstructions`.
 * That re-creation is what re-pays the account's rent-exempt reserve. When the owner unwraps their
 * *entire* balance there's no remainder, so nothing re-pays it: the close instruction refunds the
 * unwrapped amount plus the reserve that was locked up for as long as the account existed. That's a
 * legitimate reclaim, not a bug, but the owner needs to see it coming rather than be surprised by the
 * wallet's simulated balance change.
 */
async function buildUnwrapPlan(connection: Connection, owner: PublicKey, lamports: bigint): Promise<SolanaWrapPlan> {
  const { wsolBalance, receiveAmount } = await getSolanaUnwrapPreview(connection, owner, lamports)

  return {
    instructions: buildUnwrapSolInstructions({ owner, lamports, wsolBalance }),
    sendAmount: CurrencyAmount.fromRawAmount(WRAPPED_NATIVE_CURRENCIES[SupportedChainId.SOLANA], lamports),
    receiveAmount,
  }
}

/**
 * Wrapping is a plain deposit-and-sync (see `buildWrapSolInstructions`), so what the owner *sends* is
 * always exactly the typed amount. The WSOL gained can be less: creating the associated token account,
 * when it doesn't exist yet, costs a one-time rent-exempt deposit that comes out of the typed amount —
 * see `getSolanaWrapPreview`.
 */
async function buildWrapPlan(connection: Connection, owner: PublicKey, lamports: bigint): Promise<SolanaWrapPlan> {
  const { sendAmount, receiveAmount, transferLamports } = await getSolanaWrapPreview(connection, owner, lamports)

  return {
    instructions: buildWrapSolInstructions({ owner, transferLamports }),
    sendAmount,
    receiveAmount,
  }
}

function getSolanaOperationMessage(isWrap: boolean): string {
  const { native, wrapped } = SOLANA_CURRENCY_SYMBOLS

  // Keep analytics label un-translated on purpose
  return isWrap ? t`Wrapping` + ' ' + native : t`Unwrapping` + ' ' + wrapped
}

function getSolanaWrapSummary(
  isWrap: boolean,
  sendAmount: CurrencyAmount<Currency>,
  receiveAmount: CurrencyAmount<Currency>,
): string {
  const { native, wrapped } = SOLANA_CURRENCY_SYMBOLS
  const sendAmountStr = formatTokenAmount(sendAmount)
  const receiveAmountStr = formatTokenAmount(receiveAmount)

  return isWrap
    ? t`Wrap ${sendAmountStr} ${native} to ${receiveAmountStr} ${wrapped}`
    : t`Unwrap ${sendAmountStr} ${wrapped} to ${receiveAmountStr} ${native}`
}

/**
 * A rejection is not a failure: close the pending modal and leave the form as it was. Anything else is
 * shown in place of the pending screen, or rethrown when the caller opted out of modals.
 */
function handleSendError(
  error: unknown,
  context: SolanaWrapUnwrapContext,
  { useModals, operationMessage }: { useModals: boolean | undefined; operationMessage: string },
): null {
  const { amount, analytics, closeModals, openErrorModal } = context
  const isRejected = isRejectRequestProviderError(error)

  sendWrapEvent(analytics, isRejected ? 'Reject' : 'Error', operationMessage, amount)

  console.error(`${isRejected ? t`Reject` : t`Error`} ${t`Signing transaction`}`, error)

  if (isRejected) {
    useModals && closeModals()

    return null
  }

  if (useModals) {
    // Show the error inside the modal (transitions from pending → error screen)
    openErrorModal(getProviderErrorMessage(error) || t`Transaction failed`)

    return null
  }

  throw typeof error === 'string' ? new Error(error) : error
}

function isBlockhashExpiredError(error: unknown): boolean {
  const message = error instanceof Error ? error.message : String(error)

  return /blockhash not found/i.test(message) || /block ?height exceeded/i.test(message)
}

/**
 * Fetches a blockhash and sends right before each attempt, rather than once up front: the wallet
 * provider's own signing UI runs between our fetch and the user's approval, and a slow approval can
 * carry the transaction past that blockhash's ~60-90s validity window. Retrying with a freshly fetched
 * blockhash is the standard mitigation — anything other than that specific failure is rethrown as-is.
 */
async function sendWithFreshBlockhash(
  connection: Connection,
  provider: SolanaProvider,
  owner: PublicKey,
  instructions: TransactionInstruction[],
  attemptsLeft = MAX_SEND_ATTEMPTS,
): Promise<{ hash: string; lastValidBlockHeight: number }> {
  // The wallet provider populates neither the blockhash nor the fee payer, so the transaction has to
  // be complete before it is handed over.
  const { blockhash, lastValidBlockHeight } = await connection.getLatestBlockhash()
  const transaction = new Transaction({ feePayer: owner, blockhash, lastValidBlockHeight }).add(...instructions)

  try {
    const hash = await provider.sendTransaction(transaction, connection)

    return { hash, lastValidBlockHeight }
  } catch (error) {
    if (attemptsLeft <= 1 || !isBlockhashExpiredError(error)) throw error

    return sendWithFreshBlockhash(connection, provider, owner, instructions, attemptsLeft - 1)
  }
}

function sendWrapEvent(
  analytics: SolanaWrapUnwrapContext['analytics'],
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
