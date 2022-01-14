import { UserClaimData } from 'state/claim/hooks'
import { Currency, CurrencyAmount, Price, Token } from '@uniswap/sdk-core'
import { SyntheticEvent } from 'react'
import { GpEther } from 'constants/tokens'

export type ClaimCommonTypes = {
  account: string | null | undefined
  hasClaims: boolean
  tokenCurrencyAmount: CurrencyAmount<Token>
  handleChangeAccount: (e: SyntheticEvent<HTMLButtonElement>) => void
}

// Enhanced UserClaimData with useful additional properties
export type EnhancedUserClaimData = UserClaimData & {
  currencyAmount: CurrencyAmount<Token | GpEther> | undefined
  claimAmount: CurrencyAmount<Token> | undefined
  price: Price<Currency, Currency> | undefined
  cost: CurrencyAmount<Currency> | undefined
  isFree: boolean
}
