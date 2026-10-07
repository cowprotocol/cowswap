import {
  ACCOUNT_SIZE,
  ExtensionType,
  getAccountLen,
  getAccountTypeOfMintType,
  getExtensionTypes,
  TOKEN_2022_PROGRAM_ID,
  unpackMint,
} from '@solana/spl-token'
import { AccountInfo, Connection } from '@solana/web3.js'

import { SolanaFundedAccount } from '../solanaFlow/types'

// `CreateOrder` takes `owner` and `createdBy` as separate signers but the flow passes the same wallet
// for both, so the bundle carries a single signature.
const SIGNATURE_FEE_LAMPORTS = 5000n

// Wallets inject their own ComputeBudget instructions into a transaction that carries none (QA saw a
// ~200k-CU budget added on a wrap), so the real fee is the base plus a priority fee unknowable at
// form time. Without headroom, a MAX'd transaction leaves the fee payer below rent exemption by
// exactly that injected fee. 0.001 SOL covers wallets' auto-fee ceilings. Only `maxReserve` carries
// it: the shortfall gate must not refuse a payable transaction over an estimate — if an injected fee
// does push a marginal transaction over, the wallet fails it and `handleSolanaSendError` explains.
const PRIORITY_FEES_RESERVE_LAMPORTS = 1_000_000n

export interface SolanaTradeOverhead {
  /** Lamports the transaction is known to need on top of the sell amount — gates the trade button. */
  required: bigint
  /** `required` plus headroom for wallet-injected priority fees — what the MAX button reserves. */
  maxReserve: bigint
}

export interface SolanaTradeOverheadOptions {
  /** False on a sponsored trade. */
  ownerPaysFees?: boolean
}

/**
 * Lamports a Solana trade needs on top of the sell amount: rent for every declared account, the
 * fees (unless a sponsor pays them), and the wallet's own rent-exempt reserve. Rent is read live —
 * it does change.
 */
export async function getSolanaTradeOverhead(
  connection: Connection,
  fundedAccounts: SolanaFundedAccount[],
  { ownerPaysFees = true }: SolanaTradeOverheadOptions = {},
): Promise<SolanaTradeOverhead> {
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

  const fees = ownerPaysFees ? SIGNATURE_FEE_LAMPORTS : 0n
  const required = rents.reduce<bigint>((total, rent) => total + BigInt(rent), fees)

  return {
    required,
    maxReserve: ownerPaysFees ? required + PRIORITY_FEES_RESERVE_LAMPORTS : required,
  }
}

function resolveSize(size: SolanaFundedAccount['size'], mintInfos: Map<string, AccountInfo<Buffer> | null>): number {
  if (typeof size === 'number') return size

  const { mint, tokenProgramId } = size
  const mintState = unpackMint(mint, mintInfos.get(mint.toBase58()) ?? null, tokenProgramId)

  if (!tokenProgramId.equals(TOKEN_2022_PROGRAM_ID)) return ACCOUNT_SIZE

  // Not `getAccountLenForMint`: it mis-sizes two cases — it omits the `ImmutableOwner` extension the
  // associated-token-account program stamps on every Token-2022 account it creates, and it prices
  // mint-only extensions (mapped to `Uninitialized`) as 4-byte TLV entries the account never carries.
  const accountExtensions = getExtensionTypes(mintState.tlvData)
    .map(getAccountTypeOfMintType)
    .filter((extension) => extension !== ExtensionType.Uninitialized)

  return getAccountLen([...accountExtensions, ExtensionType.ImmutableOwner])
}
