import { FiniteMap } from '@cowprotocol/common-utils'

import type { AccountInfo, Connection, PublicKey, VersionedTransactionResponse } from '@solana/web3.js'

/**
 * `failed` is terminal and gives up on the order; `executed` is terminal and lets it through. Anything
 * this code cannot read with certainty is `unresolved`, which keeps polling.
 */
export type SquadsProposalOutcome = 'failed' | 'executed' | 'unresolved'

type SquadsSdk = typeof import('@sqds/multisig')

/** `getMultipleAccountsInfo` is a single RPC call, and the node refuses more addresses than this. */
const MAX_ACCOUNTS_PER_LOOKUP = 100

/** A signature's proposal never changes, so it is derived once rather than on every poll. */
const MAX_CACHED_PROPOSALS = 50
const proposalAddressBySignature = new FiniteMap<string, PublicKey>(MAX_CACHED_PROPOSALS)

/**
 * Loaded on demand: only a multisig owner ever reaches this module, and the SDK carries the whole
 * Squads program surface for what is otherwise a two-account read.
 */
let sdkPromise: Promise<SquadsSdk> | undefined

/**
 * What became of the Squads proposal behind `signature`.
 *
 * A multisig wallet does not broadcast the transaction it is handed: it files the instructions for the
 * members to vote on, and `signature` identifies that filing, which succeeds whether or not the members
 * ever execute it. Reading the resulting proposal is the only way to learn that they rejected it and no
 * order is coming.
 *
 * The filing creates a `VaultTransaction` only — the `Proposal` carrying the vote is a separate account
 * from a later transaction this code never sees, so it is derived from the multisig and index rather
 * than looked for among the filing's accounts.
 *
 * Every uncertainty resolves to `unresolved` rather than a verdict: an account the SDK cannot decode, a
 * proposal not created yet, a status outside the terminal set, or an RPC failure. The cost of guessing
 * wrong in that direction is the order waiting, as it does today; the cost in the other direction is
 * failing an order that is about to be executed.
 */
export async function getSquadsProposalOutcome(
  connection: Connection,
  signature: string,
): Promise<SquadsProposalOutcome> {
  const sdk = await loadSquadsSdk()
  const proposalAddress = await findProposalAddress(connection, signature, sdk)

  if (!proposalAddress) return 'unresolved'

  const account = await connection.getAccountInfo(proposalAddress)

  if (!account) return 'unresolved'

  try {
    const [proposal] = sdk.accounts.Proposal.fromAccountInfo(account)

    switch (proposal.status.__kind) {
      case 'Rejected':
      case 'Cancelled':
        return 'failed'
      case 'Executed':
        return 'executed'
      default:
        return 'unresolved'
    }
  } catch {
    // Not a proposal this SDK version can read; the caller keeps waiting rather than guessing.
    return 'unresolved'
  }
}

async function findProposalAddress(
  connection: Connection,
  signature: string,
  sdk: SquadsSdk,
): Promise<PublicKey | undefined> {
  const cached = proposalAddressBySignature.get(signature)

  if (cached) return cached

  const transaction = await connection.getTransaction(signature, { maxSupportedTransactionVersion: 0 })

  if (!transaction) return undefined

  const keys = getFilingAccountKeys(transaction)

  if (!keys.length) return undefined

  const accounts = await connection.getMultipleAccountsInfo(keys)
  const address = accounts.reduce<PublicKey | undefined>(
    (found, account) => found ?? toProposalAddress(account, sdk),
    undefined,
  )

  if (address) proposalAddressBySignature.set(signature, address)

  return address
}

/**
 * Every account the filing touches, not only the ones written into the message. `staticAccountKeys`
 * leaves out whatever an address lookup table supplied, and Squads does not require the
 * `VaultTransaction` to be static — missing it would leave the order waiting out a rejection forever.
 */
function getFilingAccountKeys(transaction: VersionedTransactionResponse): PublicKey[] {
  const { writable = [], readonly = [] } = transaction.meta?.loadedAddresses ?? {}

  return [...transaction.transaction.message.staticAccountKeys, ...writable, ...readonly].slice(
    0,
    MAX_ACCOUNTS_PER_LOOKUP,
  )
}

function loadSquadsSdk(): Promise<SquadsSdk> {
  sdkPromise ??= import('@sqds/multisig').catch((error: unknown) => {
    // Caching the rejection would retire proposal tracking for the rest of the session, and this import
    // has a real way to fail: the chunk 404s for any tab still open across a deployment.
    sdkPromise = undefined

    throw error
  })

  return sdkPromise
}

/** The proposal the given account votes on, if that account is a Squads `VaultTransaction`. */
function toProposalAddress(account: AccountInfo<Buffer> | null, sdk: SquadsSdk): PublicKey | undefined {
  // The SDK's `deserialize` reads the discriminator as a plain field and never compares it, so
  // identifying the account by whether decoding throws would rest on every other account in the filing
  // happening to overrun the buffer. Check owner and discriminator outright instead.
  if (!account || !account.owner.equals(sdk.PROGRAM_ID)) return undefined

  const discriminator = sdk.accounts.vaultTransactionDiscriminator

  if (!discriminator.every((byte, index) => account.data[index] === byte)) return undefined

  try {
    const [vaultTransaction] = sdk.accounts.VaultTransaction.fromAccountInfo(account)

    return sdk.getProposalPda({
      multisigPda: vaultTransaction.multisig,
      transactionIndex: BigInt(vaultTransaction.index.toString()),
    })[0]
  } catch {
    // Any other account in the filing: not a vault transaction, so nothing to derive from it.
    return undefined
  }
}
