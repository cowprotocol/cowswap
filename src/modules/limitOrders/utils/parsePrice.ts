import { Currency } from '@uniswap/sdk-core'

import { getDecimals } from 'modules/limitOrders/utils/getDecimals'

import { DEFAULT_DECIMALS } from 'legacy/constants'

export const parsePrice = (price: number, currency: Currency) =>
  price * 10 ** (DEFAULT_DECIMALS + getDecimals(currency))
