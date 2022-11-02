import BigNumber from 'bignumber.js'
import { DEFAULT_DECIMALS } from 'custom/constants'

export const adjustDecimals = (price: number, decimals: number) => {
  return new BigNumber(price).div(10 ** (18 - (decimals || DEFAULT_DECIMALS)))
}
