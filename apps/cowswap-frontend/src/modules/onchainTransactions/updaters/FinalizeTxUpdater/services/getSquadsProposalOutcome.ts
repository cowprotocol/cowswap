import { FiniteMap } from '@cowprotocol/common-utils'

import { PublicKey } from '@solana/web3.js'

import type { AccountInfo, Connection } from '@solana/web3.js'

/**
 * Squads v4, the only multisig program read here. Another program's accounts have a different layout,
 * and misreading one is worse than not reading it at all — see {@link getSquadsProposalOutcome}.
 */
const SQUADS_V4_PROGRAM_ID = new PublicKey('SQDS4ep65T869zMMBKyuUq6aD6EgTu8psMjkvj52pCf')

/** Anchor account discriminators: the first 8 bytes of `sha256("account:<Name>")`. */
const PROPOSAL_DISCRIMINATOR = [26, 94, 189, 187, 116, 136, 53, 33]
const VAULT_TRANSACTION_DISCRIMINATOR = [168, 250, 162, 100, 81, 14, 162, 207]

/** `Proposal` is 8 discriminator + 32 multisig + 8 `transaction_index`, then the status enum's tag. */
const PROPOSAL_STATUS_TAG_OFFSET = 48

/** `VaultTransaction` is 8 discriminator + 32 multisig + 32 creator, then the `u64` index. */
const VAULT_TRANSACTION_MULTISIG_OFFSET = 8
const VAULT_TRANSACTION_INDEX_OFFSET = 72

const PROPOSAL_STATUS_REJECTED = 2
const PROPOSAL_STATUS_EXECUTED = 5
const PROPOSAL_STATUS_CANCELLED = 6

/**
 * `failed` is terminal and gives up on the order; `executed` is terminal and lets it through. Anything
 * this code cannot read with certainty is `unresolved`, which keeps polling.
 */
export type SquadsProposalOutcome = 'failed' | 'executed' | 'unresolved'

/** A signature's proposal never changes, so it is derived once rather than on every poll. */
const MAX_CACHED_PROPOSALS = 50
const proposalAddressBySignature = new FiniteMap<string, PublicKey>(MAX_CACHED_PROPOSALS)

/**
 * What became of the Squads proposal behind `signature`.
 *
 * A multisig wallet does not broadcast the transaction it is handed: it files the instructions for the
 * members to vote on, and `signature` identifies that filing, which succeeds whether or not the members
 * ever execute it. Reading the resulting proposal is the only way to learn that they rejected it and no
 * order is coming.
 *
 * The filing creates a `VaultTransaction` only — the `Proposal` that carries the vote is a separate
 * account from a later transaction this code never sees, so it is derived from the multisig and index
 * rather than looked for among the filing's accounts.
 *
 * Every uncertainty resolves to `unresolved` rather than a verdict: an unrecognised program, a
 * discriminator that does not match, a proposal not created yet, a status outside the known set, or an
 * RPC failure. The cost of guessing wrong in that direction is the order waiting, as it does today; the
 * cost in the other direction is failing an order that is about to be executed.
 */
export async function getSquadsProposalOutcome(
  connection: Connection,
  signature: string,
): Promise<SquadsProposalOutcome> {
  const proposalAddress = await findProposalAddress(connection, signature)

  if (!proposalAddress) return 'unresolved'

  const account = await connection.getAccountInfo(proposalAddress)

  switch (readAccountTag(account, PROPOSAL_DISCRIMINATOR, PROPOSAL_STATUS_TAG_OFFSET)) {
    case PROPOSAL_STATUS_REJECTED:
    case PROPOSAL_STATUS_CANCELLED:
      return 'failed'
    case PROPOSAL_STATUS_EXECUTED:
      return 'executed'
    default:
      return 'unresolved'
  }
}

/** `["multisig", <multisig>, "transaction", <index>, "proposal"]`, as the Squads program derives it. */
function deriveProposalAddress(vaultTransaction: Buffer): PublicKey | undefined {
  if (vaultTransaction.length < VAULT_TRANSACTION_INDEX_OFFSET + 8) return undefined

  try {
    const multisig = new PublicKey(
      vaultTransaction.subarray(VAULT_TRANSACTION_MULTISIG_OFFSET, VAULT_TRANSACTION_MULTISIG_OFFSET + 32),
    )
    const index = Buffer.alloc(8)

    index.writeBigUInt64LE(vaultTransaction.readBigUInt64LE(VAULT_TRANSACTION_INDEX_OFFSET))

    return PublicKey.findProgramAddressSync(
      [Buffer.from('multisig'), multisig.toBuffer(), Buffer.from('transaction'), index, Buffer.from('proposal')],
      SQUADS_V4_PROGRAM_ID,
    )[0]
  } catch {
    // Not a layout this code recognises; the caller keeps waiting rather than guessing.
    return undefined
  }
}

async function findProposalAddress(connection: Connection, signature: string): Promise<PublicKey | undefined> {
  const cached = proposalAddressBySignature.get(signature)

  if (cached) return cached

  const transaction = await connection.getTransaction(signature, { maxSupportedTransactionVersion: 0 })
  const keys = transaction?.transaction.message.staticAccountKeys

  if (!keys?.length) return undefined

  const accounts = await connection.getMultipleAccountsInfo(keys)
  const vaultTransaction = accounts.find(
    (account) => readAccountTag(account, VAULT_TRANSACTION_DISCRIMINATOR, 0) !== undefined,
  )

  if (!vaultTransaction) return undefined

  const address = deriveProposalAddress(vaultTransaction.data)

  if (address) proposalAddressBySignature.set(signature, address)

  return address
}

/** The byte at `tagOffset`, but only for a Squads account whose discriminator matches. */
function readAccountTag(
  account: AccountInfo<Buffer> | null,
  discriminator: number[],
  tagOffset: number,
): number | undefined {
  if (!account || !account.owner.equals(SQUADS_V4_PROGRAM_ID)) return undefined

  const { data } = account

  if (data.length <= tagOffset) return undefined

  return discriminator.every((byte, i) => data[i] === byte) ? data[tagOffset] : undefined
}
