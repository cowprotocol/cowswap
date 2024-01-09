import React from 'react'
import { createMemoryHistory, MemoryHistory } from 'history'
import { Router } from 'react-router-dom'
import { renderHook, act } from '@testing-library/react-hooks'

import { useSearchSubmit } from 'hooks/useSearchSubmit'

interface Props {
  children?: React.ReactNode
  history: MemoryHistory
}

function wrapperMemoryRouter(props: Props): JSX.Element {
  return (
    <>
      <Router history={props.history}>{props.children}</Router>
    </>
  )
}

describe('useSearchSubmit', () => {
  it('should be /search/... with invalid search', () => {
    const query = 'invalid_search'
    const history = createMemoryHistory()

    const { result } = renderHook(() => useSearchSubmit(), {
      wrapper: ({ children }) => wrapperMemoryRouter({ children, history }),
    })

    act(() => {
      result.current(query)
    })

    expect(history.location.pathname).toBe(`/search/${query}`)
  })

  it('should be /address/0x... when address string is valid', () => {
    const query = '0xb6BAd41ae76A11D10f7b0E664C5007b908bC77C9'
    const history = createMemoryHistory()

    const { result } = renderHook(() => useSearchSubmit(), {
      wrapper: ({ children }) => wrapperMemoryRouter({ children, history }),
    })

    act(() => {
      result.current(query)
    })

    expect(history.location.pathname).toBe(`/address/${query}`)
  })

  it('should be /orders/0x... when orders string is valid', () => {
    const query =
      '0xeaeb698c973f691c702fdd6aacd09ea97acb7275ae26adbfdd884abda1d6697db6bad41ae76a11d10f7b0e664c5007b908bc77c9618b4c31'
    const history = createMemoryHistory()

    const { result } = renderHook(() => useSearchSubmit(), {
      wrapper: ({ children }) => wrapperMemoryRouter({ children, history }),
    })

    act(() => {
      result.current(query)
    })

    expect(history.location.pathname).toBe(`/orders/${query}`)
  })
})
