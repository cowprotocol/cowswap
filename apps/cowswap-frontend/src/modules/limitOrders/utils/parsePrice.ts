import { Currency } from '@uniswap/sdk-core'

import { DEFAULT_DECIMALS } from '../../../legacy/constants'

import { getDecimals } from './getDecimals'

export const parsePrice = (price: number, currency: Currency) =>
  price * 10 ** (DEFAULT_DECIMALS + getDecimals(currency))
