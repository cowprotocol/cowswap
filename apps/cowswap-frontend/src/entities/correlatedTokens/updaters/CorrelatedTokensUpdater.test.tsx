import { Provider as JotaiProvider } from 'jotai'
import { createStore } from 'jotai/vanilla'
import { ReactNode } from 'react'

import { SupportedChainId } from '@cowprotocol/cow-sdk'

import { act, render, waitFor } from '@testing-library/react'
import { Store } from 'jotai/vanilla/store'
import { SWRConfig } from 'swr'

import { CorrelatedTokensUpdater } from './CorrelatedTokensUpdater'

import { correlatedTokensAtom } from '../state/correlatedTokensAtom'

// Define GET inside the factory so it is guaranteed to be a jest.fn() when
// the component captures `cmsClient = getCmsClient()` at module load time.
jest.mock('@cowprotocol/core', () => ({
  getCmsClient: jest.fn().mockReturnValue({ GET: jest.fn() }),
}))

// Retrieve the stable mock reference after the factory has run.
const mockGet: jest.Mock = (jest.requireMock('@cowprotocol/core') as { getCmsClient: jest.Mock }).getCmsClient().GET

const UPDATE_TIME_KEY = 'correlatedTokensUpdateTime'

function getWrapper(): { store: Store; TestComponent: (props: { children: ReactNode }) => ReactNode } {
  const store = createStore()

  function TestComponent({ children }: { children: ReactNode }): ReactNode {
    return (
      // Reset SWR cache per test: https://swr.vercel.app/docs/advanced/cache#reset-cache-between-test-cases
      <SWRConfig value={{ provider: () => new Map() }}>
        <JotaiProvider store={store}>{children}</JotaiProvider>
      </SWRConfig>
    )
  }

  return { store, TestComponent }
}

describe('CorrelatedTokensUpdater', () => {
  beforeEach(() => {
    localStorage.clear()
    mockGet.mockReset()
  })

  afterEach(() => {
    jest.restoreAllMocks()
  })

  it('should not call CMS API when within the update interval', async () => {
    localStorage.setItem(UPDATE_TIME_KEY, Date.now().toString())
    // Spy AFTER setItem so we only capture calls that happen during the fetcher
    const getItemSpy = jest.spyOn(Storage.prototype, 'getItem')
    const { TestComponent } = getWrapper()

    act(() => {
      render(<CorrelatedTokensUpdater />, { wrapper: TestComponent })
    })

    // Wait until the fetcher has run (it calls getItem as its first action)
    await waitFor(() => getItemSpy.mock.calls.some(([key]) => key === UPDATE_TIME_KEY))

    expect(mockGet).not.toHaveBeenCalled()
  })

  it('should fetch from CMS and update the atom when no stored timestamp', async () => {
    const items = [
      {
        attributes: {
          network: { data: { attributes: { chainId: SupportedChainId.MAINNET } } },
          tokens: { '0xdac17f958d2ee523a2206206994597c13d831ec7': 'TOKEN1' },
        },
      },
    ]
    mockGet.mockResolvedValue({ data: { data: items }, error: null })

    const { store, TestComponent } = getWrapper()

    act(() => {
      render(<CorrelatedTokensUpdater />, { wrapper: TestComponent })
    })

    await waitFor(() => store.get(correlatedTokensAtom)![SupportedChainId.MAINNET]!.length > 0)

    expect(store.get(correlatedTokensAtom)[SupportedChainId.MAINNET]).toEqual([
      { '0xdac17f958d2ee523a2206206994597c13d831ec7': 'TOKEN1' },
    ])
    expect(localStorage.getItem(UPDATE_TIME_KEY)).not.toBeNull()
  })

  it('should lowercase all token addresses', async () => {
    const items = [
      {
        attributes: {
          network: { data: { attributes: { chainId: SupportedChainId.MAINNET } } },
          tokens: {
            '0x0a83d81169ca7a0ce285a8bf5a5648a0029fd7bb': 'TOKEN1',
            '0x97aBeAdA0DfBcC038be515Fff43d92fF758268b3': 'TOKEN2',
          },
        },
      },
    ]
    mockGet.mockResolvedValue({ data: { data: items }, error: null })

    const { store, TestComponent } = getWrapper()

    act(() => {
      render(<CorrelatedTokensUpdater />, { wrapper: TestComponent })
    })

    await waitFor(() => store.get(correlatedTokensAtom)![SupportedChainId.MAINNET]!.length > 0)

    expect(store.get(correlatedTokensAtom)![SupportedChainId.MAINNET]![0]).toEqual({
      '0x0a83d81169ca7a0ce285a8bf5a5648a0029fd7bb': 'TOKEN1',
      '0x97abeada0dfbcc038be515fff43d92ff758268b3': 'TOKEN2',
    })
  })

  it('should group multiple items by chainId', async () => {
    const items = [
      {
        attributes: {
          network: { data: { attributes: { chainId: SupportedChainId.MAINNET } } },
          tokens: { '0xaaa': 'TOKEN1' },
        },
      },
      {
        attributes: {
          network: { data: { attributes: { chainId: SupportedChainId.MAINNET } } },
          tokens: { '0xbbb': 'TOKEN2' },
        },
      },
    ]
    mockGet.mockResolvedValue({ data: { data: items }, error: null })

    const { store, TestComponent } = getWrapper()

    act(() => {
      render(<CorrelatedTokensUpdater />, { wrapper: TestComponent })
    })

    await waitFor(() => store.get(correlatedTokensAtom)![SupportedChainId.MAINNET]!.length === 2)

    const state = store.get(correlatedTokensAtom)[SupportedChainId.MAINNET]
    expect(state).toContainEqual({ '0xaaa': 'TOKEN1' })
    expect(state).toContainEqual({ '0xbbb': 'TOKEN2' })
  })

  it('should clear the stored timestamp and not update atom on API error', async () => {
    localStorage.setItem(UPDATE_TIME_KEY, '0') // expired timestamp forces a fetch
    mockGet.mockResolvedValue({ data: { data: [] }, error: { message: 'Not found' } })

    const { store, TestComponent } = getWrapper()

    act(() => {
      render(<CorrelatedTokensUpdater />, { wrapper: TestComponent })
    })

    await waitFor(() => localStorage.getItem(UPDATE_TIME_KEY) === null)

    expect(store.get(correlatedTokensAtom)[SupportedChainId.MAINNET]).toEqual([])
  })

  it('should clear the stored timestamp on fetch exception', async () => {
    localStorage.setItem(UPDATE_TIME_KEY, '0') // expired timestamp forces a fetch
    mockGet.mockRejectedValue(new Error('Network error'))

    const { TestComponent } = getWrapper()

    act(() => {
      render(<CorrelatedTokensUpdater />, { wrapper: TestComponent })
    })

    await waitFor(() => localStorage.getItem(UPDATE_TIME_KEY) === null)
  })

  it('should skip items missing chainId', async () => {
    const items = [
      {
        attributes: {
          network: { data: { attributes: {} } }, // no chainId
          tokens: { '0xabc': 'TOKEN1' },
        },
      },
    ]
    mockGet.mockResolvedValue({ data: { data: items }, error: null })

    const { store, TestComponent } = getWrapper()

    act(() => {
      render(<CorrelatedTokensUpdater />, { wrapper: TestComponent })
    })

    await waitFor(() => localStorage.getItem(UPDATE_TIME_KEY) !== null)

    expect(store.get(correlatedTokensAtom)[SupportedChainId.MAINNET]).toEqual([])
  })

  it('should skip items with unsupported chainId', async () => {
    const items = [
      {
        attributes: {
          network: { data: { attributes: { chainId: 99999 } } },
          tokens: { '0xabc': 'TOKEN1' },
        },
      },
    ]
    mockGet.mockResolvedValue({ data: { data: items }, error: null })

    const { store, TestComponent } = getWrapper()

    act(() => {
      render(<CorrelatedTokensUpdater />, { wrapper: TestComponent })
    })

    await waitFor(() => localStorage.getItem(UPDATE_TIME_KEY) !== null)

    expect(store.get(correlatedTokensAtom)[SupportedChainId.MAINNET]).toEqual([])
  })

  it('should skip items missing tokens', async () => {
    const items = [
      {
        attributes: {
          network: { data: { attributes: { chainId: SupportedChainId.MAINNET } } },
          // no tokens field
        },
      },
    ]
    mockGet.mockResolvedValue({ data: { data: items }, error: null })

    const { store, TestComponent } = getWrapper()

    act(() => {
      render(<CorrelatedTokensUpdater />, { wrapper: TestComponent })
    })

    await waitFor(() => localStorage.getItem(UPDATE_TIME_KEY) !== null)

    expect(store.get(correlatedTokensAtom)[SupportedChainId.MAINNET]).toEqual([])
  })
})
