import { findSolanaSettlementStatePda } from '@cowprotocol/balances-and-allowances'
import { getIsToken2022, TokenWithLogo } from '@cowprotocol/common-const'
import { getProviderErrorMessage, isRejectRequestProviderError } from '@cowprotocol/common-utils'

import { t } from '@lingui/core/macro'
import { Connection, PublicKey, Transaction } from '@solana/web3.js'

import { useTransactionAdder } from 'legacy/state/enhancedTransactions/hooks'

import { buildApproveInstruction } from './buildApproveInstruction'

import type { Provider as SolanaProvider } from '@reown/appkit-adapter-solana'

export interface SolanaApproveContext {
  account: string
  token: TokenWithLogo
  amount: bigint
  connection: Connection
  provider: SolanaProvider
  addTransaction: TransactionAdder
}

type TransactionAdder = ReturnType<typeof useTransactionAdder>

/**
 * Solana counterpart to the EVM ERC20 approve. Builds and sends an SPL `approve` delegating the CoW
 * settlement-state PDA on the owner's token account for `token`, up to `amount`
 */
export async function solanaApproveCallback(context: SolanaApproveContext): Promise<{ hash: string } | null> {
  const { account, token, amount, connection, provider, addTransaction } = context

  try {
    const owner = new PublicKey(account)

    const instruction = buildApproveInstruction({
      owner,
      mint: new PublicKey(token.address),
      isToken2022: getIsToken2022(token),
      delegate: findSolanaSettlementStatePda(),
      amount,
    })

    // The wallet provider populates neither the blockhash nor the fee payer, so the transaction has to
    // be complete before it is handed over.
    const { blockhash, lastValidBlockHeight } = await connection.getLatestBlockhash()
    const transaction = new Transaction({ feePayer: owner, blockhash, lastValidBlockHeight }).add(instruction)

    const hash = await provider.sendTransaction(transaction, connection)

    const symbol = token.symbol ?? ''
    // `lastValidBlockHeight` lets the finalizer tell "not landed yet" apart from "dropped for good".
    addTransaction({ hash, summary: t`Approve ${symbol}`, data: { lastValidBlockHeight } })

    // Wait for the delegation to actually land before reporting success. There is no progress modal
    // here (unlike the wrap flow), so the caller's pending state covers signing through confirmation.
    await connection.confirmTransaction({ signature: hash, blockhash, lastValidBlockHeight }, 'confirmed')

    return { hash }
  } catch (error) {
    // A rejection is the user's choice, not a failure — swallow it. Anything else propagates so the
    // caller can surface it.
    if (isRejectRequestProviderError(error)) {
      return null
    }

    throw new Error(getProviderErrorMessage(error) || t`Transaction failed`)
  }
}
