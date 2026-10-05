import { getAccountLenForMint, unpackMint } from '@solana/spl-token'
import { AccountInfo, Connection } from '@solana/web3.js'

import { SolanaFundedAccount } from '../solanaFlow/types'

// `CreateOrder` takes `owner` and `createdBy` as separate signers but the flow passes the same wallet
// for both, so the bundle carries a single signature.
const SIGNATURE_FEE_LAMPORTS = 5000n

/**
 * Lamports a Solana trade needs on top of the sell amount: rent for every declared account, the
 * signature fee, and the fee payer's own rent-exempt reserve. Rent is read live — it does change.
 */
export async function getSolanaTradeOverhead(
  connection: Connection,
  fundedAccounts: SolanaFundedAccount[],
): Promise<bigint> {
  const addresses = fundedAccounts.flatMap(({ address }) => (address ? [address] : []))
  const mints = fundedAccounts.flatMap(({ size }) => (typeof size === 'number' ? [] : [size.mint]))

  // An empty declaration list (a wrap/unwrap) still prices the fee and the payer reserve below, but
  // there is nothing to look up — and the RPC rejects an empty `getMultipleAccounts` batch.
  const accountInfos =
    addresses.length + mints.length > 0 ? await connection.getMultipleAccountsInfo([...addresses, ...mints]) : []
  const existingAddresses = new Set(
    addresses.filter((_, index) => accountInfos[index]).map((address) => address.toBase58()),
  )
  const mintInfos = new Map(mints.map((mint, index) => [mint.toBase58(), accountInfos[addresses.length + index]]))

  const unfunded = fundedAccounts.filter(({ address }) => !address || !existingAddresses.has(address.toBase58()))

  // The zero-data entry is the fee payer's own reserve: the runtime rejects a transaction that would
  // leave it below rent exemption.
  const sizes = [0, ...unfunded.map(({ size }) => resolveSize(size, mintInfos))]
  const rents = await Promise.all(sizes.map((size) => connection.getMinimumBalanceForRentExemption(size)))

  return rents.reduce<bigint>((total, rent) => total + BigInt(rent), SIGNATURE_FEE_LAMPORTS)
}

function resolveSize(size: SolanaFundedAccount['size'], mintInfos: Map<string, AccountInfo<Buffer> | null>): number {
  if (typeof size === 'number') return size

  const { mint, tokenProgramId } = size

  return getAccountLenForMint(unpackMint(mint, mintInfos.get(mint.toBase58()) ?? null, tokenProgramId))
}
