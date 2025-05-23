import { TokenErc20 } from '@gnosis.pm/dex-js'
import BigNumber from 'bignumber.js'
import { formatSmartMaxPrecision, isNativeToken, safeTokenName } from 'utils'

import { Network } from '../types'

export interface FormattedTokenAmount {
  formattedAmount: string
  symbol: string
  isNative: boolean
}

export function formatTokenAmount(amount: BigNumber, token: TokenErc20 | null, address?: string): FormattedTokenAmount {
  if (!token) {
    return {
      formattedAmount: amount.toString(10),
      symbol: address || 'Unknown',
      isNative: false,
    }
  }

  const formattedAmount = token.decimals >= 0 ? formatSmartMaxPrecision(amount, token) : amount.toString(10)

  return {
    formattedAmount,
    symbol: safeTokenName(token),
    isNative: isNativeToken(token.address),
  }
}

export function mapBridgeableToErc20(
  bridgeToken: { address: string; decimals?: number; symbol?: string; chainId: number } | undefined,
): TokenErc20 & { chainId?: Network } {
  if (!bridgeToken) {
    return {
      address: '',
      decimals: 18,
      symbol: 'ERR',
      name: 'Error Token',
    } as TokenErc20 & { chainId?: Network }
  }

  return {
    address: bridgeToken.address,
    decimals: bridgeToken.decimals === undefined ? 18 : bridgeToken.decimals,
    symbol: bridgeToken.symbol || 'N/A',
    name: bridgeToken.symbol || bridgeToken.address,
    chainId: bridgeToken.chainId as Network,
  }
}
