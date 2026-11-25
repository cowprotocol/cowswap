import { renderHook } from '@testing-library/react'

import { useIsSolanaAvailable } from './useIsSolanaAvailable'

describe('useIsSolanaAvailable', () => {
  afterEach(() => {
    window.location.hash = ''
  })

  it('is true outside the widget', () => {
    expect(renderHook(() => useIsSolanaAvailable()).result.current).toBe(true)
  })

  it('is false inside the widget', () => {
    window.location.hash = '#/1/widget/swap'

    expect(renderHook(() => useIsSolanaAvailable()).result.current).toBe(false)
  })
})
