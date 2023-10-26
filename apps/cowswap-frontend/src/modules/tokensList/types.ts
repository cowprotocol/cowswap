import { TokenWithLogo } from '@cowprotocol/common-const'

import { TokenAmounts } from 'modules/tokens'

export interface SelectTokenContext {
  balances: TokenAmounts | null
  balancesLoading: boolean
  selectedToken?: string
  onSelectToken(token: TokenWithLogo): void
  unsupportedTokens: { [tokenAddress: string]: { dateAdded: number } }
  permitCompatibleTokens: { [tokenAddress: string]: boolean }
}
