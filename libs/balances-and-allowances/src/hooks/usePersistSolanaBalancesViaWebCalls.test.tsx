import { Provider, useAtomValue } from 'jotai'
import { useHydrateAtoms } from 'jotai/utils'
import React, { ReactNode } from 'react'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

import { TOKEN_2022_TAG } from '@cowprotocol/common-const'
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

const CLASSIC_PROGRAM = 'TOKEN_PROGRAM_ID'
const TOKEN_2022_PROGRAM = 'TOKEN_2022_PROGRAM_ID'

// The ATA key encodes the selected program, so a test can assert which token program a mint was read under.
function ataKey(mint: string, program: string = CLASSIC_PROGRAM): string {
  return `ata:${program}:${mint}`
}

let mockConnection: MockConnection | undefined
// getAddressKey(address) -> token metadata, mirroring the token list; its tags drive program selection.
let mockTokensByAddress: Record<string, { tags: string[] } | undefined>

jest.mock('@reown/appkit-adapter-solana/react', () => ({
  useAppKitConnection: () => ({ connection: mockConnection }),
}))

jest.mock('@cowprotocol/tokens', () => ({
  useTokensByAddressMapForChain: () => mockTokensByAddress,
}))

// The ATA-derivation math is not what we are testing; make it deterministic and echo the mint plus the
// selected program back so the mocked RPC/`unpackAccount` can look accounts up by their ATA key. We only
// assert what lands in the atom and which program each ATA was derived with.
jest.mock('@solana/spl-token', () => ({
  TOKEN_PROGRAM_ID: 'TOKEN_PROGRAM_ID',
  TOKEN_2022_PROGRAM_ID: 'TOKEN_2022_PROGRAM_ID',
  ASSOCIATED_TOKEN_PROGRAM_ID: 'ASSOCIATED_TOKEN_PROGRAM_ID',
  getAssociatedTokenAddressSync: (
    mint: { toBase58(): string },
    _owner: unknown,
    _allowOwnerOffCurve: boolean,
    programId: string,
  ) => ({ toBase58: () => `ata:${programId}:${mint.toBase58()}` }),
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
    mockTokensByAddress = {}
    mockAmountByAta = { [ataKey(MINT_A)]: 100n, [ataKey(MINT_B)]: 250n }
    mockInfoByAta = { [ataKey(MINT_A)]: { present: true }, [ataKey(MINT_B)]: { present: true } }
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
    delete mockInfoByAta[ataKey(MINT_B)]

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
      mockAmountByAta[ataKey(mint)] = 7n
      mockInfoByAta[ataKey(mint)] = { present: true }
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
    expect(atas[0].toBase58()).toBe(ataKey(MINT_A))
  })

  it('keys the update timestamp by the case-sensitive Solana account, not a lowercased alias', async () => {
    const { result } = renderHook(
      () => {
        usePersistSolanaBalancesViaWebCalls(makeParams())
        return useAtomValue(balancesUpdateAtom)
      },
      { wrapper },
    )

    await waitFor(() => expect(result.current[SupportedChainId.SOLANA]?.[getAddressKey(ACCOUNT)]).toBeDefined())

    // getAddressKey preserves case for Solana pubkeys; a lowercased key would alias distinct owners.
    expect(ACCOUNT).not.toBe(ACCOUNT.toLowerCase())
    expect(result.current[SupportedChainId.SOLANA]?.[ACCOUNT.toLowerCase()]).toBeUndefined()
  })

  it('derives a Token-2022 ATA for mints tagged as Token-2022 in the token list', async () => {
    mockTokensByAddress = { [getAddressKey(MINT_A)]: { tags: [TOKEN_2022_TAG] } }
    mockAmountByAta = { [ataKey(MINT_A, TOKEN_2022_PROGRAM)]: 999n }
    mockInfoByAta = { [ataKey(MINT_A, TOKEN_2022_PROGRAM)]: { present: true } }

    const { result } = renderWithBalances(makeParams({ tokenAddresses: [MINT_A] }))

    await waitFor(() => expect(result.current.hasFirstLoad).toBe(true))

    const [atas] = mockConnection!.getMultipleAccountsInfo.mock.calls[0]
    expect(atas[0].toBase58()).toBe(ataKey(MINT_A, TOKEN_2022_PROGRAM))
    expect(result.current.values[getAddressKey(MINT_A)]).toBe(999n)
  })
})
