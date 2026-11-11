import { ReactNode, useEffect, useRef } from 'react'

import { renderHook, waitFor } from '@testing-library/react'
import { HashRouter, useLocation } from 'react-router'

import { useNavigate } from 'common/hooks/useNavigate'

import { useForceTradeNavigateFromUrl } from './useForceTradeNavigateFromUrl'

const wrapper = ({ children }: { children: ReactNode }): ReactNode => <HashRouter>{children}</HashRouter>

function useForceTradeNavigateWithStaleNavigate(): boolean {
  const isForceTradeNavigate = useForceTradeNavigateFromUrl()
  const { search } = useLocation()
  const navigate = useNavigate()
  const navigatedRef = useRef(false)

  useEffect(() => {
    if (navigatedRef.current) return

    navigatedRef.current = true
    navigate({ pathname: '/1/swap/WETH/USDC', search }, { replace: true })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return isForceTradeNavigate
}

describe('useForceTradeNavigateFromUrl', () => {
  afterEach(() => {
    window.location.hash = ''
  })

  it('returns true and removes the flag from URL keeping other params', async () => {
    window.location.hash = '#/1/swap/WETH/COW?sellAmount=1&forceTradeNavigate=true'

    const { result } = renderHook(() => useForceTradeNavigateFromUrl(), { wrapper })

    await waitFor(() => expect(window.location.hash).toBe('#/1/swap/WETH/COW?sellAmount=1'))
    expect(result.current).toBe(false)
  })

  it('returns false and keeps URL when there is no flag', () => {
    window.location.hash = '#/1/swap/WETH/COW?sellAmount=1'

    const { result } = renderHook(() => useForceTradeNavigateFromUrl(), { wrapper })

    expect(result.current).toBe(false)
    expect(window.location.hash).toBe('#/1/swap/WETH/COW?sellAmount=1')
  })

  it('removes the flag again when a navigation with stale search brings it back', async () => {
    window.location.hash = '#/1/swap/WETH/COW?forceTradeNavigate=true'

    const { result } = renderHook(() => useForceTradeNavigateWithStaleNavigate(), { wrapper })

    await waitFor(() => expect(window.location.hash).toBe('#/1/swap/WETH/USDC'))
    expect(result.current).toBe(false)
  })
})
