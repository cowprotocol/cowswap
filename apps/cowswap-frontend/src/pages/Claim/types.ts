import { SyntheticEvent } from 'react'

import { Currency, CurrencyAmount, Price, Token } from '@uniswap/sdk-core'

import { GpEther } from 'legacy/constants/tokens'
import { UserClaimData } from 'legacy/state/claim/hooks'

export type ClaimCommonTypes = {
  account: string | null | undefined
  hasClaims: boolean
  isClaimed: boolean
  claims: EnhancedUserClaimData[]
  isAirdropOnly: boolean
  tokenCurrencyAmount: CurrencyAmount<Token>
  handleChangeAccount: (e: SyntheticEvent<HTMLButtonElement>) => void
}

// Enhanced UserClaimData with useful additional properties
export type EnhancedUserClaimData = UserClaimData & {
  claimAmount: CurrencyAmount<Token>
  isFree: boolean
  currencyAmount?: CurrencyAmount<Token | GpEther> | undefined
  price?: Price<Currency, Currency> | undefined
  cost?: CurrencyAmount<Currency> | undefined
}

export type InvestmentAmounts = {
  vCowAmount?: CurrencyAmount<Currency>
  investmentCost?: CurrencyAmount<Currency>
}

export type ClaimWithInvestmentData = EnhancedUserClaimData & InvestmentAmounts
