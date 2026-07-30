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
import { getAssociatedTokenAddressSync, TOKEN_PROGRAM_ID } from '@solana/spl-token'
import { Connection, PublicKey, Transaction } from '@solana/web3.js'

import { WrapUnwrapCallbackParams } from 'legacy/hooks/useWrapCallback'
import { useTransactionAdder } from 'legacy/state/enhancedTransactions/hooks'

import { CowSwapAnalyticsCategory } from 'common/analytics/types'

import { buildUnwrapSolInstructions } from './buildUnwrapSolInstructions'
import { buildWrapSolInstructions } from './buildWrapSolInstructions'
import { WSOL_MINT } from './const'

import type { Provider as SolanaProvider } from '@reown/appkit-adapter-solana'

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
  openTransactionConfirmationModal: Command
  openErrorModal: (message: string) => void
}

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
  const { operationMessage, summary } = getSolanaWrapDescription(isNativeIn, amount)

  try {
    useModals && openTransactionConfirmationModal()
    sendWrapEvent(analytics, 'Send', operationMessage, amount)

    const owner = new PublicKey(account)
    const lamports = amount.quotient

    const instructions = isNativeIn
      ? buildWrapSolInstructions({ owner, lamports })
      : buildUnwrapSolInstructions({ owner, lamports, wsolBalance: await readWsolBalance(connection, owner) })

    // The wallet provider populates neither the blockhash nor the fee payer, so the transaction has to
    // be complete before it is handed over.
    const { blockhash, lastValidBlockHeight } = await connection.getLatestBlockhash()
    const transaction = new Transaction({ feePayer: owner, blockhash, lastValidBlockHeight }).add(...instructions)

    const hash = await provider.sendTransaction(transaction, connection)

    sendWrapEvent(analytics, 'Sign', operationMessage, amount)

    // `lastValidBlockHeight` lets the finalizer tell "not landed yet" apart from "dropped for good".
    addTransaction({ hash, summary, data: { lastValidBlockHeight } })

    useModals && closeModals()

    return { hash }
  } catch (error: unknown) {
    return handleSendError(error, context, { useModals, operationMessage })
  }
}

function getSolanaWrapDescription(
  isWrap: boolean,
  inputAmount: CurrencyAmount<Currency>,
): { operationMessage: string; summary: string } {
  const { native, wrapped } = SOLANA_CURRENCY_SYMBOLS
  const amountStr = formatTokenAmount(inputAmount)

  return {
    summary: isWrap ? t`Wrap ${amountStr} ${native} to ${wrapped}` : t`Unwrap ${amountStr} ${wrapped} to ${native}`,
    // Keep analytics label un-translated on purpose
    operationMessage: isWrap ? t`Wrapping` + ' ' + native : t`Unwrapping` + ' ' + wrapped,
  }
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

/**
 * Read straight from the chain rather than from the balances cache: a stale value would make the
 * remainder calculation wrong and silently unwrap the wrong amount.
 *
 * A missing account is a zero balance — the owner simply never held WSOL.
 */
async function readWsolBalance(connection: Connection, owner: PublicKey): Promise<bigint> {
  const associatedTokenAccount = getAssociatedTokenAddressSync(WSOL_MINT, owner, false, TOKEN_PROGRAM_ID)

  try {
    const { value } = await connection.getTokenAccountBalance(associatedTokenAccount)

    return BigInt(value.amount)
  } catch {
    return 0n
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
