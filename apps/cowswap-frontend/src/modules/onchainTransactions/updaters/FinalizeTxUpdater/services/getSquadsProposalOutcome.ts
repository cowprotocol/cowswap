import { FiniteMap } from '@cowprotocol/common-utils'

import { PublicKey } from '@solana/web3.js'

import type { AccountInfo, Connection } from '@solana/web3.js'

/**
 * Squads v4, the only multisig program read here. Another program's accounts have a different layout,
 * and misreading one is worse than not reading it at all — see {@link getSquadsProposalOutcome}.
 */
const SQUADS_V4_PROGRAM_ID = 'SQDS4ep65T869zMMBKyuUq6aD6EgTu8psMjkvj52pCf'

/** Anchor's account discriminator: the first 8 bytes of `sha256("account:Proposal")`. */
const PROPOSAL_DISCRIMINATOR = [26, 94, 189, 187, 116, 136, 53, 33]

/** `Proposal` is 8 discriminator + 32 multisig + 8 `transaction_index`, then the status enum's tag. */
const PROPOSAL_STATUS_TAG_OFFSET = 48

const PROPOSAL_STATUS_REJECTED = 2
const PROPOSAL_STATUS_EXECUTED = 5
const PROPOSAL_STATUS_CANCELLED = 6

/**
 * `failed` is terminal and gives up on the order; `executed` is terminal and lets it through. Anything
 * this code cannot read with certainty is `unresolved`, which keeps polling.
 */
export type SquadsProposalOutcome = 'failed' | 'executed' | 'unresolved'

/** Only pending transactions are ever looked up, and they are few; the bound just stops it growing. */
const MAX_CACHED_PROPOSALS = 50

/** A signature's proposal never changes, so it is looked up once rather than on every poll. */
const proposalAddressBySignature = new FiniteMap<string, PublicKey>(MAX_CACHED_PROPOSALS)

/**
 * What became of the Squads proposal that `signature` created.
 *
 * A multisig wallet does not broadcast the transaction it is handed: it files the instructions as a
 * proposal for the members to vote on, and `signature` identifies *that* filing, which succeeds whether
 * or not the proposal is ever executed. Reading the resulting proposal account is the only way to learn
 * that the members rejected it and no order is coming.
 *
 * Every uncertainty resolves to `unresolved` rather than a verdict: a missing account, an unrecognised
 * program, a discriminator that does not match, a status byte outside the known set, or an RPC failure.
 * The cost of guessing wrong in that direction is the order waiting, as it does today; the cost in the
 * other direction is failing an order that is about to be executed.
 */
export async function getSquadsProposalOutcome(
  connection: Connection,
  signature: string,
): Promise<SquadsProposalOutcome> {
  const proposalAddress = await findProposalAddress(connection, signature)

  if (!proposalAddress) return 'unresolved'

  const account = await connection.getAccountInfo(proposalAddress)

  switch (readProposalStatus(account)) {
    case PROPOSAL_STATUS_REJECTED:
    case PROPOSAL_STATUS_CANCELLED:
      return 'failed'
    case PROPOSAL_STATUS_EXECUTED:
      return 'executed'
    default:
      return 'unresolved'
  }
}

async function findProposalAddress(connection: Connection, signature: string): Promise<PublicKey | undefined> {
  const cached = proposalAddressBySignature.get(signature)

  if (cached) return cached

  const transaction = await connection.getTransaction(signature, { maxSupportedTransactionVersion: 0 })
  const keys = transaction?.transaction.message.staticAccountKeys

  if (!keys?.length) return undefined

  const accounts = await connection.getMultipleAccountsInfo(keys)
  const index = accounts.findIndex((account) => readProposalStatus(account) !== undefined)

  if (index === -1) return undefined

  const address = keys[index]

  proposalAddressBySignature.set(signature, address)

  return address
}

/** The status tag of a Squads v4 `Proposal`, or `undefined` for anything that is not one. */
function readProposalStatus(account: AccountInfo<Buffer> | null): number | undefined {
  if (!account || account.owner.toBase58() !== SQUADS_V4_PROGRAM_ID) return undefined

  const { data } = account

  if (data.length <= PROPOSAL_STATUS_TAG_OFFSET) return undefined

  const isProposal = PROPOSAL_DISCRIMINATOR.every((byte, i) => data[i] === byte)

  return isProposal ? data[PROPOSAL_STATUS_TAG_OFFSET] : undefined
}
