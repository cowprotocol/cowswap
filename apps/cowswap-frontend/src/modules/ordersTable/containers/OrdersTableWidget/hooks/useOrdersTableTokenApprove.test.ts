import { useEffect } from 'react'

import { renderHook } from '@testing-library/react-hooks'

import { WETH_GOERLI } from 'legacy/utils/goerli/constants'

import { useTradeApproveCallback } from 'common/containers/TradeApprove'

import { useOrdersTableTokenApprove } from './useOrdersTableTokenApprove'

jest.mock('common/containers/TradeApprove')

const mockUseTradeApproveCallback = useTradeApproveCallback as jest.MockedFunction<typeof useTradeApproveCallback>
const tradeApproveCallbackMock = jest.fn().mockImplementation(() => Promise.resolve(undefined))

describe('useOrdersTableTokenApprove()', () => {
  beforeEach(() => {
    // GIVEN
    mockUseTradeApproveCallback.mockReturnValue(tradeApproveCallbackMock as any)
  })

  it('When a token is set, then should trigger trade approve flow', () => {
    // WHEN
    renderHook(() => {
      const callback = useOrdersTableTokenApprove()

      useEffect(() => {
        callback(WETH_GOERLI)
        // eslint-disable-next-line react-hooks/exhaustive-deps
      }, [])
    })

    // THEN
    expect(tradeApproveCallbackMock).toBeCalledTimes(1)
  })
})
