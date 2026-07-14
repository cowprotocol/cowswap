import { Provider, useAtomValue } from 'jotai'
import { useHydrateAtoms } from 'jotai/utils'
import React, { ReactNode } from 'react'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

import { getAddressKey, SupportedChainId, mapSupportedNetworks, solana } from '@cowprotocol/cow-sdk'
import { PersistentStateByChain } from '@cowprotocol/types'

import { PublicKey } from '@solana/web3.js'
import { renderHook, waitFor } from '@testing-library/react'

import { PersistBalancesAndAllowancesParams } from './usePersistBalancesViaWebCalls'
import { usePersistSolanaBalancesViaWebCalls } from './usePersistSolanaBalancesViaWebCalls'

import { balancesAtom, BalancesState, balancesUpdateAtom } from '../state/balancesAtom'

// Valid base58 addresses so `new PublicKey(...)` inside the hook does not throw.
const ACCOUNT = 'So11111111111111111111111111111111111111112'
const MINT_A = 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v'
const MINT_B = 'Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB'
const NATIVE_MINT = solana.nativeCurrency.address

let mockConnection: MockConnection | undefined

jest.mock('@reown/appkit-adapter-solana/react', () => ({
  useAppKitConnection: () => ({ connection: mockConnection }),
}))

// The ATA-derivation math is not what we are testing; make it deterministic and echo the mint back so
// the mocked RPC/`unpackAccount` can look accounts up by their ATA key. We only assert what lands in the atom.
jest.mock('@solana/spl-token', () => ({
  TOKEN_PROGRAM_ID: 'TOKEN_PROGRAM_ID',
  ASSOCIATED_TOKEN_PROGRAM_ID: 'ASSOCIATED_TOKEN_PROGRAM_ID',
  getAssociatedTokenAddressSync: (mint: { toBase58(): string }) => ({ toBase58: () => `ata:${mint.toBase58()}` }),
  unpackAccount: (ata: { toBase58(): string }) => ({ amount: mockAmountByAta[ata.toBase58()] }),
}))

interface MockConnection {
  rpcEndpoint: string
  getMultipleAccountsInfo: jest.Mock
}

// ATA base58 -> token amount, read by the mocked `unpackAccount`.
let mockAmountByAta: Record<string, bigint>
// ATA base58 -> account info; an absent entry means "no account exists" (a zero balance).
let mockInfoByAta: Record<string, { present: true } | undefined>

function createConnection(): MockConnection {
  return {
    rpcEndpoint: 'https://solana.example/rpc',
    getMultipleAccountsInfo: jest.fn((batch: Array<{ toBase58(): string }>) =>
      Promise.resolve(batch.map((ata) => mockInfoByAta[ata.toBase58()] ?? null)),
    ),
  }
}

const mockBalancesUpdate: PersistentStateByChain<Record<string, number | undefined>> = mapSupportedNetworks({})

function makeParams(overrides: Partial<PersistBalancesAndAllowancesParams> = {}): PersistBalancesAndAllowancesParams {
  return {
    account: ACCOUNT,
    chainId: SupportedChainId.SOLANA,
    tokenAddresses: [MINT_A, MINT_B],
    setLoadingState: true,
    ...overrides,
  }
}

function renderWithBalances(params: PersistBalancesAndAllowancesParams): { result: { current: BalancesState } } {
  return renderHook(
    () => {
      usePersistSolanaBalancesViaWebCalls(params)
      return useAtomValue(balancesAtom)
    },
    { wrapper },
  )
}

function wrapper({ children }: { children: ReactNode }): ReactNode {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } })

  const HydrateAtoms = ({ children }: { children: ReactNode }): ReactNode => {
    useHydrateAtoms([
      [
        balancesAtom,
        {
          isLoading: false,
          chainId: SupportedChainId.SOLANA,
          values: {},
          fromCache: false,
          hasFirstLoad: false,
          error: null,
        } as BalancesState,
      ],
      [balancesUpdateAtom, mockBalancesUpdate],
    ])
    return <>{children}</>
  }

  return (
    <QueryClientProvider client={queryClient}>
      <Provider>
        <HydrateAtoms>{children}</HydrateAtoms>
      </Provider>
    </QueryClientProvider>
  )
}

describe('usePersistSolanaBalancesViaWebCalls', () => {
  beforeEach(() => {
    mockAmountByAta = { [`ata:${MINT_A}`]: 100n, [`ata:${MINT_B}`]: 250n }
    mockInfoByAta = { [`ata:${MINT_A}`]: { present: true }, [`ata:${MINT_B}`]: { present: true } }
    mockConnection = createConnection()
  })

  it('reads SPL balances via a single batched RPC call and persists them to the atom', async () => {
    const { result } = renderWithBalances(makeParams())

    await waitFor(() => expect(result.current.hasFirstLoad).toBe(true))

    expect(mockConnection?.getMultipleAccountsInfo).toHaveBeenCalledTimes(1)
    expect(result.current.values[getAddressKey(MINT_A)]).toBe(100n)
    expect(result.current.values[getAddressKey(MINT_B)]).toBe(250n)
  })

  it('clears the loading state once balances are loaded', async () => {
    const { result } = renderWithBalances(makeParams())

    await waitFor(() => expect(result.current.hasFirstLoad).toBe(true))

    expect(result.current.isLoading).toBe(false)
  })

  it('treats a missing token account as a zero balance rather than an error', async () => {
    delete mockInfoByAta[`ata:${MINT_B}`]

    const { result } = renderWithBalances(makeParams())

    await waitFor(() => expect(result.current.hasFirstLoad).toBe(true))

    expect(result.current.values[getAddressKey(MINT_A)]).toBe(100n)
    expect(result.current.values[getAddressKey(MINT_B)]).toBe(0n)
    expect(result.current.error).toBeNull()
  })

  it('batches ATAs into chunks of 100 so large token lists do not exceed the RPC limit', async () => {
    // 250 mints -> ceil(250 / 100) = 3 `getMultipleAccountsInfo` calls, none over the 100-account limit.
    const mints = Array.from({ length: 250 }, (_, i) =>
      new PublicKey(Uint8Array.from({ length: 32 }, (_, j) => (i + j + 1) % 256)).toBase58(),
    )
    mints.forEach((mint) => {
      mockAmountByAta[`ata:${mint}`] = 7n
      mockInfoByAta[`ata:${mint}`] = { present: true }
    })

    const { result } = renderWithBalances(makeParams({ tokenAddresses: mints }))

    await waitFor(() => expect(result.current.hasFirstLoad).toBe(true))

    expect(mockConnection?.getMultipleAccountsInfo).toHaveBeenCalledTimes(3)
    mockConnection?.getMultipleAccountsInfo.mock.calls.forEach(([batch]) => {
      expect(batch.length).toBeLessThanOrEqual(100)
    })
    expect(Object.keys(result.current.values)).toHaveLength(250)
    expect(result.current.values[getAddressKey(mints[0])]).toBe(7n)
    expect(result.current.values[getAddressKey(mints[249])]).toBe(7n)
  })

  it('excludes the native SOL address from the SPL batch (it has no ATA)', async () => {
    renderWithBalances(makeParams({ tokenAddresses: [NATIVE_MINT, MINT_A] }))

    await waitFor(() => expect(mockConnection?.getMultipleAccountsInfo).toHaveBeenCalled())

    const [atas] = mockConnection!.getMultipleAccountsInfo.mock.calls[0]
    expect(atas).toHaveLength(1)
    expect(atas[0].toBase58()).toBe(`ata:${MINT_A}`)
  })
})
