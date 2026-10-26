/**
 * @jest-environment node
 */
import { getAssociatedTokenAddressSync, TOKEN_2022_PROGRAM_ID, TOKEN_PROGRAM_ID } from '@solana/spl-token'
import { Connection, Keypair, PublicKey } from '@solana/web3.js'

import { readSolanaTokenAccounts } from './readSolanaTokenAccounts'

jest.mock('@solana/spl-token', () => {
  const actual = jest.requireActual('@solana/spl-token')

  return { ...actual, getAssociatedTokenAddressSync: jest.fn(actual.getAssociatedTokenAddressSync) }
})

const deriveAtaMock = jest.mocked(getAssociatedTokenAddressSync)

function createConnection(): { connection: Connection; requestedAddresses: () => string[] } {
  const getMultipleAccountsInfo = jest.fn(async (pubkeys: PublicKey[]) => pubkeys.map(() => null))

  return {
    connection: { rpcEndpoint: 'mock', getMultipleAccountsInfo } as unknown as Connection,
    requestedAddresses: () => getMultipleAccountsInfo.mock.calls.flatMap(([pubkeys]) => pubkeys.map(String)),
  }
}

describe('readSolanaTokenAccounts — ATA derivation cache', () => {
  beforeEach(() => {
    deriveAtaMock.mockClear()
  })

  it('derives each ATA once across refetches and keeps requesting the same addresses', async () => {
    const owner = Keypair.generate().publicKey.toBase58()
    const tokens = [
      { mint: Keypair.generate().publicKey.toBase58(), isToken2022: false },
      { mint: Keypair.generate().publicKey.toBase58(), isToken2022: true },
    ]
    const { connection, requestedAddresses } = createConnection()

    await readSolanaTokenAccounts(connection, owner, tokens)
    await readSolanaTokenAccounts(connection, owner, tokens)

    expect(deriveAtaMock).toHaveBeenCalledTimes(2)

    const addresses = requestedAddresses()
    expect(addresses.slice(0, 2)).toEqual(addresses.slice(2))
  })

  it('derives separately per owner and per token program', async () => {
    const mint = Keypair.generate().publicKey.toBase58()
    const ownerA = Keypair.generate().publicKey.toBase58()
    const ownerB = Keypair.generate().publicKey.toBase58()
    const { connection, requestedAddresses } = createConnection()

    await readSolanaTokenAccounts(connection, ownerA, [{ mint, isToken2022: false }])
    await readSolanaTokenAccounts(connection, ownerA, [{ mint, isToken2022: true }])
    await readSolanaTokenAccounts(connection, ownerB, [{ mint, isToken2022: false }])

    expect(deriveAtaMock).toHaveBeenCalledTimes(3)
    expect(new Set(requestedAddresses()).size).toBe(3)
    expect(deriveAtaMock.mock.calls.map(([, , , programId]) => programId)).toEqual([
      TOKEN_PROGRAM_ID,
      TOKEN_2022_PROGRAM_ID,
      TOKEN_PROGRAM_ID,
    ])
  })

  it('keeps a malformed mint as null on every refetch while the rest of the list loads', async () => {
    const owner = Keypair.generate().publicKey.toBase58()
    const validMint = Keypair.generate().publicKey.toBase58()
    const tokens = [
      { mint: 'abc', isToken2022: false },
      { mint: validMint, isToken2022: false },
    ]
    const { connection, requestedAddresses } = createConnection()

    const first = await readSolanaTokenAccounts(connection, owner, tokens)
    const second = await readSolanaTokenAccounts(connection, owner, tokens)

    expect(first).toEqual([null, null])
    expect(second).toEqual([null, null])
    expect(requestedAddresses()).toHaveLength(2)
    expect(deriveAtaMock).toHaveBeenCalledTimes(1)
  })
})
