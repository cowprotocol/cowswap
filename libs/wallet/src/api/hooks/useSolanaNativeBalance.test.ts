import { PropsWithChildren, createElement } from 'react'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { renderHook, waitFor } from '@testing-library/react'

import { useSolanaNativeBalance } from './useSolanaNativeBalance'

// A valid base58 Solana address so `new PublicKey(account)` does not throw.
const ACCOUNT = 'So11111111111111111111111111111111111111112'

let mockConnection: MockConnection | undefined

jest.mock('@reown/appkit-adapter-solana/react', () => ({
  useAppKitConnection: () => ({ connection: mockConnection }),
}))

interface MockConnection {
  rpcEndpoint: string
  getBalance: jest.Mock<Promise<number>, [unknown]>
}

function createConnection(lamports = 1_500_000_000): MockConnection {
  return {
    rpcEndpoint: 'https://solana.example/rpc',
    getBalance: jest.fn().mockResolvedValue(lamports),
  }
}

function wrapper({ children }: PropsWithChildren): ReturnType<typeof createElement> {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  return createElement(QueryClientProvider, { client: queryClient }, children)
}

describe('useSolanaNativeBalance', () => {
  beforeEach(() => {
    mockConnection = createConnection()
  })

  it('fetches the lamport balance and exposes it as a bigint `value` when enabled', async () => {
    const { result } = renderHook(() => useSolanaNativeBalance({ account: ACCOUNT, enabled: true }), { wrapper })

    await waitFor(() => expect(result.current.data).toBeDefined())

    expect(mockConnection?.getBalance).toHaveBeenCalledTimes(1)
    expect(result.current.data).toEqual({ decimals: 9, symbol: 'SOL', value: 1_500_000_000n })
  })

  it('shapes the result like wagmi useBalance (includes queryKey)', async () => {
    const { result } = renderHook(() => useSolanaNativeBalance({ account: ACCOUNT, enabled: true }), { wrapper })

    await waitFor(() => expect(result.current.data).toBeDefined())

    expect(result.current.queryKey).toEqual(['solanaNativeBalance', ACCOUNT, mockConnection?.rpcEndpoint])
  })

  it('does not fetch when disabled', () => {
    renderHook(() => useSolanaNativeBalance({ account: ACCOUNT, enabled: false }), { wrapper })

    expect(mockConnection?.getBalance).not.toHaveBeenCalled()
  })

  it('does not fetch when there is no account', () => {
    renderHook(() => useSolanaNativeBalance({ account: undefined, enabled: true }), { wrapper })

    expect(mockConnection?.getBalance).not.toHaveBeenCalled()
  })

  it('does not fetch when there is no connection', () => {
    mockConnection = undefined

    expect(() =>
      renderHook(() => useSolanaNativeBalance({ account: ACCOUNT, enabled: true }), { wrapper }),
    ).not.toThrow()
  })
})
