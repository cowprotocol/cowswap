/**
 * Program-address derivation needs a working ed25519 curve check, and `PublicKey.isOnCurve` misreports
 * every point as on-curve under jsdom — which makes `findProgramAddressSync` exhaust all 255 bumps.
 * @jest-environment node
 */
import {
  ACCOUNT_SIZE,
  ExtensionType,
  getAccountLen,
  getMintLen,
  MINT_SIZE,
  TOKEN_2022_PROGRAM_ID,
  TOKEN_PROGRAM_ID,
} from '@solana/spl-token'
import { AccountInfo, Connection, PublicKey } from '@solana/web3.js'

import { getSolanaTradeOverhead } from './getSolanaTradeOverhead'

import { SolanaFundedAccount } from '../solanaFlow/types'

const BUY_MINT = new PublicKey('EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v')
const TOKEN_2022_MINT = new PublicKey('J1toso1uCk3RLmjorhTtrVwY9HJ7X8V9yYac6Y7kGCPn')
const PLAIN_TOKEN_2022_MINT = new PublicKey('Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB')
const BUY_TOKEN_ACCOUNT = new PublicKey('4zMMC9srt5Ri5X14GAgXhaHii3GnPAEERYPJgZJDncDU')
const WSOL_ACCOUNT = new PublicKey('9WzDXwBbmkg8ZTbNMqUxvQRAyrZzDsGYdLVL9zYtAWWM')

// The ATA program stamps ImmutableOwner on every Token-2022 account it creates, on top of whatever
// the mint's own extensions require (TransferFeeConfig on the mint → TransferFeeAmount on the account).
const TOKEN_2022_ACCOUNT_SIZE = getAccountLen([ExtensionType.TransferFeeAmount, ExtensionType.ImmutableOwner])
const PLAIN_TOKEN_2022_ACCOUNT_SIZE = getAccountLen([ExtensionType.ImmutableOwner])

const WALLET_RENT = 650_240
const TOKEN_ACCOUNT_RENT = 1_488_440
const TOKEN_2022_ACCOUNT_RENT = 1_554_480
const PLAIN_TOKEN_2022_ACCOUNT_RENT = 1_523_240
const ORDER_RENT = 1_991_360
const FEES = 5_000n
// Headroom for wallet-injected priority fees, reserved by MAX but never gating the trade.
const PRIORITY_FEES_RESERVE = 1_000_000n
const ORDER_ACCOUNT_SIZE = 264

const RENT_BY_SIZE: Record<number, number> = {
  0: WALLET_RENT,
  [ACCOUNT_SIZE]: TOKEN_ACCOUNT_RENT,
  [TOKEN_2022_ACCOUNT_SIZE]: TOKEN_2022_ACCOUNT_RENT,
  [PLAIN_TOKEN_2022_ACCOUNT_SIZE]: PLAIN_TOKEN_2022_ACCOUNT_RENT,
  [ORDER_ACCOUNT_SIZE]: ORDER_RENT,
}

// `isInitialized` sits after mintAuthorityOption (4), mintAuthority (32), supply (8) and decimals (1).
const MINT_IS_INITIALIZED_OFFSET = 45

const ORDER_ACCOUNT: SolanaFundedAccount = { size: ORDER_ACCOUNT_SIZE }
const BUY_ACCOUNT: SolanaFundedAccount = {
  address: BUY_TOKEN_ACCOUNT,
  size: { mint: BUY_MINT, tokenProgramId: TOKEN_PROGRAM_ID },
}
const TOKEN_2022_BUY_ACCOUNT: SolanaFundedAccount = {
  address: BUY_TOKEN_ACCOUNT,
  size: { mint: TOKEN_2022_MINT, tokenProgramId: TOKEN_2022_PROGRAM_ID },
}
const PLAIN_TOKEN_2022_BUY_ACCOUNT: SolanaFundedAccount = {
  address: BUY_TOKEN_ACCOUNT,
  size: { mint: PLAIN_TOKEN_2022_MINT, tokenProgramId: TOKEN_2022_PROGRAM_ID },
}
const WSOL_FUNDED_ACCOUNT: SolanaFundedAccount = { address: WSOL_ACCOUNT, size: ACCOUNT_SIZE }

function createConnection(existingAddresses: PublicKey[]): Connection {
  const existing = new Set(existingAddresses.map((address) => address.toBase58()))
  const mintInfos = new Map([
    [BUY_MINT.toBase58(), createMintInfo()],
    [TOKEN_2022_MINT.toBase58(), createToken2022MintInfo()],
    [PLAIN_TOKEN_2022_MINT.toBase58(), createPlainToken2022MintInfo()],
  ])

  return {
    getMultipleAccountsInfo: jest
      .fn()
      .mockImplementation((addresses: PublicKey[]) =>
        Promise.resolve(
          addresses.map(
            (address) => mintInfos.get(address.toBase58()) ?? (existing.has(address.toBase58()) ? {} : null),
          ),
        ),
      ),
    getMinimumBalanceForRentExemption: jest.fn().mockImplementation((size: number) => {
      const rent = RENT_BY_SIZE[size]

      if (rent === undefined) throw new Error(`Unexpected account size ${size}`)

      return Promise.resolve(rent)
    }),
  } as unknown as Connection
}

function createMintInfo(): AccountInfo<Buffer> {
  const data = Buffer.alloc(MINT_SIZE)
  data[MINT_IS_INITIALIZED_OFFSET] = 1

  return { data, owner: TOKEN_PROGRAM_ID, executable: false, lamports: 0, rentEpoch: 0 }
}

// A Token-2022 mint with no extensions is laid out exactly like a classic mint.
function createPlainToken2022MintInfo(): AccountInfo<Buffer> {
  const data = Buffer.alloc(MINT_SIZE)
  data[MINT_IS_INITIALIZED_OFFSET] = 1

  return { data, owner: TOKEN_2022_PROGRAM_ID, executable: false, lamports: 0, rentEpoch: 0 }
}

/**
 * An extended mint is padded to `ACCOUNT_SIZE` and tagged with an account-type byte so it can't be
 * confused with a token account; its TLV entries follow that byte.
 */
function createToken2022MintInfo(): AccountInfo<Buffer> {
  const length = getMintLen([ExtensionType.TransferFeeConfig])
  const data = Buffer.alloc(length)

  data[MINT_IS_INITIALIZED_OFFSET] = 1
  data[ACCOUNT_SIZE] = 1
  data.writeUInt16LE(ExtensionType.TransferFeeConfig, ACCOUNT_SIZE + 1)
  data.writeUInt16LE(length - ACCOUNT_SIZE - 5, ACCOUNT_SIZE + 3)

  return { data, owner: TOKEN_2022_PROGRAM_ID, executable: false, lamports: 0, rentEpoch: 0 }
}

describe('getSolanaTradeOverhead', () => {
  it('charges an addressless account unconditionally, since it is new by construction', async () => {
    const connection = createConnection([])

    const overhead = await getSolanaTradeOverhead(connection, [ORDER_ACCOUNT])

    expect(overhead.required).toBe(BigInt(WALLET_RENT) + BigInt(ORDER_RENT) + FEES)
  })

  it('reserves the priority-fee headroom for MAX only, never in the gating figure', async () => {
    const connection = createConnection([])

    const overhead = await getSolanaTradeOverhead(connection, [ORDER_ACCOUNT])

    expect(overhead.maxReserve).toBe(overhead.required + PRIORITY_FEES_RESERVE)
  })

  it('skips the rent of accounts that already exist on chain', async () => {
    const connection = createConnection([BUY_TOKEN_ACCOUNT, WSOL_ACCOUNT])

    const overhead = await getSolanaTradeOverhead(connection, [WSOL_FUNDED_ACCOUNT, BUY_ACCOUNT, ORDER_ACCOUNT])

    expect(overhead.required).toBe(BigInt(WALLET_RENT) + BigInt(ORDER_RENT) + FEES)
  })

  it('charges every declared account when none of them exist yet', async () => {
    const connection = createConnection([])

    const overhead = await getSolanaTradeOverhead(connection, [WSOL_FUNDED_ACCOUNT, BUY_ACCOUNT, ORDER_ACCOUNT])

    expect(overhead.required).toBe(BigInt(WALLET_RENT) + BigInt(ORDER_RENT) + BigInt(TOKEN_ACCOUNT_RENT) * 2n + FEES)
  })

  it('resolves a token account size from its mint rather than assuming the base size', async () => {
    const connection = createConnection([])

    await getSolanaTradeOverhead(connection, [BUY_ACCOUNT])

    expect(connection.getMinimumBalanceForRentExemption).toHaveBeenCalledWith(ACCOUNT_SIZE)
  })

  it("prices a Token-2022 account by its mint's extensions plus ImmutableOwner, not the classic base size", async () => {
    const connection = createConnection([])

    const overhead = await getSolanaTradeOverhead(connection, [TOKEN_2022_BUY_ACCOUNT])

    expect(connection.getMinimumBalanceForRentExemption).toHaveBeenCalledWith(TOKEN_2022_ACCOUNT_SIZE)
    expect(connection.getMinimumBalanceForRentExemption).not.toHaveBeenCalledWith(ACCOUNT_SIZE)
    expect(overhead.required).toBe(BigInt(WALLET_RENT) + BigInt(TOKEN_2022_ACCOUNT_RENT) + FEES)
  })

  // The ATA program adds ImmutableOwner even when the mint itself demands no account extensions,
  // so an extensionless Token-2022 mint still prices above the classic 165 bytes.
  it('prices ImmutableOwner for a Token-2022 mint without extensions', async () => {
    const connection = createConnection([])

    const overhead = await getSolanaTradeOverhead(connection, [PLAIN_TOKEN_2022_BUY_ACCOUNT])

    expect(connection.getMinimumBalanceForRentExemption).toHaveBeenCalledWith(PLAIN_TOKEN_2022_ACCOUNT_SIZE)
    expect(connection.getMinimumBalanceForRentExemption).not.toHaveBeenCalledWith(ACCOUNT_SIZE)
    expect(overhead.required).toBe(BigInt(WALLET_RENT) + BigInt(PLAIN_TOKEN_2022_ACCOUNT_RENT) + FEES)
  })

  it('costs nothing but the fees and the payer reserve when no step creates an account', async () => {
    const connection = createConnection([])

    const overhead = await getSolanaTradeOverhead(connection, [])

    expect(overhead.required).toBe(BigInt(WALLET_RENT) + FEES)
    // The RPC rejects an empty `getMultipleAccounts` batch, so nothing may be looked up here —
    // this is the wrap/unwrap path, which declares no accounts at all.
    expect(connection.getMultipleAccountsInfo).not.toHaveBeenCalled()
  })

  // A sponsored native sell: the funder pays the fees and every rent — including any wallet-injected
  // priority fee, so no headroom is reserved either — but the wrap transfer debits the owner's wallet,
  // which must still end at or above its own rent-exempt minimum.
  it('charges only the wallet reserve when a sponsor pays the fees', async () => {
    const connection = createConnection([])

    const overhead = await getSolanaTradeOverhead(connection, [], { ownerPaysFees: false })

    expect(overhead.required).toBe(BigInt(WALLET_RENT))
    expect(overhead.maxReserve).toBe(BigInt(WALLET_RENT))
  })
})
