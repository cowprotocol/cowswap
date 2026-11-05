import { renderHook } from '@testing-library/react'
import { useBridgeSupportedNetwork } from 'entities/bridgeProvider'

import { useEstimatedBridgeBuyAmount } from 'modules/trade'
import { useTradeQuote } from 'modules/tradeQuote'
import { useUsdAmount } from 'modules/usdAmount'

import { useBridgeQuoteAmounts } from './useBridgeQuoteAmounts'
import { useBridgeQuoteRecipient } from './useBridgeQuoteRecipient'
import { useQuoteBridgeContext } from './useQuoteBridgeContext'

jest.mock('entities/bridgeProvider', () => ({ useBridgeSupportedNetwork: jest.fn() }))
jest.mock('modules/trade', () => ({ useEstimatedBridgeBuyAmount: jest.fn() }))
jest.mock('modules/tradeQuote', () => ({ useTradeQuote: jest.fn() }))
jest.mock('modules/usdAmount', () => ({ useUsdAmount: jest.fn() }))
jest.mock('./useBridgeQuoteAmounts', () => ({ useBridgeQuoteAmounts: jest.fn() }))
jest.mock('./useBridgeQuoteRecipient', () => ({ useBridgeQuoteRecipient: jest.fn() }))

const mockedUseBridgeSupportedNetwork = useBridgeSupportedNetwork as jest.MockedFunction<
  typeof useBridgeSupportedNetwork
>
const mockedUseEstimatedBridgeBuyAmount = useEstimatedBridgeBuyAmount as jest.MockedFunction<
  typeof useEstimatedBridgeBuyAmount
>
const mockedUseTradeQuote = useTradeQuote as jest.MockedFunction<typeof useTradeQuote>
const mockedUseUsdAmount = useUsdAmount as jest.MockedFunction<typeof useUsdAmount>
const mockedUseBridgeQuoteAmounts = useBridgeQuoteAmounts as jest.MockedFunction<typeof useBridgeQuoteAmounts>
const mockedUseBridgeQuoteRecipient = useBridgeQuoteRecipient as jest.MockedFunction<typeof useBridgeQuoteRecipient>

// `swapMinReceiveAmount` is the source-chain amount deposited into the bridge; `bridgeMinReceiveAmount`
// is the destination-chain amount. They are different currencies, so their USD values are not interchangeable.
const swapMinReceiveAmount = { currency: { chainId: 1 }, tag: 'swapMinReceiveAmount' }
const bridgeMinReceiveAmount = { currency: { chainId: 8453 }, tag: 'bridgeMinReceiveAmount' }
const expectedToReceiveAmount = { tag: 'expectedToReceiveAmount' }
const buyAmount = { currency: { chainId: 8453 }, subtract: () => expectedToReceiveAmount, tag: 'buyAmount' }
const bridgeFee = { tag: 'bridgeFee' }
const swapExpectedReceive = { tag: 'swapExpectedReceive' }

const quoteAmounts = {
  bridgeFee,
  swapExpectedReceive,
  swapMinReceiveAmount,
  bridgeMinReceiveAmount,
}

type UsdAmountResult = ReturnType<typeof useUsdAmount>

describe('useQuoteBridgeContext', () => {
  beforeEach(() => {
    jest.clearAllMocks()

    mockedUseBridgeQuoteAmounts.mockReturnValue(quoteAmounts as unknown as ReturnType<typeof useBridgeQuoteAmounts>)
    mockedUseEstimatedBridgeBuyAmount.mockReturnValue({
      expectedToReceiveAmount: buyAmount,
    } as unknown as ReturnType<typeof useEstimatedBridgeBuyAmount>)
    mockedUseTradeQuote.mockReturnValue({
      bridgeQuote: { expectedFillTimeSeconds: 60 },
    } as unknown as ReturnType<typeof useTradeQuote>)
    mockedUseBridgeSupportedNetwork.mockReturnValue({ label: 'Base' } as unknown as ReturnType<
      typeof useBridgeSupportedNetwork
    >)
    mockedUseBridgeQuoteRecipient.mockReturnValue('0x1234567890123456789012345678901234567890')
    // Echo the passed amount back as its USD value so the test can tell which amount each field was derived from.
    mockedUseUsdAmount.mockImplementation((amount) => ({ value: amount ?? null }) as unknown as UsdAmountResult)
  })

  it('derives bridgeMinDepositAmountUsd from the deposit amount, not the bridge receive amount', () => {
    const { result } = renderHook(() => useQuoteBridgeContext())

    // The deposit amount shown to the user is swapMinReceiveAmount, so its USD must come from the same amount.
    expect(result.current?.bridgeMinDepositAmount).toBe(swapMinReceiveAmount)
    expect(result.current?.bridgeMinDepositAmountUsd).toBe(swapMinReceiveAmount)
    // Regression: it must not reuse the destination-chain bridgeMinReceiveAmount for the deposit USD.
    expect(result.current?.bridgeMinDepositAmountUsd).not.toBe(bridgeMinReceiveAmount)
  })

  it('still derives bridgeMinReceiveAmountUsd from the bridge receive amount', () => {
    const { result } = renderHook(() => useQuoteBridgeContext())

    expect(result.current?.bridgeMinReceiveAmount).toBe(bridgeMinReceiveAmount)
    expect(result.current?.bridgeMinReceiveAmountUsd).toBe(bridgeMinReceiveAmount)
  })
})
