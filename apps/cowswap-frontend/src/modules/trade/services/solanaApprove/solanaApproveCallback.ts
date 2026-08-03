import { findSolanaSettlementStatePda } from '@cowprotocol/balances-and-allowances'
import { getIsToken2022, TokenWithLogo } from '@cowprotocol/common-const'
import { Command } from '@cowprotocol/types'

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
  modals: SolanaApproveModals
}

export interface SolanaApproveModals {
  closeModals: Command
  openTransactionConfirmationModal: Command
  openErrorModal: (message: string) => void
}

export interface SolanaApproveParams {
  useModals?: boolean
}

type TransactionAdder = ReturnType<typeof useTransactionAdder>

/**
 * Solana counterpart to the EVM ERC20 approve. Builds and sends an SPL `approve` delegating the CoW
 * settlement-state PDA on the owner's token account for `token`, up to `amount`.
 */
export async function solanaApproveCallback(
  context: SolanaApproveContext,
  params: SolanaApproveParams = { useModals: true },
): Promise<{ hash: string } | null> {
  const { account, token, amount, connection, provider, addTransaction, modals } = context

  const useModals = params.useModals

  try {
    const owner = new PublicKey(account)

    const instruction = buildApproveInstruction({
      owner,
      mint: new PublicKey(token.address),
      isToken2022: getIsToken2022(token),
      delegate: findSolanaSettlementStatePda(),
      amount,
    })

    useModals && modals.openTransactionConfirmationModal()

    const { hash, lastValidBlockHeight } = await sendSolanaTransaction(connection, provider, owner, [instruction])

    const symbol = token.symbol ?? ''
    // `lastValidBlockHeight` lets the finalizer tell "not landed yet" apart from "dropped for good".
    addTransaction({ hash, summary: t`Approve ${symbol}`, data: { lastValidBlockHeight } })

    useModals && modals.closeModals()

    return { hash }
  } catch (error) {
    return handleSolanaSendError(error, {
      useModals,
      closeModals: modals.closeModals,
      openErrorModal: modals.openErrorModal,
    })
  }
}
