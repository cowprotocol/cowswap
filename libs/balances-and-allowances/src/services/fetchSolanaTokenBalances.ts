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

  const programIds = tokens.map(({ isToken2022 }) => (isToken2022 ? TOKEN_2022_PROGRAM_ID : TOKEN_PROGRAM_ID))
  const atas = tokens.map(({ mint }, index) =>
    getAssociatedTokenAddressSync(new PublicKey(mint), owner, false, programIds[index], ASSOCIATED_TOKEN_PROGRAM_ID),
  )

  const ataInfos = await getMultipleAccountsInfoBatched(connection, atas)

  return ataInfos.map((info, index) => {
    const { mint } = tokens[index]
    if (!info) return { mint, balance: 0n }

    const account = unpackAccount(atas[index], info, programIds[index])

    return { mint, balance: account.amount }
  })
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
