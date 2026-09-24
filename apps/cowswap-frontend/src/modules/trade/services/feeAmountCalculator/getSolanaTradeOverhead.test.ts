/**
 * Program-address derivation needs a working ed25519 curve check, and `PublicKey.isOnCurve` misreports
 * every point as on-curve under jsdom — which makes `findProgramAddressSync` exhaust all 255 bumps.
 * @jest-environment node
 */
import {
  ACCOUNT_SIZE,
  ExtensionType,
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
const BUY_TOKEN_ACCOUNT = new PublicKey('4zMMC9srt5Ri5X14GAgXhaHii3GnPAEERYPJgZJDncDU')
const WSOL_ACCOUNT = new PublicKey('9WzDXwBbmkg8ZTbNMqUxvQRAyrZzDsGYdLVL9zYtAWWM')

// A mint carrying TransferFeeConfig gives its accounts a TransferFeeAmount extension: the base 165
// bytes plus that TLV entry (1 account-type byte + 2 type + 2 length + 8 data).
const TOKEN_2022_ACCOUNT_SIZE = ACCOUNT_SIZE + 13

const WALLET_RENT = 650_240
const TOKEN_ACCOUNT_RENT = 1_488_440
const TOKEN_2022_ACCOUNT_RENT = 1_554_480
const ORDER_RENT = 1_991_360
const SIGNATURE_FEE = 5_000n
const ORDER_ACCOUNT_SIZE = 264

const RENT_BY_SIZE: Record<number, number> = {
  0: WALLET_RENT,
  [ACCOUNT_SIZE]: TOKEN_ACCOUNT_RENT,
  [TOKEN_2022_ACCOUNT_SIZE]: TOKEN_2022_ACCOUNT_RENT,
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
const WSOL_FUNDED_ACCOUNT: SolanaFundedAccount = { address: WSOL_ACCOUNT, size: ACCOUNT_SIZE }

function createConnection(existingAddresses: PublicKey[]): Connection {
  const existing = new Set(existingAddresses.map((address) => address.toBase58()))
  const mintInfos = new Map([
    [BUY_MINT.toBase58(), createMintInfo()],
    [TOKEN_2022_MINT.toBase58(), createToken2022MintInfo()],
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

    expect(overhead).toBe(BigInt(WALLET_RENT) + BigInt(ORDER_RENT) + SIGNATURE_FEE)
  })

  it('skips the rent of accounts that already exist on chain', async () => {
    const connection = createConnection([BUY_TOKEN_ACCOUNT, WSOL_ACCOUNT])

    const overhead = await getSolanaTradeOverhead(connection, [WSOL_FUNDED_ACCOUNT, BUY_ACCOUNT, ORDER_ACCOUNT])

    expect(overhead).toBe(BigInt(WALLET_RENT) + BigInt(ORDER_RENT) + SIGNATURE_FEE)
  })

  it('charges every declared account when none of them exist yet', async () => {
    const connection = createConnection([])

    const overhead = await getSolanaTradeOverhead(connection, [WSOL_FUNDED_ACCOUNT, BUY_ACCOUNT, ORDER_ACCOUNT])

    expect(overhead).toBe(BigInt(WALLET_RENT) + BigInt(ORDER_RENT) + BigInt(TOKEN_ACCOUNT_RENT) * 2n + SIGNATURE_FEE)
  })

  it('resolves a token account size from its mint rather than assuming the base size', async () => {
    const connection = createConnection([])

    await getSolanaTradeOverhead(connection, [BUY_ACCOUNT])

    expect(connection.getMinimumBalanceForRentExemption).toHaveBeenCalledWith(ACCOUNT_SIZE)
  })

  it("prices a Token-2022 account by its mint's extensions, not the classic base size", async () => {
    const connection = createConnection([])

    const overhead = await getSolanaTradeOverhead(connection, [TOKEN_2022_BUY_ACCOUNT])

    expect(connection.getMinimumBalanceForRentExemption).toHaveBeenCalledWith(TOKEN_2022_ACCOUNT_SIZE)
    expect(connection.getMinimumBalanceForRentExemption).not.toHaveBeenCalledWith(ACCOUNT_SIZE)
    expect(overhead).toBe(BigInt(WALLET_RENT) + BigInt(TOKEN_2022_ACCOUNT_RENT) + SIGNATURE_FEE)
  })

  it('costs nothing but the fee and the payer reserve when no step creates an account', async () => {
    const connection = createConnection([])

    const overhead = await getSolanaTradeOverhead(connection, [])

    expect(overhead).toBe(BigInt(WALLET_RENT) + SIGNATURE_FEE)
  })
})
