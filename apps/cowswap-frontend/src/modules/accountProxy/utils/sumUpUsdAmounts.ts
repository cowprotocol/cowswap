import { USDC } from '@cowprotocol/common-const'
import { SupportedChainId } from '@cowprotocol/cow-sdk'
import { CurrencyAmount, Token } from '@uniswap/sdk-core'

import { TokenUsdAmounts } from '../types'

export function sumUpUsdAmounts(chainId: SupportedChainId, amounts: TokenUsdAmounts): CurrencyAmount<Token> {
  const usdcToken = USDC[chainId]

  return Object.values(amounts).reduce(
    (acc, val) => {
      if (!val.usdAmount || !acc.currency.equals(val.usdAmount.currency)) return acc

      return acc.add(val.usdAmount)
    },
    CurrencyAmount.fromRawAmount(usdcToken as Token, 0),
  )
}
