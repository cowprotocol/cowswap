import { WRAPPED_NATIVE_CURRENCIES as WETH } from '@cowprotocol/common-const'
import { OrderKind, SupportedChainId } from '@cowprotocol/cow-sdk'
import { OnToastMessagePayload, ToastMessageType } from '@cowprotocol/events'
import { CurrencyAmount, Token, ChainId } from '@uniswap/sdk-core'

import { UiOrderType } from 'utils/orderUtils/getUiOrderType'

import { PendingOrderNotificationProps, getPendingOrderNotificationToast } from '.'

const WETH_MAINNET = new Token(ChainId.MAINNET, WETH[1].address, 18, 'WETH', 'Wrapped Ether')
const DAI_MAINNET = new Token(
  ChainId.MAINNET,
  '0x6b175474e89094c44da98b954eedeac495271d0f',
  18,
  'DAI',
  'Dai Stablecoin'
)

const wethAmount = CurrencyAmount.fromRawAmount(WETH_MAINNET, 1e18) // 1 WETH
const daiAmount = CurrencyAmount.fromRawAmount(DAI_MAINNET, 2000 * 1e18) // 2000 DAI

const wethAmountWithDecimals = CurrencyAmount.fromRawAmount(WETH_MAINNET, '1234567891112131410') // 1.23456789111213141 WETH
const daiAmountWithDecimals = CurrencyAmount.fromRawAmount(DAI_MAINNET, '2123456789101112131415') // 2123.456789101112131415 DAI

const resultCommon = {
  messageType: ToastMessageType.SWAP_POSTED_API,
  data: {
    orderUid: '0x123',
  },
}

function getTestParams(overrides: Partial<PendingOrderNotificationProps> = {}): PendingOrderNotificationProps {
  return {
    inputAmount: wethAmount, // sell WETH
    outputAmount: daiAmount, // buy DAI
    account: '0x123',
    chainId: SupportedChainId.MAINNET,
    isSafeWallet: false,
    kind: OrderKind.SELL,
    orderId: '0x123',
    orderType: UiOrderType.LIMIT,
    ...overrides,
  }
}

function getExpectedResult(message: string) {
  return {
    ...resultCommon,
    message,
  }
}

function assertMessage(result: OnToastMessagePayload | null, expectedMessage: string): void {
  expect(result).toStrictEqual(getExpectedResult(expectedMessage))
}

describe('Swap orders ', () => {
  const baseParams = {
    orderType: UiOrderType.SWAP,
  }
  it('Sell round amount', () => {
    // GIVEN: We just posted a Swap sell order selling 1 WETH for 2000 DAI (or more)
    const params = getTestParams({
      ...baseParams,
      kind: OrderKind.SELL,
    })

    // WHEN: We get the toast message
    const toastMessage = getPendingOrderNotificationToast(params)

    // THEN: The message should be as expected
    assertMessage(toastMessage, 'Swap submitted: Sell 1 WETH for at least 2,000 DAI')
  })

  it('Sell amounts with decimals', () => {
    // GIVEN: We just posted a Swap sell order selling 1.23456789111213141 WETH for 2123.456789101112131415 DAI (or more)
    const params = getTestParams({
      ...baseParams,
      kind: OrderKind.SELL,
      inputAmount: wethAmountWithDecimals,
      outputAmount: daiAmountWithDecimals,
    })

    // WHEN: We get the toast message
    const toastMessage = getPendingOrderNotificationToast(params)

    // THEN: The message should be as expected
    assertMessage(toastMessage, 'Swap submitted: Sell 1.2346 WETH for at least 2,123.4568 DAI')
  })

  it('Buy round amount', () => {
    // GIVEN: We just posted a Swap buy order buying 2000 DAI for 1 WETH (or less)
    const params = getTestParams({
      ...baseParams,
      kind: OrderKind.BUY,
    })

    // WHEN: We get the toast message
    const toastMessage = getPendingOrderNotificationToast(params)

    // THEN: The message should be as expected
    assertMessage(toastMessage, 'Swap submitted: Buy 2,000 DAI for at most 1 WETH')
  })

  it('Buy amounts with decimals', () => {
    // GIVEN: We just posted a Swap buy order buying 2123.456789101112131415 DAI for 1.23456789111213141 WETH (or less)
    const params = getTestParams({
      ...baseParams,
      inputAmount: wethAmountWithDecimals,
      outputAmount: daiAmountWithDecimals,
      kind: OrderKind.BUY,
    })

    // WHEN: We get the toast message
    const toastMessage = getPendingOrderNotificationToast(params)

    // THEN: The message should be as expected
    assertMessage(toastMessage, 'Swap submitted: Buy 2,123.4568 DAI for at most 1.2346 WETH')
  })
})

describe('Limit Orders', () => {
  const baseParams = {
    orderType: UiOrderType.LIMIT,
  }
  it('Sell round amount', () => {
    // GIVEN: We just posted a Limit sell order selling 1 WETH for 2000 DAI (or more)
    const params = getTestParams({
      ...baseParams,
      kind: OrderKind.SELL,
    })

    // WHEN: We get the toast message
    const toastMessage = getPendingOrderNotificationToast(params)

    // THEN: The message should be as expected
    assertMessage(toastMessage, 'Limit order submitted: Sell 1 WETH for at least 2,000 DAI')
  })

  it('Sell amounts with decimals', () => {
    // GIVEN: We just posted a Limit sell order selling 1.23456789111213141 WETH for 2123.456789101112131415 DAI (or more)
    const params = getTestParams({
      ...baseParams,
      kind: OrderKind.SELL,
      inputAmount: wethAmountWithDecimals,
      outputAmount: daiAmountWithDecimals,
    })

    // WHEN: We get the toast message
    const toastMessage = getPendingOrderNotificationToast(params)

    // THEN: The message should be as expected
    assertMessage(toastMessage, 'Limit order submitted: Sell 1.2346 WETH for at least 2,123.4568 DAI')
  })

  it('Buy round amounts', () => {
    // GIVEN: We just posted a Limit buy order buying 2000 DAI for 1 WETH (or less)
    const params = getTestParams({
      ...baseParams,
      kind: OrderKind.BUY,
    })

    // WHEN: We get the toast message
    const toastMessage = getPendingOrderNotificationToast(params)

    // THEN: The message should be as expected
    assertMessage(toastMessage, 'Limit order submitted: Buy 2,000 DAI for at most 1 WETH')
  })

  it('Buy amounts with decimals', () => {
    // GIVEN: We just posted a Limit buy order buying 2123.456789101112131415 DAI for 1.23456789111213141 WETH (or less)
    const params = getTestParams({
      ...baseParams,
      inputAmount: wethAmountWithDecimals,
      outputAmount: daiAmountWithDecimals,
      kind: OrderKind.BUY,
    })

    // WHEN: We get the toast message
    const toastMessage = getPendingOrderNotificationToast(params)

    // THEN: The message should be as expected
    assertMessage(toastMessage, 'Limit order submitted: Buy 2,123.4568 DAI for at most 1.2346 WETH')
  })
})

describe('Twap Orders', () => {
  const baseParams = {
    orderType: UiOrderType.TWAP,
  }
  it('Sell round amount', () => {
    // GIVEN: We just posted a TWAP sell order selling 1 WETH for 2000 DAI (or more)
    const params = getTestParams({
      ...baseParams,
      kind: OrderKind.SELL,
    })

    // WHEN: We get the toast message
    const toastMessage = getPendingOrderNotificationToast(params)

    // THEN: The message should be as expected
    assertMessage(toastMessage, 'TWAP order submitted: Sell 1 WETH for at least 2,000 DAI')
  })

  it('Sell amounts with decimals', () => {
    // GIVEN: We just posted a TWAP sell order selling 1.23456789111213141 WETH for 2123.456789101112131415 DAI (or more)
    const params = getTestParams({
      ...baseParams,
      kind: OrderKind.SELL,
      inputAmount: wethAmountWithDecimals,
      outputAmount: daiAmountWithDecimals,
    })

    // WHEN: We get the toast message
    const toastMessage = getPendingOrderNotificationToast(params)

    // THEN: The message should be as expected
    assertMessage(toastMessage, 'TWAP order submitted: Sell 1.2346 WETH for at least 2,123.4568 DAI')
  })

  it('Buy round amount', () => {
    // GIVEN: We just posted a TWAP buy order buying 2000 DAI for 1 WETH (or less)
    const params = getTestParams({
      ...baseParams,
      kind: OrderKind.BUY,
    })

    // WHEN: We get the toast message
    const toastMessage = getPendingOrderNotificationToast(params)

    // THEN: The message should be as expected
    assertMessage(toastMessage, 'TWAP order submitted: Buy 2,000 DAI for at most 1 WETH')
  })

  it('Buy amounts with decimals', () => {
    // GIVEN: We just posted a TWAP buy order buying 2123.456789101112131415 DAI for 1.23456789111213141 WETH (or less)
    const params = getTestParams({
      ...baseParams,
      inputAmount: wethAmountWithDecimals,
      outputAmount: daiAmountWithDecimals,
      kind: OrderKind.BUY,
    })

    // WHEN: We get the toast message
    const toastMessage = getPendingOrderNotificationToast(params)

    // THEN: The message should be as expected
    assertMessage(toastMessage, 'TWAP order submitted: Buy 2,123.4568 DAI for at most 1.2346 WETH')
  })
})
