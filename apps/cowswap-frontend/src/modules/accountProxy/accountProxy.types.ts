import type { MessageDescriptor } from '@lingui/core'

import { TokenWithLogo } from '@cowprotocol/common-const'
import { CurrencyAmount, Token } from '@cowprotocol/currency'
import { CoWShedVersion, CowShedHooks, ICoWShedOptions } from '@cowprotocol/sdk-cow-shed'

export interface AccountProxyConfig {
  id: string
  version?: CoWShedVersion
  label?: MessageDescriptor
  factoryOptions?: ICoWShedOptions
}

export interface AccountProxyInfo extends AccountProxyConfig {
  sdk: CowShedHooks
  account: string
}

export interface TokenUsdAmountItem {
  token: TokenWithLogo
  balance: bigint
  usdAmount?: CurrencyAmount<Token>
  isLoading: boolean
}

export type TokenUsdAmounts = Record<string, TokenUsdAmountItem>
