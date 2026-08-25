import { useSetAtom } from 'jotai'

import { renderHook } from '@testing-library/react'
import { useLocation, useParams } from 'react-router'

import { useSetupTradeStateFromUrl } from './useSetupTradeStateFromUrl'

jest.mock('jotai', () => ({
  ...jest.requireActual('jotai'),
  useSetAtom: jest.fn(),
}))

jest.mock('react-router', () => ({
  useLocation: jest.fn(),
  useParams: jest.fn(),
}))

const mockSetState = jest.fn()
const mockUseSetAtom = useSetAtom as jest.MockedFunction<typeof useSetAtom>
const mockUseLocation = useLocation as jest.MockedFunction<typeof useLocation>
const mockUseParams = useParams as jest.MockedFunction<typeof useParams>

function setup(search: string): void {
  mockUseSetAtom.mockReturnValue(mockSetState)
  mockUseLocation.mockReturnValue({ search } as ReturnType<typeof useLocation>)
  mockUseParams.mockReturnValue({
    chainId: '1',
    inputCurrencyId: 'WETH',
    outputCurrencyId: '1INCH',
  } as ReturnType<typeof useParams>)
}

describe('useSetupTradeStateFromUrl', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('keeps recipient from the supported visible URL param', () => {
    setup('?recipient=0x000000000000000000000000000000000000dEaD')

    renderHook(() => useSetupTradeStateFromUrl())

    expect(mockSetState).toHaveBeenCalledWith({
      chainId: 1,
      inputCurrencyId: 'WETH',
      outputCurrencyId: '1INCH',
      recipient: '0x000000000000000000000000000000000000dEaD',
      targetChainId: null,
    })
  })

  it('ignores an empty recipient URL param', () => {
    setup('?recipient=')

    renderHook(() => useSetupTradeStateFromUrl())

    expect(mockSetState).toHaveBeenCalledWith({
      chainId: 1,
      inputCurrencyId: 'WETH',
      outputCurrencyId: '1INCH',
      targetChainId: null,
    })
  })

  it('ignores the hidden recipientAddress URL param', () => {
    setup('?recipientAddress=0x000000000000000000000000000000000000dEaD')

    renderHook(() => useSetupTradeStateFromUrl())

    expect(mockSetState).toHaveBeenCalledWith({
      chainId: 1,
      inputCurrencyId: 'WETH',
      outputCurrencyId: '1INCH',
      targetChainId: null,
    })
  })
})
