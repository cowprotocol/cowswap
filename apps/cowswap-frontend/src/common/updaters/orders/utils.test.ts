import { EnrichedOrder, OrderClass, OrderKind, SupportedChainId } from '@cowprotocol/cow-sdk'
import {
  BuyTokenDestination,
  SellTokenSource,
  SigningScheme,
  OrderStatus as SdkOrderStatus,
} from '@cowprotocol/sdk-order-book'
import { UiOrderType } from '@cowprotocol/types'
import { CurrencyAmount, Token } from '@uniswap/sdk-core'

import { Order, OrderStatus } from 'legacy/state/orders/actions'

import { getUiOrderType } from 'utils/orderUtils/getUiOrderType'

import { computeOrderSummary } from './utils'

// Mock dependencies
jest.mock('utils/orderUtils/getUiOrderType', () => ({
  ...jest.requireActual('utils/orderUtils/getUiOrderType'),
  getUiOrderType: jest.fn(),
}))

const mockedGetUiOrderType = getUiOrderType as jest.MockedFunction<typeof getUiOrderType>

const chainId = SupportedChainId.MAINNET
const DAI = new Token(chainId, '0x6B175474E89094C44Da98b954EedeAC495271d0F', 18, 'DAI', 'Dai Stablecoin')
const USDC = new Token(chainId, '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48', 6, 'USDC', 'USD Coin')

const baseOrder: Order = {
  id: '0x123456789abcdef',
  owner: '0x1234567890123456789012345678901234567890',
  receiver: '0x1234567890123456789012345678901234567890',
  class: OrderClass.MARKET,
  status: OrderStatus.PENDING,
  creationTime: '2024-01-01T00:00:00Z',
  inputToken: DAI,
  outputToken: USDC,
  sellToken: DAI.address,
  buyToken: USDC.address,
  sellAmount: '1000000000000000000', // 1 DAI
  buyAmount: '1000000', // 1 USDC
  feeAmount: '10000000000000000', // 0.01 DAI
  kind: OrderKind.SELL,
  sellAmountBeforeFee: '1010000000000000000', // 1.01 DAI
  appData: '0x',
  appDataHash: '0x',
  signature: '0x',
  validTo: 1704067200,
  partiallyFillable: false,
  sellTokenBalance: SellTokenSource.ERC20,
  buyTokenBalance: BuyTokenDestination.ERC20,
  signingScheme: SigningScheme.EIP712,
}

describe('Fulfilled orders', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should show executed amounts for fulfilled sell order', () => {
    const order: Order = {
      ...baseOrder,
      status: OrderStatus.FULFILLED,
      apiAdditionalInfo: {
        status: OrderStatus.FULFILLED,
        executedBuyAmount: '990000', // 0.99 USDC
        executedSellAmount: '1000000000000000000', // 1 DAI
      } as never,
    }

    mockedGetUiOrderType.mockReturnValue(UiOrderType.SWAP)

    const summary = computeOrderSummary({ orderFromStore: order })

    expect(summary).toBe('Swap 1 DAI for 0.99 USDC')
  })

  it('should show executed amounts for fulfilled buy order', () => {
    const order: Order = {
      ...baseOrder,
      kind: OrderKind.BUY,
      status: OrderStatus.FULFILLED,
      apiAdditionalInfo: {
        status: OrderStatus.FULFILLED,
        executedBuyAmount: '1000000', // 1 USDC
        executedSellAmount: '1010000000000000000', // 1.01 DAI
      } as never,
    }

    mockedGetUiOrderType.mockReturnValue(UiOrderType.SWAP)

    const summary = computeOrderSummary({ orderFromStore: order })

    expect(summary).toBe('Swap 1.01 DAI for 1 USDC')
  })
})

describe('Pending sell orders', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should show sell amount with fee and "at least" for pending sell order', () => {
    const order: Order = {
      ...baseOrder,
      kind: OrderKind.SELL,
      status: OrderStatus.PENDING,
    }

    mockedGetUiOrderType.mockReturnValue(UiOrderType.SWAP)

    const summary = computeOrderSummary({ orderFromStore: order })

    expect(summary).toBe('Swap 1.01 DAI for at least 1 USDC')
  })

  it('should include fee in sell amount calculation', () => {
    const order: Order = {
      ...baseOrder,
      kind: OrderKind.SELL,
      status: OrderStatus.PENDING,
      sellAmount: '2000000000000000000', // 2 DAI
      feeAmount: '50000000000000000', // 0.05 DAI
      buyAmount: '2000000', // 2 USDC
    }

    mockedGetUiOrderType.mockReturnValue(UiOrderType.LIMIT)

    const summary = computeOrderSummary({ orderFromStore: order })

    // 2 DAI + 0.05 fee
    expect(summary).toBe('Limit order 2.05 DAI for at least 2 USDC')
  })
})

describe('Pending buy orders', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should show "at most" for pending buy order', () => {
    const order: Order = {
      ...baseOrder,
      kind: OrderKind.BUY,
      status: OrderStatus.PENDING,
    }

    mockedGetUiOrderType.mockReturnValue(UiOrderType.SWAP)

    const summary = computeOrderSummary({ orderFromStore: order })

    expect(summary).toBe('Swap at most 1.01 DAI for 1 USDC')
  })
})

describe('Order with custom receiver', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should include receiver address when different from owner', () => {
    const order: Order = {
      ...baseOrder,
      owner: '0x1234567890123456789012345678901234567890',
      receiver: '0xabcdefabcdefabcdefabcdefabcdefabcdefabcd',
      status: OrderStatus.PENDING,
    }

    mockedGetUiOrderType.mockReturnValue(UiOrderType.SWAP)

    const summary = computeOrderSummary({ orderFromStore: order })

    expect(summary).toBe('Swap 1.01 DAI for at least 1 USDC to 0xABcd...abCD')
  })

  it('should not include receiver when same as owner', () => {
    const order: Order = {
      ...baseOrder,
      owner: '0x1234567890123456789012345678901234567890',
      receiver: '0x1234567890123456789012345678901234567890',
      status: OrderStatus.PENDING,
    }

    mockedGetUiOrderType.mockReturnValue(UiOrderType.SWAP)

    const summary = computeOrderSummary({ orderFromStore: order })

    expect(summary).toBe('Swap 1.01 DAI for at least 1 USDC')
  })
})

describe('Using orderFromApi when available', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should use orderFromApi data when provided', () => {
    const orderFromStore: Order = {
      ...baseOrder,
      status: OrderStatus.PENDING,
      apiAdditionalInfo: {
        ...baseOrder,
        uid: '0x123456789abcdef',
        owner: '0xabcdefabcdefabcdefabcdefabcdefabcdefabcd',
        receiver: '0x9999999999999999999999999999999999999999',
        creationDate: '2024-01-01T00:00:00Z',
        invalidated: false,
        status: SdkOrderStatus.OPEN,
        totalFee: '',
        executedSellAmount: '',
        executedSellAmountBeforeFees: '',
        executedBuyAmount: '',
        executedFeeAmount: '',
      } as EnrichedOrder,
    }

    mockedGetUiOrderType.mockReturnValue(UiOrderType.SWAP)

    const summary = computeOrderSummary({ orderFromStore })

    // Should use receiver from orderFromApi
    expect(summary).toBe('Swap 1.01 DAI for at least 1 USDC to 0x9999...9999')
  })

  it('should fallback to orderFromStore when orderFromApi is null', () => {
    const orderFromStore: Order = {
      ...baseOrder,
      owner: '0x1234567890123456789012345678901234567890',
      receiver: '0xabcdefabcdefabcdefabcdefabcdefabcdefabcd',
      status: OrderStatus.PENDING,
    }

    mockedGetUiOrderType.mockReturnValue(UiOrderType.LIMIT)

    const summary = computeOrderSummary({ orderFromStore })

    expect(summary).toBe('Limit order 1.01 DAI for at least 1 USDC to 0xABcd...abCD')
  })
})

describe('Different order types', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should handle TWAP order type', () => {
    const order: Order = {
      ...baseOrder,
      status: OrderStatus.PENDING,
    }

    mockedGetUiOrderType.mockReturnValue(UiOrderType.TWAP)

    const summary = computeOrderSummary({ orderFromStore: order })

    expect(summary).toBe('TWAP order 1.01 DAI for at least 1 USDC')
  })
})

describe('Bridge orders', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  const WETH = new Token(chainId, '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2', 18, 'WETH', 'Wrapped Ether')
  const ARB = new Token(42161, '0x912CE59144191C1204E64559FE8253a0e49E6548', 18, 'ARB', 'Arbitrum')

  it('should show bridge amounts for pending bridge order', () => {
    const order: Order = {
      ...baseOrder,
      inputToken: WETH,
      outputToken: ARB,
      status: OrderStatus.PENDING,
    }

    const bridgeOrderFromStore = {
      quoteAmounts: {
        swapSellAmount: CurrencyAmount.fromRawAmount(WETH, '1000000000000000000'), // 1 WETH
        bridgeMinReceiveAmount: CurrencyAmount.fromRawAmount(ARB, '2500000000000000000'), // 2.5 ARB
      },
    }

    mockedGetUiOrderType.mockReturnValue(UiOrderType.SWAP)

    const summary = computeOrderSummary({
      orderFromStore: order,
      bridgeOrderFromStore: bridgeOrderFromStore as never,
    })

    expect(summary).toBe('Swap 1 WETH for at least 2.5 ARB')
  })

  it('should show executed amounts for fulfilled bridge order with API data', () => {
    const order: Order = {
      ...baseOrder,
      inputToken: WETH,
      outputToken: ARB,
      status: OrderStatus.FULFILLED,
      apiAdditionalInfo: {
        status: OrderStatus.FULFILLED,
        executedBuyAmount: '1000000000000000000', // 1 ARB (from swap)
        executedSellAmount: '1000000000000000000', // 1 WETH
      } as never,
    }

    const bridgeOrderFromStore = {
      quoteAmounts: {
        swapSellAmount: CurrencyAmount.fromRawAmount(WETH, '1000000000000000000'), // 1 WETH
        bridgeMinReceiveAmount: CurrencyAmount.fromRawAmount(ARB, '2500000000000000000'), // 2.5 ARB
      },
    }

    const bridgeOrderFromApi = {
      bridgingParams: {
        outputAmount: '2800000000000000000', // 2.8 ARB (actual bridge output)
      },
    }

    mockedGetUiOrderType.mockReturnValue(UiOrderType.SWAP)

    const summary = computeOrderSummary({
      orderFromStore: order,
      bridgeOrderFromStore: bridgeOrderFromStore as never,
      bridgeOrderFromApi: bridgeOrderFromApi as never,
    })

    expect(summary).toBe('Swap 1 WETH for 2.8 ARB')
  })

  it('should handle bridge order with custom receiver', () => {
    const order: Order = {
      ...baseOrder,
      inputToken: WETH,
      outputToken: ARB,
      status: OrderStatus.PENDING,
      owner: '0x1234567890123456789012345678901234567890',
      receiver: '0xabcdefabcdefabcdefabcdefabcdefabcdefabcd',
    }

    const bridgeOrderFromStore = {
      quoteAmounts: {
        swapSellAmount: CurrencyAmount.fromRawAmount(WETH, '1000000000000000000'),
        bridgeMinReceiveAmount: CurrencyAmount.fromRawAmount(ARB, '2500000000000000000'),
      },
    }

    mockedGetUiOrderType.mockReturnValue(UiOrderType.SWAP)

    const summary = computeOrderSummary({
      orderFromStore: order,
      bridgeOrderFromStore: bridgeOrderFromStore as never,
    })

    expect(summary).toBe('Swap 1 WETH for at least 2.5 ARB to 0xABcd...abCD')
  })
})
