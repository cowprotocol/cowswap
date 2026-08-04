import { findSolanaSettlementStatePda } from '@cowprotocol/balances-and-allowances'
import { getIsToken2022, TokenWithLogo } from '@cowprotocol/common-const'

import { t } from '@lingui/core/macro'
import { Connection, PublicKey } from '@solana/web3.js'

import { useTransactionAdder } from 'legacy/state/enhancedTransactions/hooks'

import { buildApproveInstruction } from './buildApproveInstruction'

import { handleSolanaSendError } from '../solanaSend/handleSolanaSendError'
import { sendSolanaTransaction } from '../solanaSend/sendSolanaTransaction'

import type { Provider as SolanaProvider } from '@reown/appkit-adapter-solana/react'

export interface SolanaApproveContext {
  account: string
  token: TokenWithLogo
  amount: bigint
  connection: Connection
  provider: SolanaProvider
  addTransaction: TransactionAdder
}

type TransactionAdder = ReturnType<typeof useTransactionAdder>

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

    const { hash, lastValidBlockHeight } = await sendSolanaTransaction(connection, provider, owner, [instruction])

    const symbol = token.symbol ?? ''
    // `lastValidBlockHeight` lets the finalizer tell "not landed yet" apart from "dropped for good".
    addTransaction({ hash, summary: t`Approve ${symbol}`, data: { lastValidBlockHeight } })

    return { hash }
  } catch (error) {
    // No modals here: rejection resolves to `null`, anything else rethrows for the caller to surface.
    return handleSolanaSendError(error, { useModals: false })
  }
}
