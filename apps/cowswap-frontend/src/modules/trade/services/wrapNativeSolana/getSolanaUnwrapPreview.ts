import { NATIVE_CURRENCIES } from '@cowprotocol/common-const'
import { SupportedChainId } from '@cowprotocol/cow-sdk'
import { Currency, CurrencyAmount } from '@cowprotocol/currency'

import { ACCOUNT_SIZE, getAssociatedTokenAddressSync, TOKEN_PROGRAM_ID } from '@solana/spl-token'
import { Connection, PublicKey } from '@solana/web3.js'

import { WSOL_MINT } from './const'

export interface SolanaUnwrapPreview {
  /** Current WSOL balance of the owner's associated token account, read fresh from the chain. */
  wsolBalance: bigint
  /**
   * What the owner will actually end up with. Equal to `lamports` for a partial unwrap; for a full
   * unwrap it also includes the account's rent-exempt reserve, reclaimed when the account closes —
   * see `buildUnwrapSolInstructions`.
   */
  receiveAmount: CurrencyAmount<Currency>
}

/**
 * Previews the result of unwrapping `lamports` of WSOL, without building or sending anything. Shared
 * by the actual send flow (`solanaWrapUnwrapCallback`) and the trade form's live output preview
 * (`useSolanaWrapReceiveAmount`), so both agree on the amount before and after signing.
 */
export async function getSolanaUnwrapPreview(
  connection: Connection,
  owner: PublicKey,
  lamports: bigint,
): Promise<SolanaUnwrapPreview> {
  const [wsolBalance, rentExemptLamports] = await Promise.all([
    readWsolBalance(connection, owner),
    connection.getMinimumBalanceForRentExemption(ACCOUNT_SIZE),
  ])

  const isFullUnwrap = wsolBalance === lamports
  const receiveLamports = isFullUnwrap ? lamports + BigInt(rentExemptLamports) : lamports

  return {
    wsolBalance,
    receiveAmount: CurrencyAmount.fromRawAmount(NATIVE_CURRENCIES[SupportedChainId.SOLANA], receiveLamports),
  }
}

/**
 * Read straight from the chain rather than from the balances cache: a stale value would make the
 * remainder calculation wrong and silently unwrap the wrong amount.
 *
 * A missing account is a zero balance — the owner simply never held WSOL.
 */
async function readWsolBalance(connection: Connection, owner: PublicKey): Promise<bigint> {
  const associatedTokenAccount = getAssociatedTokenAddressSync(WSOL_MINT, owner, false, TOKEN_PROGRAM_ID)
  const accountInfo = await connection.getAccountInfo(associatedTokenAccount)

  if (!accountInfo) return 0n

  const { value } = await connection.getTokenAccountBalance(associatedTokenAccount)

  return BigInt(value.amount)
}
