import {
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

interface SolanaTokenBalance {
  mint: string
  balance: bigint
}

// Solana's `getMultipleAccounts` RPC rejects requests for more than 100 accounts, so ATAs must be
// read in batches — a single request for a full token list (hundreds of tokens) fails outright.
const MAX_ACCOUNTS_PER_REQUEST = 100

/**
 * Reads SPL-token balances for `tokens` owned by `ownerAddress`, supporting both the classic SPL Token
 * program and Token-2022.
 *
 * Balances live on the owner's Associated Token Account (ATA), not on the mint. The ATA address and its
 * data layout both depend on the mint's token program, which we take from each token's `isToken2022`
 * flag rather than an extra RPC round-trip to read the mint. ATAs are batch-read via
 * `getMultipleAccountsInfo` in chunks of {@link MAX_ACCOUNTS_PER_REQUEST}. A missing account means the
 * owner never held that token, which is a zero balance rather than an error.
 */
export async function fetchSolanaTokenBalances(
  connection: Connection,
  ownerAddress: string,
  tokens: SolanaTokenMint[],
): Promise<SolanaTokenBalance[]> {
  const owner = new PublicKey(ownerAddress)

  // Every token defaults to a zero balance, keeping the result aligned to `tokens` order regardless
  // of which ATAs resolve or exist.
  const balances: SolanaTokenBalance[] = tokens.map(({ mint }) => ({ mint, balance: 0n }))

  // Derive each ATA up front, isolating any mint that fails to parse. A malformed mint can pass the
  // token list's base58 length/charset check yet still not decode to a 32-byte public key, so
  // `new PublicKey(mint)` would throw. Building the ATAs in a single `map` would let one bad mint
  // reject balances for the entire list — instead we drop it and leave its zero balance in place.
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
      // Malformed mint: leave the default zero balance so the rest of the list still loads.
    }
  })

  const ataInfos = await getMultipleAccountsInfoBatched(
    connection,
    resolvable.map(({ ata }) => ata),
  )

  ataInfos.forEach((info, i) => {
    if (!info) return

    const { index, ata, programId } = resolvable[i]
    balances[index].balance = unpackAccount(ata, info, programId).amount
  })

  return balances
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
