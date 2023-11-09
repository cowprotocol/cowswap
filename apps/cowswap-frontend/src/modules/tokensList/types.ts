import { TokenWithLogo } from '@cowprotocol/common-const'

import { PermitCompatibleTokens } from 'modules/permit'
import { TokenAmounts } from 'modules/tokens'

export interface SelectTokenContext {
  balances: TokenAmounts | null
  balancesLoading: boolean
  selectedToken?: string
  onSelectToken(token: TokenWithLogo): void
  unsupportedTokens: { [tokenAddress: string]: { dateAdded: number } }
  permitCompatibleTokens: PermitCompatibleTokens
}
