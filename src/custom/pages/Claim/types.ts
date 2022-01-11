import { CurrencyAmount, Token } from '@uniswap/sdk-core'
import { SyntheticEvent } from 'react'

export type ClaimCommonTypes = {
  account: string | null | undefined
  hasClaims: boolean
  tokenCurrencyAmount: CurrencyAmount<Token>
  handleChangeAccount: (e: SyntheticEvent<HTMLButtonElement>) => void
}
