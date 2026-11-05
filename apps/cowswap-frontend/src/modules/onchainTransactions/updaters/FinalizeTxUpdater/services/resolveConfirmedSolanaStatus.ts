import { EnhancedTransactionDetails } from 'legacy/state/enhancedTransactions/reducer'

import { getIsSolanaSmartContractWallet } from 'modules/trade'

import { getSquadsProposalOutcome } from './getSquadsProposalOutcome'

import type { Connection } from '@solana/web3.js'

/** Why an order-creating transaction failed, when the UI can say something better than "it failed". */
export type SolanaRevertReason = 'multisig-rejected'

export type SolanaStatusResult =
  | { type: 'success'; slot: number }
  | { type: 'reverted'; slot: number; reason?: SolanaRevertReason }
  | { type: 'pending' }

/**
 * What a confirmed signature actually means for the order it was supposed to place.
 *
 * For an ordinary wallet it means the order was placed, or cancelled. A multisig does not broadcast the transaction
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
  if (!getIsMultisigFiling(transaction)) return { type: 'success', slot }

  const outcome = await getSquadsProposalOutcome(connection, signature)

  if (outcome === 'failed') return { type: 'reverted', slot, reason: 'multisig-rejected' }

  return outcome === 'executed' ? { type: 'success', slot } : { type: 'pending' }
}

/**
 * Only transactions whose outcome decides an order's fate. Those have to be signed by the vault, so a
 * multisig can only file them as proposals — which is what makes waiting for the proposal correct.
 * A wrap or an approval is left alone: a spending limit can execute one directly, with no proposal to
 * wait for, and this would hold it pending forever.
 */
function getIsMultisigFiling(transaction: EnhancedTransactionDetails): boolean {
  const decidesAnOrder = Boolean(
    transaction.solanaOrderCreation || transaction.solanaCancelOrderIds || transaction.onChainCancellation,
  )

  return decidesAnOrder && getIsSolanaSmartContractWallet(transaction.from)
}
