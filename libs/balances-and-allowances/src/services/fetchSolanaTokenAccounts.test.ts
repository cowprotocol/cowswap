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

import { fetchSolanaTokenAccounts } from './fetchSolanaTokenAccounts'

const OWNER = Keypair.generate().publicKey
const CLASSIC_MINT = Keypair.generate().publicKey
const TOKEN_2022_MINT = Keypair.generate().publicKey
const AUTHORITY = Keypair.generate().publicKey
const OTHER_DELEGATE = Keypair.generate().publicKey

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
 * mocking it would hide an incorrect program being passed to it.
 */
function encodeTokenAccount(
  mint: PublicKey,
  amount: bigint,
  programId: PublicKey,
  delegate: PublicKey | null = null,
  delegatedAmount = 0n,
): AccountInfo<Buffer> {
  const data = Buffer.alloc(ACCOUNT_SIZE)
  AccountLayout.encode(
    {
      mint,
      owner: OWNER,
      amount,
      delegateOption: delegate ? 1 : 0,
      delegate: delegate ?? PublicKey.default,
      state: AccountState.Initialized,
      isNativeOption: 0,
      isNative: 0n,
      delegatedAmount: delegate ? delegatedAmount : 0n,
      closeAuthorityOption: 0,
      closeAuthority: PublicKey.default,
    },
    data,
  )

  return { data, owner: programId, lamports: 1, executable: false, rentEpoch: 0 }
}

describe('fetchSolanaTokenAccounts — balances', () => {
  it('reads classic and Token-2022 balances in the same request, aligned to input order', async () => {
    const classicAta = ataFor(CLASSIC_MINT, TOKEN_PROGRAM_ID)
    const token2022Ata = ataFor(TOKEN_2022_MINT, TOKEN_2022_PROGRAM_ID)
    const connection = createConnection(
      new Map<string, AccountInfo<Buffer> | null>([
        [classicAta.toBase58(), encodeTokenAccount(CLASSIC_MINT, 500n, TOKEN_PROGRAM_ID)],
        [token2022Ata.toBase58(), encodeTokenAccount(TOKEN_2022_MINT, 1234n, TOKEN_2022_PROGRAM_ID)],
      ]),
    )

    const result = await fetchSolanaTokenAccounts(
      connection,
      OWNER.toBase58(),
      [
        { mint: CLASSIC_MINT.toBase58(), isToken2022: false },
        { mint: TOKEN_2022_MINT.toBase58(), isToken2022: true },
      ],
      AUTHORITY,
    )

    expect(result).toEqual([
      { mint: CLASSIC_MINT.toBase58(), balance: 500n, delegatedAmount: undefined },
      { mint: TOKEN_2022_MINT.toBase58(), balance: 1234n, delegatedAmount: undefined },
    ])
  })

  it('returns a zero balance when the ATA does not exist', async () => {
    const connection = createConnection(new Map<string, AccountInfo<Buffer> | null>())

    const result = await fetchSolanaTokenAccounts(
      connection,
      OWNER.toBase58(),
      [{ mint: CLASSIC_MINT.toBase58(), isToken2022: false }],
      AUTHORITY,
    )

    expect(result).toEqual([{ mint: CLASSIC_MINT.toBase58(), balance: 0n, delegatedAmount: undefined }])
  })

  it('isolates a malformed mint so valid entries still load', async () => {
    // Passes the base58 length/charset check but decodes to 33 bytes, so `new PublicKey` throws.
    const BAD_MINT = 'z'.repeat(44)
    const classicAta = ataFor(CLASSIC_MINT, TOKEN_PROGRAM_ID)
    const connection = createConnection(
      new Map<string, AccountInfo<Buffer> | null>([
        [classicAta.toBase58(), encodeTokenAccount(CLASSIC_MINT, 500n, TOKEN_PROGRAM_ID)],
      ]),
    )

    const result = await fetchSolanaTokenAccounts(
      connection,
      OWNER.toBase58(),
      [
        { mint: BAD_MINT, isToken2022: false },
        { mint: CLASSIC_MINT.toBase58(), isToken2022: false },
      ],
      AUTHORITY,
    )

    expect(result).toEqual([
      { mint: BAD_MINT, balance: 0n, delegatedAmount: undefined },
      { mint: CLASSIC_MINT.toBase58(), balance: 500n, delegatedAmount: undefined },
    ])
  })
})

describe('fetchSolanaTokenAccounts — delegation', () => {
  const TOKENS = [{ mint: CLASSIC_MINT.toBase58(), isToken2022: false }]

  function connectionWith(delegate: PublicKey | null, delegatedAmount: bigint): Connection {
    const ata = ataFor(CLASSIC_MINT, TOKEN_PROGRAM_ID)
    return createConnection(
      new Map<string, AccountInfo<Buffer> | null>([
        [ata.toBase58(), encodeTokenAccount(CLASSIC_MINT, 1000n, TOKEN_PROGRAM_ID, delegate, delegatedAmount)],
      ]),
    )
  }

  it('reports delegatedAmount when the delegate is the settlement authority', async () => {
    const result = await fetchSolanaTokenAccounts(connectionWith(AUTHORITY, 777n), OWNER.toBase58(), TOKENS, AUTHORITY)

    expect(result).toEqual([{ mint: CLASSIC_MINT.toBase58(), balance: 1000n, delegatedAmount: 777n }])
  })

  it('reports no delegation when the delegate is someone else', async () => {
    const result = await fetchSolanaTokenAccounts(
      connectionWith(OTHER_DELEGATE, 777n),
      OWNER.toBase58(),
      TOKENS,
      AUTHORITY,
    )

    expect(result[0].delegatedAmount).toBeUndefined()
  })

  it('reports no delegation when there is no delegate', async () => {
    const result = await fetchSolanaTokenAccounts(connectionWith(null, 0n), OWNER.toBase58(), TOKENS, AUTHORITY)

    expect(result[0].delegatedAmount).toBeUndefined()
  })
})
