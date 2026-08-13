import { WRAPPED_NATIVE_CURRENCIES } from '@cowprotocol/common-const'
import { normalizeError } from '@cowprotocol/common-utils'
import { SupportedChainId } from '@cowprotocol/cow-sdk'

import { Connection, PublicKey } from '@solana/web3.js'

import { TransactionAdder } from 'legacy/state/enhancedTransactions/hooks'

import { planDelegateStep } from './planDelegateStep'
import { planWrapStep } from './planWrapStep'
import { sendSolanaFlow } from './sendSolanaFlow'
import { SolanaFlowStep } from './types'

import { handleSolanaSendError } from '../solanaSend/handleSolanaSendError'

import type { Provider as SolanaProvider } from '@reown/appkit-adapter-solana/react'

export interface SolanaNativeSwapContext {
  account: string
  connection: Connection
  provider: SolanaProvider
  addTransaction: TransactionAdder
  // Native SOL lamports being sold — the trade's exact sell amount.
  sellAmount: bigint
  // Currently delegated WSOL amount, e.g. from `useSolanaDelegationAllowance`.
  currentDelegation: bigint
}

const WSOL = WRAPPED_NATIVE_CURRENCIES[SupportedChainId.SOLANA]

// Wraps and delegates the exact sell amount in one signed transaction. Order creation isn't part of this yet — this only covers the "enable trading" prerequisite.
export async function solanaNativeSwapCallback(context: SolanaNativeSwapContext): Promise<{ hash: string } | null> {
  const { account, connection, provider, addTransaction, sellAmount, currentDelegation } = context

  try {
    const owner = new PublicKey(account)

    const wrapStep = planWrapStep({ owner, sellAmount })
    const delegateStep = planDelegateStep({ owner, token: WSOL, amount: sellAmount, currentDelegation })
    const steps = [wrapStep, delegateStep].filter((step): step is SolanaFlowStep => step !== null)

    return await sendSolanaFlow({ connection, provider, owner, addTransaction }, steps)
  } catch (err: unknown) {
    const error = normalizeError(err)

    return handleSolanaSendError(error, { useModals: false })
  }
}
