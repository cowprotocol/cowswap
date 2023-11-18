import { BalancesState } from '@cowprotocol/balances-and-allowances'
import { TokenWithLogo } from '@cowprotocol/common-const'

import { PermitCompatibleTokens } from 'modules/permit'

export interface SelectTokenContext {
  balancesState: BalancesState
  selectedToken?: string
  onSelectToken(token: TokenWithLogo): void
  unsupportedTokens: { [tokenAddress: string]: { dateAdded: number } }
  permitCompatibleTokens: PermitCompatibleTokens
}
