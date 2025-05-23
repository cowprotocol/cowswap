import { TokenErc20 } from '@gnosis.pm/dex-js'
import { calculatePrice } from '@gnosis.pm/dex-js'
import BigNumber from 'bignumber.js'
import { TEN_BIG_NUMBER } from 'const'

export function calculateExecutionPrice(
  isPriceInverted: boolean,
  sellAmount: BigNumber,
  buyAmount: BigNumber,
  sellToken?: TokenErc20 | null,
  buyToken?: TokenErc20 | null,
): BigNumber | null {
  if (!sellToken || !buyToken) return null

  const sellData = { amount: sellAmount, decimals: sellToken.decimals }
  const buyData = { amount: buyAmount, decimals: buyToken.decimals }

  return calculatePrice({
    numerator: isPriceInverted ? buyData : sellData,
    denominator: isPriceInverted ? sellData : buyData,
  }).multipliedBy(TEN_BIG_NUMBER.exponentiatedBy((isPriceInverted ? buyToken : sellToken).decimals))
}
