/**
 * @jest-environment node
 */
import {
  ACCOUNT_SIZE,
  AccountLayout,
  AccountState,
  ASSOCIATED_TOKEN_PROGRAM_ID,
  getAssociatedTokenAddressSync,
  TOKEN_2022_PROGRAM_ID,
  TOKEN_PROGRAM_ID,
} from '@solana/spl-token'
import { AccountInfo, Connection, Keypair, PublicKey } from '@solana/web3.js'

import { fetchSolanaTokenBalances } from './fetchSolanaTokenBalances'

const OWNER = Keypair.generate().publicKey
const CLASSIC_MINT = Keypair.generate().publicKey
const TOKEN_2022_MINT = Keypair.generate().publicKey

function ataFor(mint: PublicKey, programId: PublicKey): PublicKey {
  return getAssociatedTokenAddressSync(mint, OWNER, false, programId, ASSOCIATED_TOKEN_PROGRAM_ID)
}

function createConnection(accounts: Map<string, AccountInfo<Buffer> | null>): Connection {
  return {
    rpcEndpoint: 'mock',
    getMultipleAccountsInfo: jest.fn(async (pubkeys: PublicKey[]) =>
      pubkeys.map((pubkey) => accounts.get(pubkey.toBase58()) ?? null),
    ),
  } as unknown as Connection
}

/**
 * Builds a real, decodable SPL-token account so the production `unpackAccount` runs for real —
 * mocking `unpackAccount` would hide an incorrect program being passed to it.
 */
function encodeTokenAccount(
  mint: PublicKey,
  owner: PublicKey,
  amount: bigint,
  programId: PublicKey,
): AccountInfo<Buffer> {
  const data = Buffer.alloc(ACCOUNT_SIZE)
  AccountLayout.encode(
    {
      mint,
      owner,
      amount,
      delegateOption: 0,
      delegate: PublicKey.default,
      state: AccountState.Initialized,
      isNativeOption: 0,
      isNative: 0n,
      delegatedAmount: 0n,
      closeAuthorityOption: 0,
      closeAuthority: PublicKey.default,
    },
    data,
  )

  return { data, owner: programId, lamports: 1, executable: false, rentEpoch: 0 }
}

describe('fetchSolanaTokenBalances', () => {
  it('derives a Token-2022 ATA for mints flagged isToken2022', async () => {
    const ata = ataFor(TOKEN_2022_MINT, TOKEN_2022_PROGRAM_ID)
    const connection = createConnection(
      new Map<string, AccountInfo<Buffer> | null>([
        [ata.toBase58(), encodeTokenAccount(TOKEN_2022_MINT, OWNER, 1234n, TOKEN_2022_PROGRAM_ID)],
      ]),
    )

    const result = await fetchSolanaTokenBalances(connection, OWNER.toBase58(), [
      { mint: TOKEN_2022_MINT.toBase58(), isToken2022: true },
    ])

    expect(result).toEqual([{ mint: TOKEN_2022_MINT.toBase58(), balance: 1234n }])
  })

  it('derives a classic ATA for mints not flagged isToken2022', async () => {
    const ata = ataFor(CLASSIC_MINT, TOKEN_PROGRAM_ID)
    const connection = createConnection(
      new Map<string, AccountInfo<Buffer> | null>([
        [ata.toBase58(), encodeTokenAccount(CLASSIC_MINT, OWNER, 500n, TOKEN_PROGRAM_ID)],
      ]),
    )

    const result = await fetchSolanaTokenBalances(connection, OWNER.toBase58(), [
      { mint: CLASSIC_MINT.toBase58(), isToken2022: false },
    ])

    expect(result).toEqual([{ mint: CLASSIC_MINT.toBase58(), balance: 500n }])
  })

  it('resolves classic and Token-2022 mints in the same request', async () => {
    const classicAta = ataFor(CLASSIC_MINT, TOKEN_PROGRAM_ID)
    const token2022Ata = ataFor(TOKEN_2022_MINT, TOKEN_2022_PROGRAM_ID)
    const connection = createConnection(
      new Map<string, AccountInfo<Buffer> | null>([
        [classicAta.toBase58(), encodeTokenAccount(CLASSIC_MINT, OWNER, 500n, TOKEN_PROGRAM_ID)],
        [token2022Ata.toBase58(), encodeTokenAccount(TOKEN_2022_MINT, OWNER, 1234n, TOKEN_2022_PROGRAM_ID)],
      ]),
    )

    const result = await fetchSolanaTokenBalances(connection, OWNER.toBase58(), [
      { mint: CLASSIC_MINT.toBase58(), isToken2022: false },
      { mint: TOKEN_2022_MINT.toBase58(), isToken2022: true },
    ])

    expect(result).toEqual([
      { mint: CLASSIC_MINT.toBase58(), balance: 500n },
      { mint: TOKEN_2022_MINT.toBase58(), balance: 1234n },
    ])
  })

  it('keeps balances aligned to input order when an ATA is missing', async () => {
    const token2022Ata = ataFor(TOKEN_2022_MINT, TOKEN_2022_PROGRAM_ID)
    // The classic mint has no ATA, so it must read as zero without shifting the Token-2022 balance onto it.
    const connection = createConnection(
      new Map<string, AccountInfo<Buffer> | null>([
        [token2022Ata.toBase58(), encodeTokenAccount(TOKEN_2022_MINT, OWNER, 1234n, TOKEN_2022_PROGRAM_ID)],
      ]),
    )

    const result = await fetchSolanaTokenBalances(connection, OWNER.toBase58(), [
      { mint: CLASSIC_MINT.toBase58(), isToken2022: false },
      { mint: TOKEN_2022_MINT.toBase58(), isToken2022: true },
    ])

    expect(result).toEqual([
      { mint: CLASSIC_MINT.toBase58(), balance: 0n },
      { mint: TOKEN_2022_MINT.toBase58(), balance: 1234n },
    ])
  })

  it('returns a zero balance when the ATA does not exist', async () => {
    const connection = createConnection(new Map<string, AccountInfo<Buffer> | null>())

    const result = await fetchSolanaTokenBalances(connection, OWNER.toBase58(), [
      { mint: CLASSIC_MINT.toBase58(), isToken2022: false },
    ])

    expect(result).toEqual([{ mint: CLASSIC_MINT.toBase58(), balance: 0n }])
  })
})
