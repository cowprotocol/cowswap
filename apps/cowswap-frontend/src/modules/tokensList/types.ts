import { BalancesState } from '@cowprotocol/balances-and-allowances'
import { TokenWithLogo } from '@cowprotocol/common-const'
import { ChainInfo } from '@cowprotocol/types'
import { Currency } from '@uniswap/sdk-core'

import { Nullish } from 'types'

import { PermitCompatibleTokens } from 'modules/permit'

import { TokenListTags } from '../../common/hooks/useTokenListTags'

export interface SelectTokenContext {
  balancesState: BalancesState
  selectedToken?: Nullish<Currency>

  onSelectToken(token: TokenWithLogo): void

  unsupportedTokens: { [tokenAddress: string]: { dateAdded: number } }
  permitCompatibleTokens: PermitCompatibleTokens
  tokenListTags: TokenListTags
}

export interface ChainsToSelectState {
  chains: ChainInfo[] | undefined
  defaultChainId?: number
  isLoading?: boolean
}
