import { EnhancedTransactionDetails } from 'legacy/state/enhancedTransactions/reducer'

import { getIsSolanaSmartContractWallet } from 'modules/trade'

import { getSquadsProposalOutcome } from './getSquadsProposalOutcome'

import type { Connection } from '@solana/web3.js'

export type SolanaStatusResult = { type: 'success' | 'reverted'; slot: number } | { type: 'pending' }

/**
 * What a confirmed signature actually means for the order it was supposed to place.
 *
 * For an ordinary wallet it means the order was placed. A multisig does not broadcast the transaction
 * it is handed: it files the instructions as a proposal for its members to vote on, and the signature
 * identifies that filing, which confirms whether or not the proposal is ever executed. Taking it at
 * face value marks the transaction done while no order exists and none is coming, leaving the order
 * polling the order book forever.
 */
export async function resolveConfirmedSolanaStatus(
  connection: Connection,
  signature: string,
  transaction: EnhancedTransactionDetails,
  slot: number,
): Promise<SolanaStatusResult> {
  if (!getIsMultisigOrderCreation(transaction)) return { type: 'success', slot }

  const outcome = await getSquadsProposalOutcome(connection, signature)

  if (outcome === 'failed') return { type: 'reverted', slot }

  return outcome === 'executed' ? { type: 'success', slot } : { type: 'pending' }
}

function getIsMultisigOrderCreation(transaction: EnhancedTransactionDetails): boolean {
  return Boolean(transaction.solanaOrderCreation) && getIsSolanaSmartContractWallet(transaction.from)
}
