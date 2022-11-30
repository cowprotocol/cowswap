import { getDecimals } from '@cow/modules/limitOrders/utils/getDecimals'
import { DEFAULT_DECIMALS } from 'custom/constants'
import { Currency } from '@uniswap/sdk-core'

export const parsePrice = (price: number, currency: Currency) =>
  price * 10 ** (DEFAULT_DECIMALS + getDecimals(currency))
