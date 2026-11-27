import { getEpochFee, getTransferFeeConfig, TOKEN_2022_PROGRAM_ID, unpackMint } from '@solana/spl-token'
import { Connection, PublicKey } from '@solana/web3.js'

/**
 * Transfer fee in basis points that a Token-2022 mint currently charges, or `null` when the mint has no
 * transfer fee.
 */
export async function getSolanaTransferFeeBps(connection: Connection, mint: PublicKey): Promise<number | null> {
  const accountInfo = await connection.getAccountInfo(mint)

  if (!accountInfo || !accountInfo.owner.equals(TOKEN_2022_PROGRAM_ID)) return null

  const feeConfig = getTransferFeeConfig(unpackMint(mint, accountInfo, TOKEN_2022_PROGRAM_ID))

  if (!feeConfig) return null

  const { olderTransferFee, newerTransferFee } = feeConfig
  const bps =
    olderTransferFee.transferFeeBasisPoints === newerTransferFee.transferFeeBasisPoints
      ? newerTransferFee.transferFeeBasisPoints
      : getEpochFee(feeConfig, BigInt((await connection.getEpochInfo()).epoch)).transferFeeBasisPoints

  return bps > 0 ? bps : null
}
