import {
  type Account,
  ASSOCIATED_TOKEN_PROGRAM_ID,
  getAssociatedTokenAddressSync,
  TOKEN_2022_PROGRAM_ID,
  TOKEN_PROGRAM_ID,
  unpackAccount,
} from '@solana/spl-token'
import { AccountInfo, Connection, PublicKey } from '@solana/web3.js'

export interface SolanaTokenMint {
  mint: string
  // Token-2022 mints use a different program, which changes both the ATA address and its data layout.
  // Sourced from the token list's `extensions.isToken2022` flag.
  isToken2022: boolean
}

// Solana's `getMultipleAccounts` RPC rejects requests for more than 100 accounts, so ATAs must be
// read in batches — a single request for a full token list (hundreds of tokens) fails outright.
const MAX_ACCOUNTS_PER_REQUEST = 100

/**
 * Reads the owner's SPL-token accounts (ATAs) for `tokens`, aligned to input order. An entry is `null`
 * when the ATA does not exist, the mint is malformed, or the account is not a valid token account.
 *
 * Both the balance and the delegate live on this single account, so one batched read serves both
 * {@link fetchSolanaTokenBalances} and `fetchSolanaTokenDelegates` — no per-token polling.
 *
 * The ATA address and its data layout depend on the mint's token program, taken from each token's
 * `isToken2022` flag rather than an extra RPC round-trip to read the mint.
 */
export async function readSolanaTokenAccounts(
  connection: Connection,
  ownerAddress: string,
  tokens: SolanaTokenMint[],
): Promise<(Account | null)[]> {
  const owner = new PublicKey(ownerAddress)

  const accounts: (Account | null)[] = tokens.map(() => null)

  // Derive each ATA up front, isolating any mint that fails to parse. A malformed mint can pass the
  // token list's base58 length/charset check yet still not decode to a 32-byte public key, so
  // `new PublicKey(mint)` throws — drop it and leave its `null` in place instead of failing the batch.
  const resolvable: { index: number; ata: PublicKey; programId: PublicKey }[] = []
  tokens.forEach(({ mint, isToken2022 }, index) => {
    const programId = isToken2022 ? TOKEN_2022_PROGRAM_ID : TOKEN_PROGRAM_ID
    try {
      const ata = getAssociatedTokenAddressSync(
        new PublicKey(mint),
        owner,
        false,
        programId,
        ASSOCIATED_TOKEN_PROGRAM_ID,
      )
      resolvable.push({ index, ata, programId })
    } catch {
      // Malformed mint: leave the default `null` so the rest of the list still loads.
    }
  })

  const ataInfos = await getMultipleAccountsInfoBatched(
    connection,
    resolvable.map(({ ata }) => ata),
  )

  ataInfos.forEach((info, i) => {
    if (!info) return

    const { index, ata, programId } = resolvable[i]

    try {
      accounts[index] = unpackAccount(ata, info, programId)
    } catch {
      // Account exists but is not a valid token account (e.g., uninitialized lamport transfer). Leave `null`.
    }
  })

  return accounts
}

async function getMultipleAccountsInfoBatched(
  connection: Connection,
  addresses: PublicKey[],
): Promise<(AccountInfo<Buffer> | null)[]> {
  const batches: PublicKey[][] = []
  for (let i = 0; i < addresses.length; i += MAX_ACCOUNTS_PER_REQUEST) {
    batches.push(addresses.slice(i, i + MAX_ACCOUNTS_PER_REQUEST))
  }

  const infosPerBatch = await Promise.all(batches.map((batch) => connection.getMultipleAccountsInfo(batch)))

  return infosPerBatch.flat()
}
