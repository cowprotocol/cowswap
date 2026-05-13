import { useAtomValue } from 'jotai'

import { SupportedChainId } from '@cowprotocol/cow-sdk'
import { CurrencyAmount, Token } from '@cowprotocol/currency'

import { render, screen } from '@testing-library/react'

import { useGetReceiveAmountInfo, ReceiveAmountInfo } from 'modules/trade'
import { useUsdAmount } from 'modules/usdAmount'

import { AmountParts } from '.'

jest.mock('jotai', () => ({
  ...jest.requireActual('jotai'),
  useAtomValue: jest.fn(),
}))

jest.mock('modules/trade', () => ({
  useGetReceiveAmountInfo: jest.fn(),
}))

jest.mock('modules/usdAmount', () => ({
  useUsdAmount: jest.fn().mockReturnValue({ value: null }),
}))

jest.mock('@lingui/react', () => ({
  useLingui: () => ({
    _: (descriptor: { message?: string; id?: string }) => descriptor.message ?? descriptor.id ?? '',
  }),
}))

jest.mock('@cowprotocol/ui', () => ({
  ...jest.requireActual('@cowprotocol/ui'),
  // Render amount as readable text so we can assert on it
  TokenAmount: ({ amount }: { amount: CurrencyAmount<Token> | null }) => (
    <span data-testid="token-amount">{amount ? `${amount.toSignificant(6)} ${amount.currency.symbol}` : ''}</span>
  ),
  FiatAmount: () => null,
  HelpTooltip: () => null,
  renderTooltip: (x: unknown) => x,
}))

const useAtomValueMock = useAtomValue as jest.MockedFunction<typeof useAtomValue>
const useGetReceiveAmountInfoMock = useGetReceiveAmountInfo as jest.MockedFunction<typeof useGetReceiveAmountInfo>

const USDC = new Token(SupportedChainId.MAINNET, '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48', 6, 'USDC', 'USD Coin')
const WETH = new Token(
  SupportedChainId.MAINNET,
  '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2',
  18,
  'WETH',
  'Wrapped Ether',
)

// Dummy placeholder amounts used as fillers for fields not under test
const ZERO_USDC = CurrencyAmount.fromRawAmount(USDC, '0')
const ZERO_WETH = CurrencyAmount.fromRawAmount(WETH, '0')

function buildReceiveAmountInfo(
  sellAmount: CurrencyAmount<Token>,
  buyAmount: CurrencyAmount<Token>,
): ReceiveAmountInfo {
  const currencies = { sellAmount, buyAmount }
  return {
    isSell: true,
    quotePrice: null as never,
    costs: {
      networkFee: { amountInSellCurrency: ZERO_USDC, amountInBuyCurrency: ZERO_WETH },
      partnerFee: { amount: ZERO_USDC, bps: 0 },
    },
    beforeAllFees: currencies,
    beforeNetworkCosts: currencies,
    afterNetworkCosts: currencies,
    afterPartnerFees: currencies,
    afterSlippage: currencies,
    amountsToSign: currencies,
  }
}

describe('AmountParts', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    useAtomValueMock.mockReturnValue({ numberOfPartsValue: 5 })
    ;(useUsdAmount as jest.Mock).mockReturnValue({ value: null })
  })

  it('sell amount displays beforeAllFees.sellAmount', () => {
    const sellAmount = CurrencyAmount.fromRawAmount(USDC, '3000000') // 3 USDC
    useGetReceiveAmountInfoMock.mockReturnValue({
      ...buildReceiveAmountInfo(ZERO_USDC, ZERO_WETH),
      beforeAllFees: { sellAmount, buyAmount: ZERO_WETH },
      afterPartnerFees: { sellAmount: ZERO_USDC, buyAmount: ZERO_WETH },
    })

    render(<AmountParts />)

    const [sellAmountEl] = screen.getAllByTestId('token-amount')
    expect(sellAmountEl.textContent).toBe('3 USDC')
  })

  it('buy amount displays afterPartnerFees.buyAmount', () => {
    const sellAmount = CurrencyAmount.fromRawAmount(USDC, '3000000') // 3 USDC
    const buyAmount = CurrencyAmount.fromRawAmount(WETH, '1500000000000000000') // 1.5 WETH

    useGetReceiveAmountInfoMock.mockReturnValue({
      ...buildReceiveAmountInfo(ZERO_USDC, ZERO_WETH),
      beforeAllFees: { sellAmount: ZERO_USDC, buyAmount: ZERO_WETH },
      afterPartnerFees: { sellAmount, buyAmount },
    })

    render(<AmountParts />)

    const [, buyAmountEl] = screen.getAllByTestId('token-amount')
    expect(buyAmountEl.textContent).toBe('1.5 WETH')
  })
})
