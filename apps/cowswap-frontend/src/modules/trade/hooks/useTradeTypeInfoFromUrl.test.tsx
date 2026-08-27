import { PropsWithChildren, ReactNode } from 'react'

import { renderHook } from '@testing-library/react'
import { MemoryRouter } from 'react-router'

import { Routes } from 'common/constants/routes'

import { useTradeTypeInfoFromUrl } from './useTradeTypeInfoFromUrl'

import { TradeType } from '../types'

function createWrapper(initialEntry: string): (props: PropsWithChildren) => ReactNode {
  return function RouterWrapper({ children }: PropsWithChildren): ReactNode {
    return <MemoryRouter initialEntries={[initialEntry]}>{children}</MemoryRouter>
  }
}

describe('useTradeTypeInfoFromUrl', () => {
  it('classifies the RWA route as a swap trade', () => {
    const { result } = renderHook(() => useTradeTypeInfoFromUrl(), {
      wrapper: createWrapper('/1/rwa/USDC/AAPLON'),
    })

    expect(result.current).toEqual({ tradeType: TradeType.SWAP, route: Routes.RWA })
  })
})
