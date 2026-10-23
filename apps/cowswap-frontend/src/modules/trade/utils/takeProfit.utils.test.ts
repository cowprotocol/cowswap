import { USDC, WRAPPED_NATIVE_CURRENCIES } from '@cowprotocol/common-const'
import { OrderClass, SupportedChainId } from '@cowprotocol/cow-sdk'
import { Token } from '@cowprotocol/currency'

import { getOrderMock } from 'mocks/orderMock'

import { Order } from 'legacy/state/orders/actions'

import { getTakeProfitNavigation, getTakeProfitOrder } from './takeProfit.utils'

const chainId = SupportedChainId.MAINNET
const usdc = USDC[chainId]
const weth = WRAPPED_NATIVE_CURRENCIES[chainId]
const swap: Order = {
  ...getOrderMock(chainId),
  class: OrderClass.MARKET,
  inputToken: usdc,
  outputToken: weth,
  apiAdditionalInfo: {
    executedBuyAmount: '1000000000000000000',
    executedSellAmount: '2000000000',
  } as Order['apiAdditionalInfo'],
}

it('passes percentage intent without prices or amounts in the URL', () => {
  const opportunity = getTakeProfitOrder(swap)
  if (!opportunity) throw new Error('Missing opportunity')
  const { path, draft } = getTakeProfitNavigation(opportunity, '10')
  expect(path).toBe(`/1/limit/${weth.address}/${usdc.address}`)
  expect(draft.inputAmount.toExact()).toBe('1')
  expect(draft.price).toEqual({ type: 'percentage', value: '10' })
})

it('does not offer a price without positive executed amounts', () => {
  expect(getTakeProfitOrder({ ...swap, apiAdditionalInfo: undefined })).toBeNull()
  expect(
    getTakeProfitOrder({ ...swap, apiAdditionalInfo: { ...swap.apiAdditionalInfo, executedBuyAmount: '0' } } as Order),
  ).toBeNull()
})

it.each([
  { class: OrderClass.LIMIT },
  { receiver: '0x1111111111111111111111111111111111111111' },
  { outputToken: WRAPPED_NATIVE_CURRENCIES[SupportedChainId.GNOSIS_CHAIN] },
])('does not offer take-profit for an ineligible order: %j', (update) => {
  expect(getTakeProfitOrder({ ...swap, ...update })).toBeNull()
})

it('does not substitute wrapped tokens for received native assets', () => {
  const nativeToken = new Token(chainId, '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE', 18, 'ETH')
  const opportunity = getTakeProfitOrder({ ...swap, outputToken: nativeToken } as Order)
  if (!opportunity) throw new Error('Missing opportunity')
  const { path, draft } = getTakeProfitNavigation(opportunity, null)
  expect(path).toBe(`/1/limit/ETH/${usdc.address}`)
  expect(draft.inputAmount.currency).toBe(nativeToken)
  expect(draft.price).toEqual({ type: 'custom' })
})
