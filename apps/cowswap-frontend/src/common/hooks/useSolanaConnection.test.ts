import { useAppKitConnection } from '@reown/appkit-adapter-solana/react'
import { Connection } from '@solana/web3.js'
import { renderHook } from '@testing-library/react'

import { useSolanaConnection } from './useSolanaConnection'

jest.mock('@reown/appkit-adapter-solana/react', () => ({ useAppKitConnection: jest.fn() }))

const mockUseAppKitConnection = useAppKitConnection as jest.MockedFunction<typeof useAppKitConnection>

describe('useSolanaConnection', () => {
  it('falls back to a direct connection while AppKit has none to share', () => {
    mockUseAppKitConnection.mockReturnValue({ connection: undefined } as ReturnType<typeof useAppKitConnection>)

    const { result } = renderHook(() => useSolanaConnection())

    expect(result.current).toBeInstanceOf(Connection)
  })

  it('reuses the same fallback instead of opening one per render', () => {
    mockUseAppKitConnection.mockReturnValue({ connection: undefined } as ReturnType<typeof useAppKitConnection>)

    const first = renderHook(() => useSolanaConnection()).result.current
    const second = renderHook(() => useSolanaConnection()).result.current

    expect(first).toBe(second)
  })

  it("prefers AppKit's connection once it exists", () => {
    const appKitConnection = new Connection('https://example.invalid')
    mockUseAppKitConnection.mockReturnValue({ connection: appKitConnection } as ReturnType<typeof useAppKitConnection>)

    const { result } = renderHook(() => useSolanaConnection())

    expect(result.current).toBe(appKitConnection)
  })
})
