import { WRAPPED_NATIVE_CURRENCIES as WETH } from '@cowprotocol/common-const'
import { OrderKind, SupportedChainId } from '@cowprotocol/cow-sdk'
import { ToastMessageType } from '@cowprotocol/events'
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

const wethAmount = CurrencyAmount.fromRawAmount(WETH_MAINNET, 1e18)
const daiAmount = CurrencyAmount.fromRawAmount(DAI_MAINNET, 2000 * 1e18)

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

describe('Swap Orders', () => {
  const baseParams = {
    orderType: UiOrderType.SWAP,
  }
  it('Sell', () => {
    const toastMessage = getPendingOrderNotificationToast(
      getTestParams({
        ...baseParams,
        kind: OrderKind.SELL,
      })
    )

    expect(toastMessage).toStrictEqual({
      ...resultCommon,
      message: 'Swap submitted: Sell 1 WETH for at least 2,000 DAI',
    })
  })

  it('Buy', () => {
    const toastMessage = getPendingOrderNotificationToast(
      getTestParams({
        ...baseParams,
        kind: OrderKind.BUY,
      })
    )

    expect(toastMessage).toStrictEqual({
      ...resultCommon,
      message: 'Swap submitted: Buy 2,000 DAI for at most 1 WETH',
    })
  })
})

describe('Limit Orders', () => {
  const baseParams = {
    orderType: UiOrderType.LIMIT,
  }
  it('Sell', () => {
    const toastMessage = getPendingOrderNotificationToast(
      getTestParams({
        ...baseParams,
        kind: OrderKind.SELL,
      })
    )

    expect(toastMessage).toStrictEqual({
      ...resultCommon,
      message: 'Limit order submitted: Sell 1 WETH for at least 2,000 DAI',
    })
  })

  it('Buy', () => {
    const toastMessage = getPendingOrderNotificationToast(
      getTestParams({
        ...baseParams,
        kind: OrderKind.BUY,
      })
    )

    expect(toastMessage).toStrictEqual({
      ...resultCommon,
      message: 'Limit order submitted: Buy 2,000 DAI for at most 1 WETH',
    })
  })
})

describe('Twap Orders', () => {
  const baseParams = {
    orderType: UiOrderType.TWAP,
  }
  it('Sell', () => {
    const toastMessage = getPendingOrderNotificationToast(
      getTestParams({
        ...baseParams,
        kind: OrderKind.SELL,
      })
    )

    expect(toastMessage).toStrictEqual({
      ...resultCommon,
      message: 'TWAP order submitted: Sell 1 WETH for at least 2,000 DAI',
    })
  })

  it('Buy', () => {
    const toastMessage = getPendingOrderNotificationToast(
      getTestParams({
        ...baseParams,
        kind: OrderKind.BUY,
      })
    )

    expect(toastMessage).toStrictEqual({
      ...resultCommon,
      message: 'TWAP order submitted: Buy 2,000 DAI for at most 1 WETH',
    })
  })
})
