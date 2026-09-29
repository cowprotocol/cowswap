import { useSolanaWalletProvider } from '@cowprotocol/wallet'

import { useAppKitConnection } from '@reown/appkit-adapter-solana/react'
import { Connection } from '@solana/web3.js'
import { renderHook } from '@testing-library/react'

import { useSolanaSigner } from './useSolanaSigner'

import type { Provider as SolanaProvider } from '@reown/appkit-adapter-solana/react'

jest.mock('@cowprotocol/wallet', () => ({ useSolanaWalletProvider: jest.fn() }))
jest.mock('@reown/appkit-adapter-solana/react', () => ({ useAppKitConnection: jest.fn() }))

const mockUseSolanaWalletProvider = useSolanaWalletProvider as jest.MockedFunction<typeof useSolanaWalletProvider>
const mockUseAppKitConnection = useAppKitConnection as jest.MockedFunction<typeof useAppKitConnection>

const SOLANA_ACCOUNT = '11111111111111111111111111111111'
const EVM_ACCOUNT = '0x1234567890123456789012345678901234567890'

const provider = {} as SolanaProvider
const connection = {} as Connection

function connect(): void {
  mockUseSolanaWalletProvider.mockReturnValue(provider)
  mockUseAppKitConnection.mockReturnValue({ connection } as ReturnType<typeof useAppKitConnection>)
}

describe('useSolanaSigner', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    connect()
  })

  it('resolves the signer once a Solana wallet is connected', () => {
    const { result } = renderHook(() => useSolanaSigner(SOLANA_ACCOUNT))

    expect(result.current?.provider).toBe(provider)
    expect(result.current?.connection).toBe(connection)
    expect(result.current?.owner.toBase58()).toBe(SOLANA_ACCOUNT)
  })

  it('returns null without a provider', () => {
    mockUseSolanaWalletProvider.mockReturnValue(undefined)

    const { result } = renderHook(() => useSolanaSigner(SOLANA_ACCOUNT))

    expect(result.current).toBeNull()
  })

  it('returns null without a connection', () => {
    mockUseAppKitConnection.mockReturnValue({ connection: undefined } as ReturnType<typeof useAppKitConnection>)

    const { result } = renderHook(() => useSolanaSigner(SOLANA_ACCOUNT))

    expect(result.current).toBeNull()
  })

  it.each([
    ['no account', undefined],
    ['an EVM account', EVM_ACCOUNT],
  ])('returns null with %s', (_label, account) => {
    const { result } = renderHook(() => useSolanaSigner(account))

    expect(result.current).toBeNull()
  })

  it('keeps a stable reference across renders so the SWR key does not churn', () => {
    const { result, rerender } = renderHook(() => useSolanaSigner(SOLANA_ACCOUNT))
    const first = result.current

    rerender()

    expect(result.current).toBe(first)
  })
})
