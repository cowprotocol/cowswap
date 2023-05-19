import { renderHook } from '@testing-library/react-hooks'
import { PriceImpact } from '@src/legacy/hooks/usePriceImpact'
import { useHandleOrderPlacement } from './useHandleOrderPlacement'
import { tradeFlow } from 'modules/limitOrders/services/tradeFlow'
import { safeBundleFlow } from 'modules/limitOrders/services/safeBundleFlow'
import { TradeFlowContext } from 'modules/limitOrders/services/types'
import { defaultLimitOrdersSettings } from '../state/limitOrdersSettingsAtom'
import { limitOrdersRawStateAtom, updateLimitOrdersRawStateAtom } from '../state/limitOrdersRawStateAtom'
import { useAtomValue, useUpdateAtom } from 'jotai/utils'
import { withModalProvider } from 'utils/withModalProvider'
import { useSafeBundleFlowContext } from 'modules/limitOrders/hooks/useSafeBundleFlowContext'
import { useNeedsApproval } from 'common/hooks/useNeedsApproval'
import { useIsTxBundlingEnabled } from 'common/hooks/useIsTxBundlingEnabled'

jest.mock('modules/limitOrders/services/tradeFlow')
jest.mock('modules/limitOrders/services/safeBundleFlow')

jest.mock('modules/limitOrders/hooks/useSafeBundleFlowContext')
jest.mock('common/hooks/useNeedsApproval')
jest.mock('common/hooks/useIsTxBundlingEnabled')

const mockTradeFlow = tradeFlow as jest.MockedFunction<typeof tradeFlow>
const mockSafeBundleFlow = safeBundleFlow as jest.MockedFunction<typeof safeBundleFlow>

const mockUseSafeBundleFlowContext = useSafeBundleFlowContext as jest.MockedFunction<typeof useSafeBundleFlowContext>
const mockUseNeedsApproval = useNeedsApproval as jest.MockedFunction<typeof useNeedsApproval>
const mockUseIsTxBundlingEnabled = useIsTxBundlingEnabled as jest.MockedFunction<typeof useIsTxBundlingEnabled>

const tradeContextMock = { postOrderParams: { partiallyFillable: true } } as any as TradeFlowContext
const priceImpactMock: PriceImpact = {
  priceImpact: undefined,
  error: undefined,
  loading: false,
}
const recipient = '0xd8da6bf26964af9d7eed9e03e53415d37aa96045'

describe('useHandleOrderPlacement', () => {
  beforeEach(() => {
    mockTradeFlow.mockImplementation(() => Promise.resolve(null))
    mockSafeBundleFlow.mockImplementation(() => Promise.resolve(null))
    mockUseSafeBundleFlowContext.mockImplementation(() => null)
    mockUseNeedsApproval.mockImplementation(() => false)
    mockUseIsTxBundlingEnabled.mockImplementation(() => false)
  })

  it('When a limit order placed, then the recipient value should be deleted', async () => {
    // Arrange
    renderHook(
      () => {
        const updateLimitOrdersState = useUpdateAtom(updateLimitOrdersRawStateAtom)

        updateLimitOrdersState({ recipient })
      },
      { wrapper: withModalProvider }
    )

    // Assert
    const { result: limitOrdersStateResultBefore } = renderHook(() => useAtomValue(limitOrdersRawStateAtom), {
      wrapper: withModalProvider,
    })
    expect(limitOrdersStateResultBefore.current.recipient).toBe(recipient)

    // Act
    const { result } = renderHook(
      () => useHandleOrderPlacement(tradeContextMock, priceImpactMock, defaultLimitOrdersSettings, {}),
      { wrapper: withModalProvider }
    )
    await result.current()

    // Assert
    const { result: limitOrdersStateResultAfter } = renderHook(() => useAtomValue(limitOrdersRawStateAtom), {
      wrapper: withModalProvider,
    })
    expect(limitOrdersStateResultAfter.current.recipient).toBe(null)
  })
})
