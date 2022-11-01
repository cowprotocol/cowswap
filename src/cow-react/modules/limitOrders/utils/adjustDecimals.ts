import BigNumber from 'bignumber.js'

export const adjustDecimals = (price: number, decimals: number) => {
  return new BigNumber(price).div(10 ** (18 - decimals))
}
