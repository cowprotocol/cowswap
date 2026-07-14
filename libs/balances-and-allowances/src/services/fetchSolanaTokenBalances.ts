import {
  ASSOCIATED_TOKEN_PROGRAM_ID,
  getAssociatedTokenAddressSync,
  TOKEN_PROGRAM_ID,
  unpackAccount,
} from '@solana/spl-token'
import { Connection, PublicKey } from '@solana/web3.js'

interface SolanaTokenBalance {
  mint: string
  balance: bigint
}

// Solana's `getMultipleAccounts` RPC rejects requests for more than 100 accounts, so ATAs must be
// read in batches — a single request for a full token list (hundreds of tokens) fails outright.
const MAX_ACCOUNTS_PER_REQUEST = 100

/**
 * Reads SPL-token balances for `tokenMints` owned by `ownerAddress`.
 *
 * Balances live on the owner's Associated Token Account (ATA), not on the mint, so we derive the
 * ATA for each mint and batch-read them via `getMultipleAccountsInfo` in chunks of
 * {@link MAX_ACCOUNTS_PER_REQUEST}. A missing account means the owner never held that token, which
 * is a zero balance rather than an error.
 */
export async function fetchSolanaTokenBalances(
  connection: Connection,
  ownerAddress: string,
  tokenMints: string[],
): Promise<SolanaTokenBalance[]> {
  const owner = new PublicKey(ownerAddress)

  const atas = tokenMints.map((mint) =>
    getAssociatedTokenAddressSync(new PublicKey(mint), owner, false, TOKEN_PROGRAM_ID, ASSOCIATED_TOKEN_PROGRAM_ID),
  )

  const batches: (typeof atas)[] = []
  for (let i = 0; i < atas.length; i += MAX_ACCOUNTS_PER_REQUEST) {
    batches.push(atas.slice(i, i + MAX_ACCOUNTS_PER_REQUEST))
  }

  const infosPerBatch = await Promise.all(batches.map((batch) => connection.getMultipleAccountsInfo(batch)))
  const infos = infosPerBatch.flat()

  return infos.map((info, index) => {
    if (!info) {
      return { mint: tokenMints[index], balance: 0n }
    }

    const account = unpackAccount(atas[index], info, TOKEN_PROGRAM_ID)

    return { mint: tokenMints[index], balance: account.amount }
  })
}
