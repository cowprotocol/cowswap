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
  ])('resolves %s', (path, tradeType, route) => {
    expect(renderAt(path)).toEqual({ tradeType, route })
  })

  it.each(['/1/account', '/1/swapper', '/'])('returns null for the non-trade path %s', (path) => {
    expect(renderAt(path)).toBeNull()
  })
})
