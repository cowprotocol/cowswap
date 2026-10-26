import { ReactNode } from 'react'

import { renderHook } from '@testing-library/react'
import { MemoryRouter } from 'react-router'

import { Routes } from 'common/constants/routes'

import { useTradeTypeInfoFromUrl } from './useTradeTypeInfoFromUrl'

import { TradeType } from '../consts'

function renderAt(path: string): ReturnType<typeof useTradeTypeInfoFromUrl> {
  const wrapper = ({ children }: { children: ReactNode }): ReactNode => (
    <MemoryRouter initialEntries={[path]}>{children}</MemoryRouter>
  )

  return renderHook(() => useTradeTypeInfoFromUrl(), { wrapper }).result.current
}

describe('useTradeTypeInfoFromUrl', () => {
  it.each([
    ['/1/swap/WETH/COW', TradeType.SWAP, Routes.SWAP],
    ['/swap', TradeType.SWAP, Routes.SWAP],
    ['/1/swap/hooks/WETH/COW', TradeType.SWAP, Routes.HOOKS],
    ['/100/limit/WETH/COW', TradeType.LIMIT_ORDER, Routes.LIMIT_ORDERS],
    ['/1/advanced/WETH/COW', TradeType.ADVANCED_ORDERS, Routes.ADVANCED_ORDERS],
    ['/1/yield', TradeType.YIELD, Routes.YIELD],
    ['/1/limit/', TradeType.LIMIT_ORDER, Routes.LIMIT_ORDERS],
    ['/1/SWAP/WETH', TradeType.SWAP, Routes.SWAP],
    ['/swap/limit', TradeType.SWAP, Routes.SWAP],
    ['/swap/hooks', TradeType.SWAP, Routes.HOOKS],
  ])('resolves %s', (path, tradeType, route) => {
    expect(renderAt(path)).toEqual({ tradeType, route })
  })

  it('returns the same object for the same route across paths', () => {
    expect(renderAt('/1/swap/WETH')).toBe(renderAt('/100/swap/COW'))
  })

  it.each(['/1/account', '/1/swapper', '/', '/1/limit-orders', '/1/2/swap'])(
    'returns null for the non-trade path %s',
    (path) => {
      expect(renderAt(path)).toBeNull()
    },
  )
})
