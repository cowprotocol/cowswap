import { NATIVE_CURRENCIES, WRAPPED_NATIVE_CURRENCIES } from '@cowprotocol/common-const'
import { SupportedChainId } from '@cowprotocol/cow-sdk'
import { Currency, CurrencyAmount } from '@cowprotocol/currency'

import { ACCOUNT_SIZE, getAssociatedTokenAddressSync, TOKEN_PROGRAM_ID } from '@solana/spl-token'
import { Connection, PublicKey } from '@solana/web3.js'

import { WSOL_MINT } from './const'

export interface SolanaWrapPreview {
  /** What the owner spends on this wrap — always exactly the typed amount. */
  sendAmount: CurrencyAmount<Currency>
  /**
   * The WSOL gained from this wrap. Equal to the typed amount when the WSOL associated token account
   * already exists; when it doesn't, creating it costs a one-time rent-exempt deposit that comes out of
   * the typed amount instead of being added on top, so the owner ends up with correspondingly less WSOL
   * — see `buildWrapSolInstructions`. That deposit isn't lost: it comes back in full the next time the
   * account is emptied by a full unwrap — see `getSolanaUnwrapPreview`.
   */
  receiveAmount: CurrencyAmount<Currency>
  /** Lamports the transfer instruction should move — see `buildWrapSolInstructions`. */
  transferLamports: bigint
}

/**
 * Previews the result of wrapping `lamports` of SOL, without building or sending anything. Shared by
 * the actual send flow (`solanaWrapUnwrapCallback`) and the trade form's live output preview
 * (`useSolanaWrapReceiveAmount`), so both agree on the amount before and after signing.
 */
export async function getSolanaWrapPreview(
  connection: Connection,
  owner: PublicKey,
  lamports: bigint,
): Promise<SolanaWrapPreview> {
  const associatedTokenAccount = getAssociatedTokenAddressSync(WSOL_MINT, owner, false, TOKEN_PROGRAM_ID)

  const [accountInfo, rentExemptLamports] = await Promise.all([
    connection.getAccountInfo(associatedTokenAccount),
    connection.getMinimumBalanceForRentExemption(ACCOUNT_SIZE),
  ])

  const transferLamports = accountInfo ? lamports : lamports - BigInt(rentExemptLamports)

  if (transferLamports <= 0n) {
    throw new Error('Wrap amount is too small to cover the new account rent-exempt deposit')
  }

  return {
    sendAmount: CurrencyAmount.fromRawAmount(NATIVE_CURRENCIES[SupportedChainId.SOLANA], lamports),
    receiveAmount: CurrencyAmount.fromRawAmount(WRAPPED_NATIVE_CURRENCIES[SupportedChainId.SOLANA], transferLamports),
    transferLamports,
  }
}
