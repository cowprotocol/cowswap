import { useEffect } from 'react'

import { WETH_SEPOLIA } from '@cowprotocol/common-const'

import { renderHook } from '@testing-library/react'

import { useApproveCurrency } from 'common/hooks/useApproveCurrency'

import { useOrdersTableTokenApprove } from './useOrdersTableTokenApprove'

jest.mock('common/hooks/useApproveCurrency')

const mockUseTradeApproveCallback = useApproveCurrency as jest.MockedFunction<typeof useApproveCurrency>
const tradeApproveCallbackMock = jest.fn().mockImplementation(() => Promise.resolve(undefined))

describe('useOrdersTableTokenApprove()', () => {
  beforeEach(() => {
    // GIVEN
    // TODO: Replace any with proper type definitions
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    mockUseTradeApproveCallback.mockReturnValue(tradeApproveCallbackMock as any)
  })

  it('When a token is set, then should trigger trade approve flow', () => {
    // WHEN
    renderHook(() => {
      const callback = useOrdersTableTokenApprove()

      useEffect(() => {
        callback(WETH_SEPOLIA)
        // eslint-disable-next-line react-hooks/exhaustive-deps
      }, [])
    })

    // THEN
    expect(tradeApproveCallbackMock).toBeCalledTimes(1)
  })
})
