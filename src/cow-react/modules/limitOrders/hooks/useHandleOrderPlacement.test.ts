import { renderHook } from '@testing-library/react-hooks'
import { PriceImpact } from 'hooks/usePriceImpact'
import { useHandleOrderPlacement } from './useHandleOrderPlacement'
import { tradeFlow } from '@cow/modules/limitOrders/services/tradeFlow'
import { safeBundleFlow } from '@cow/modules/limitOrders/services/safeBundleFlow'
import { TradeFlowContext } from '@cow/modules/limitOrders/services/types'
import { defaultLimitOrdersSettings } from '../state/limitOrdersSettingsAtom'
import { limitOrdersRawStateAtom, updateLimitOrdersRawStateAtom } from '../state/limitOrdersRawStateAtom'
import { useAtomValue, useUpdateAtom } from 'jotai/utils'
import { withModalProvider } from '@cow/utils/withModalProvider'
import { useSafeBundleFlowContext } from '@cow/modules/limitOrders/hooks/useSafeBundleFlowContext'
import { useNeedsApproval } from '@cow/common/hooks/useNeedsApproval'
import { useIsTxBundlingEnabled } from '@cow/common/hooks/useIsTxBundlingEnabled'

jest.mock('@cow/modules/limitOrders/services/tradeFlow')
jest.mock('@cow/modules/limitOrders/services/safeBundleFlow')

jest.mock('@cow/modules/limitOrders/hooks/useSafeBundleFlowContext')
jest.mock('@cow/common/hooks/useNeedsApproval')
jest.mock('@cow/common/hooks/useIsTxBundlingEnabled')

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
