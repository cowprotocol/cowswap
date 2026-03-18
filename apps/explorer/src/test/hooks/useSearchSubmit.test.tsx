import { CHAIN_INFO } from '@cowprotocol/common-const'
import { SupportedChainId } from '@cowprotocol/cow-sdk'

import { act, renderHook } from '@testing-library/react'
import { useSearchSubmit } from 'hooks/useSearchSubmit'
import { MemoryRouter, useLocation } from 'react-router'

import { GlobalStateContext } from '../../hooks/useGlobalState'
import { Theme } from '../../theme/types'

interface Props {
  children?: React.ReactNode
  location?: string
  networkId?: number | null
}

type SearchSubmitHookState = {
  location: ReturnType<typeof useLocation>
  submit: ReturnType<typeof useSearchSubmit>
}

type TestState = {
  theme: Theme
  networkId: number | null
}

function createState(networkId: number | null): TestState {
  return {
    theme: Theme.DARK,
    networkId,
  }
}

function runHook(query: string, options?: { location?: string; networkId?: number | null }): SearchSubmitHookState {
  const { result } = renderHook(
    (): SearchSubmitHookState => {
      const location = useLocation()
      const submit = useSearchSubmit()

      return { location, submit }
    },
    {
      wrapper: ({ children }) =>
        wrapperMemoryRouter({
          children,
          location: options?.location,
          networkId: options?.networkId,
        }),
    },
  )

  act(() => {
    result.current.submit(query)
  })

  return result.current
}

function wrapperMemoryRouter(props: Props): React.ReactNode {
  const state = createState(props.networkId ?? null)

  return (
    <MemoryRouter initialEntries={props.location ? [props.location] : undefined}>
      <GlobalStateContext.Provider value={[state, (): void => undefined]}>{props.children}</GlobalStateContext.Provider>
    </MemoryRouter>
  )
}

describe('useSearchSubmit', () => {
  it('should be /search/... with invalid search', () => {
    const query = 'invalid_search'

    const result = runHook(query)

    expect(result.location.pathname).toBe(`/search/${query}`)
  })

  it('should be /address/0x... when address string is valid', () => {
    const query = '0xb6BAd41ae76A11D10f7b0E664C5007b908bC77C9'

    const result = runHook(query)

    expect(result.location.pathname).toBe(`/address/${query}`)
  })

  it('should be /orders/0x... when orders string is valid', () => {
    const query =
      '0xeaeb698c973f691c702fdd6aacd09ea97acb7275ae26adbfdd884abda1d6697db6bad41ae76a11d10f7b0e664c5007b908bc77c9618b4c31'

    const result = runHook(query)

    expect(result.location.pathname).toBe(`/orders/${query}`)
  })

  it('should keep selected chain prefix on canonical /solvers', () => {
    const query = 'invalid_search'

    const result = runHook(query, {
      location: '/solvers',
      networkId: SupportedChainId.ARBITRUM_ONE,
    })

    expect(result.location.pathname).toBe(`/${CHAIN_INFO[SupportedChainId.ARBITRUM_ONE].urlAlias}/search/${query}`)
  })
})
