import { PropsWithChildren } from 'react'

import { CurrencyAmount, Token } from '@cowprotocol/currency'

import { act, renderHook } from '@testing-library/react'

import { PriceImpact } from 'legacy/hooks/usePriceImpact'

import { useTradeFlowContext } from 'modules/limitOrders/hooks/useTradeFlowContext'
import { TradeFlowContext } from 'modules/limitOrders/services/types'

import { useConfirmPriceImpactWithoutFee } from 'common/hooks/useConfirmPriceImpactWithoutFee'
import { WithModalProvider } from 'utils/withModalProvider'

import { useTradeFlowParams } from './useTradeFlowParams'

import { WithMockedWeb3 } from '../../../test-utils'
import { TradeConfirmActions } from '../../trade'
import { defaultLimitOrdersSettings } from '../state/limitOrdersSettingsAtom'

jest.mock('modules/limitOrders/hooks/useTradeFlowContext')
// Real `useConfirmPriceImpactWithoutFee` needs a modal-request context and only exposes the confirm
// state, not what it was called with — mocked here so `isBridge` (derived from the trade context's own
// input/output currencies) can be asserted directly.
jest.mock('common/hooks/useConfirmPriceImpactWithoutFee')

const mockUseTradeFlowContext = useTradeFlowContext as jest.MockedFunction<typeof useTradeFlowContext>
const mockUseConfirmPriceImpactWithoutFee = useConfirmPriceImpactWithoutFee as jest.MockedFunction<
  typeof useConfirmPriceImpactWithoutFee
>

const priceImpactMock: PriceImpact = { priceImpact: undefined, loading: false }

const sellToken = new Token(1, '0x1111111111111111111111111111111111111111', 18, 'SELL', 'Sell Token')
const buyToken = new Token(1, '0x2222222222222222222222222222222222222222', 18, 'BUY', 'Buy Token')
const inputAmount = CurrencyAmount.fromRawAmount(sellToken, '1000000000000000000')
const outputAmount = CurrencyAmount.fromRawAmount(buyToken, '2000000000000000000')

function buildTradeConfirmActions(): TradeConfirmActions {
  return {
    onSign: jest.fn(),
    onError: jest.fn(),
    onSuccess: jest.fn(),
    onDismiss: jest.fn(),
    onOpen: jest.fn(),
    setConfirming: jest.fn(),
    requestPermitSignature: jest.fn(),
  }
}

function buildTradeContext(overrides: Partial<TradeFlowContext['postOrderParams']> = {}): TradeFlowContext {
  return {
    postOrderParams: {
      inputAmount,
      outputAmount,
      ...overrides,
    },
    getCachedPermit: jest.fn().mockResolvedValue(undefined),
  } as unknown as TradeFlowContext
}

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
const wrapper = ({ children }: PropsWithChildren) => {
  return (
    <WithMockedWeb3>
      <WithModalProvider>{children}</WithModalProvider>
    </WithMockedWeb3>
  )
}

describe('useTradeFlowParams', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockUseConfirmPriceImpactWithoutFee.mockReturnValue({
      confirmPriceImpactWithoutFee: jest.fn().mockResolvedValue(true),
      isConfirmed: false,
    })
  })

  it('passes priceImpact and settingsState through unchanged', () => {
    mockUseTradeFlowContext.mockReturnValue(buildTradeContext())

    const { result } = renderHook(
      () => useTradeFlowParams(priceImpactMock, defaultLimitOrdersSettings, buildTradeConfirmActions()),
      { wrapper },
    )

    expect(result.current.priceImpact).toBe(priceImpactMock)
    expect(result.current.settingsState).toBe(defaultLimitOrdersSettings)
  })

  it('exposes config and analytics from the composed hooks', () => {
    mockUseTradeFlowContext.mockReturnValue(buildTradeContext())

    const { result } = renderHook(
      () => useTradeFlowParams(priceImpactMock, defaultLimitOrdersSettings, buildTradeConfirmActions()),
      { wrapper },
    )

    expect(result.current.config).toBeDefined()
    expect(typeof result.current.analytics.trade).toBe('function')
    expect(result.current.confirmPriceImpactWithoutFee).toBe(
      mockUseConfirmPriceImpactWithoutFee.mock.results[0].value.confirmPriceImpactWithoutFee,
    )
  })

  describe('isBridge derivation', () => {
    it('is false when the input and output currencies share a chain', () => {
      mockUseTradeFlowContext.mockReturnValue(buildTradeContext())

      renderHook(() => useTradeFlowParams(priceImpactMock, defaultLimitOrdersSettings, buildTradeConfirmActions()), {
        wrapper,
      })

      expect(mockUseConfirmPriceImpactWithoutFee).toHaveBeenCalledWith(false)
    })

    it('is true when the input and output currencies are on different chains', () => {
      const bridgeBuyToken = new Token(137, '0x3333333333333333333333333333333333333333', 18, 'BUY2', 'Buy Token 2')
      mockUseTradeFlowContext.mockReturnValue(
        buildTradeContext({ outputAmount: CurrencyAmount.fromRawAmount(bridgeBuyToken, '1') }),
      )

      renderHook(() => useTradeFlowParams(priceImpactMock, defaultLimitOrdersSettings, buildTradeConfirmActions()), {
        wrapper,
      })

      expect(mockUseConfirmPriceImpactWithoutFee).toHaveBeenCalledWith(true)
    })

    it('is false when there is no trade context yet', () => {
      mockUseTradeFlowContext.mockReturnValue(null)

      renderHook(() => useTradeFlowParams(priceImpactMock, defaultLimitOrdersSettings, buildTradeConfirmActions()), {
        wrapper,
      })

      expect(mockUseConfirmPriceImpactWithoutFee).toHaveBeenCalledWith(false)
    })
  })

  describe('beforeTrade', () => {
    it('does nothing when there is no trade context', () => {
      mockUseTradeFlowContext.mockReturnValue(null)
      const tradeConfirmActions = buildTradeConfirmActions()

      const { result } = renderHook(
        () => useTradeFlowParams(priceImpactMock, defaultLimitOrdersSettings, tradeConfirmActions),
        { wrapper },
      )

      result.current.beforeTrade()

      expect(tradeConfirmActions.onSign).not.toHaveBeenCalled()
    })

    it("signs with the trade context's input/output amounts", () => {
      const tradeContext = buildTradeContext()
      mockUseTradeFlowContext.mockReturnValue(tradeContext)
      const tradeConfirmActions = buildTradeConfirmActions()

      const { result } = renderHook(
        () => useTradeFlowParams(priceImpactMock, defaultLimitOrdersSettings, tradeConfirmActions),
        { wrapper },
      )

      result.current.beforeTrade()

      expect(tradeConfirmActions.onSign).toHaveBeenCalledWith({ inputAmount, outputAmount })
    })
  })

  describe('beforePermit', () => {
    it('does nothing when there is no trade context', async () => {
      mockUseTradeFlowContext.mockReturnValue(null)
      const tradeConfirmActions = buildTradeConfirmActions()

      const { result } = renderHook(
        () => useTradeFlowParams(priceImpactMock, defaultLimitOrdersSettings, tradeConfirmActions),
        { wrapper },
      )

      await act(async () => {
        await result.current.beforePermit()
      })

      expect(tradeConfirmActions.requestPermitSignature).not.toHaveBeenCalled()
    })

    it('looks up the cached permit by the sell token address', async () => {
      const getCachedPermit = jest.fn().mockResolvedValue(undefined)
      const tradeContext = { ...buildTradeContext(), getCachedPermit }
      mockUseTradeFlowContext.mockReturnValue(tradeContext)

      const { result } = renderHook(
        () => useTradeFlowParams(priceImpactMock, defaultLimitOrdersSettings, buildTradeConfirmActions()),
        { wrapper },
      )

      await act(async () => {
        await result.current.beforePermit()
      })

      expect(getCachedPermit).toHaveBeenCalledWith(sellToken.address)
    })

    it('does not request a permit signature when a cached permit already exists', async () => {
      const getCachedPermit = jest.fn().mockResolvedValue({ signature: '0xcached' })
      const tradeContext = { ...buildTradeContext(), getCachedPermit }
      mockUseTradeFlowContext.mockReturnValue(tradeContext)
      const tradeConfirmActions = buildTradeConfirmActions()

      const { result } = renderHook(
        () => useTradeFlowParams(priceImpactMock, defaultLimitOrdersSettings, tradeConfirmActions),
        { wrapper },
      )

      await act(async () => {
        await result.current.beforePermit()
      })

      expect(tradeConfirmActions.requestPermitSignature).not.toHaveBeenCalled()
    })

    it('requests a permit signature with the trade amounts when no cached permit exists', async () => {
      const tradeContext = buildTradeContext()
      mockUseTradeFlowContext.mockReturnValue(tradeContext)
      const tradeConfirmActions = buildTradeConfirmActions()

      const { result } = renderHook(
        () => useTradeFlowParams(priceImpactMock, defaultLimitOrdersSettings, tradeConfirmActions),
        { wrapper },
      )

      await act(async () => {
        await result.current.beforePermit()
      })

      expect(tradeConfirmActions.requestPermitSignature).toHaveBeenCalledWith({ inputAmount, outputAmount })
    })
  })

  it('returns a memoized object that only changes when its inputs change', () => {
    mockUseTradeFlowContext.mockReturnValue(buildTradeContext())
    const tradeConfirmActions = buildTradeConfirmActions()

    const { result, rerender } = renderHook(
      ({ settingsState }) => useTradeFlowParams(priceImpactMock, settingsState, tradeConfirmActions),
      { wrapper, initialProps: { settingsState: defaultLimitOrdersSettings } },
    )

    const firstResult = result.current
    rerender({ settingsState: defaultLimitOrdersSettings })
    expect(result.current).toBe(firstResult)

    rerender({ settingsState: { ...defaultLimitOrdersSettings, partialFillsEnabled: false } })
    expect(result.current).not.toBe(firstResult)
  })
})
