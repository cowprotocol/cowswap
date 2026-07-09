import { createStore, Provider } from 'jotai'
import { ReactNode } from 'react'

import { SupportedChainId } from '@cowprotocol/cow-sdk'

import { act, render, waitFor } from '@testing-library/react'

jest.mock('@cowprotocol/common-utils', () => {
  const { atom } = require('jotai')

  return {
    atomWithPartialUpdate(baseAtom) {
      const updateAtom = atom(null, (get, set, update) => {
        set(baseAtom, { ...get(baseAtom), ...update })
      })

      return { atom: baseAtom, updateAtom }
    },
  }
})

jest.mock('@cowprotocol/core', () => ({
  getJotaiMergerStorage: jest.fn(),
}))

jest.mock('./helpers', () => ({
  getFulfilledResults: jest.fn(),
  getIsTimeToUpdate: jest.fn(() => false),
  TOKENS_LISTS_UPDATER_INTERVAL: 21_600_000,
}))

jest.mock('../../services/fetchTokenList', () => ({
  fetchTokenList: jest.fn(),
}))

jest.mock('../../state/tokenLists/tokenListsActionsAtom', () => {
  const { atom } = require('jotai')

  return {
    upsertListsAtom: atom(null, jest.fn()),
  }
})

jest.mock('../../state/tokenLists/tokenListsStateAtom', () => {
  const { atom } = require('jotai')

  return {
    allListsSourcesAtom: atom([]),
    tokenListsUpdatingAtom: atom(false),
  }
})

jest.mock('../../state/environmentAtom', () => {
  const { atom } = require('jotai')
  const { SupportedChainId } = require('@cowprotocol/cow-sdk')

  const environmentAtom = atom({
    chainId: SupportedChainId.MAINNET,
  })
  const updateEnvironmentAtom = atom(null, (get, set, update) => {
    set(environmentAtom, { ...get(environmentAtom), ...update })
  })

  return {
    environmentAtom,
    updateEnvironmentAtom,
  }
})

import { environmentAtom } from '../../state/environmentAtom'

import { TokensListsUpdater } from '.'

const mockUseSWR = jest.fn(() => ({ data: null, isLoading: false }))

jest.mock('@sentry/browser', () => ({
  captureException: jest.fn(),
}))

jest.mock('swr', () => ({
  __esModule: true,
  default: (...args: unknown[]) => mockUseSWR(...args),
}))

jest.mock('../UserAddedTokensUpdater', () => ({
  UserAddedTokensUpdater: () => null,
}))

describe('TokensListsUpdater', () => {
  const originalFetch = global.fetch

  beforeEach(() => {
    jest.clearAllMocks()
    mockUseSWR.mockReturnValue({ data: null, isLoading: false })
  })

  afterEach(() => {
    global.fetch = originalFetch
  })

  it('ignores stale geo responses after geoblocking is disabled', async () => {
    const store = createStore()
    let resolveGeoRequest: ((value: { json: () => Promise<{ country: string }> }) => void) | undefined

    global.fetch = jest.fn(
      () =>
        new Promise((resolve) => {
          resolveGeoRequest = resolve
        }),
    ) as typeof fetch

    const wrapper = ({ children }: { children: ReactNode }): ReactNode => <Provider store={store}>{children}</Provider>

    const view = render(
      <TokensListsUpdater
        chainId={SupportedChainId.MAINNET}
        isGeoBlockEnabled={true}
        enableLpTokensByDefault={false}
        isYieldEnabled={false}
        bridgeNetworkInfo={undefined}
      />,
      { wrapper },
    )

    await waitFor(() => {
      expect(store.get(environmentAtom)).toMatchObject({
        chainId: SupportedChainId.MAINNET,
        useCuratedListOnly: true,
      })
    })

    view.rerender(
      <TokensListsUpdater
        chainId={SupportedChainId.MAINNET}
        isGeoBlockEnabled={false}
        enableLpTokensByDefault={false}
        isYieldEnabled={false}
        bridgeNetworkInfo={undefined}
      />,
    )

    await waitFor(() => {
      expect(store.get(environmentAtom).useCuratedListOnly).toBe(false)
    })

    await act(async () => {
      resolveGeoRequest?.({
        json: () => Promise.resolve({ country: 'US' }),
      })
      await Promise.resolve()
    })

    await waitFor(() => {
      expect(store.get(environmentAtom).useCuratedListOnly).toBe(false)
    })
  })
})
