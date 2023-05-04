import { renderHook } from '@testing-library/react-hooks'
import { PriceImpact } from 'hooks/usePriceImpact'
import { useHandleOrderPlacement } from './useHandleOrderPlacement'
import { tradeFlow, TradeFlowContext } from '@cow/modules/limitOrders/services/tradeFlow'
import { defaultLimitOrdersSettings } from '../state/limitOrdersSettingsAtom'
import { limitOrdersRawStateAtom, updateLimitOrdersRawStateAtom } from '../state/limitOrdersRawStateAtom'
import { useAtomValue, useUpdateAtom } from 'jotai/utils'
import { withModalProvider } from '@cow/utils/withModalProvider'

jest.mock('@cow/modules/limitOrders/services/tradeFlow')

const mockTradeFlow = tradeFlow as jest.MockedFunction<typeof tradeFlow>

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
