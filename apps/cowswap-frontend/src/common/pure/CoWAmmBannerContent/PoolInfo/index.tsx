import React from 'react'

import { LpToken } from '@cowprotocol/common-const'
import { TokenLogo, TokensByAddress } from '@cowprotocol/tokens'
import { TokenSymbol, UI } from '@cowprotocol/ui'

import { LP_PROVIDER_NAMES } from '../const'
import * as styledEl from '../styled'

interface PoolInfoProps {
  isDarkMode: boolean
  isTokenSelectorView: boolean
  token: LpToken
  tokensByAddress: TokensByAddress
}

// TODO: Add proper return type annotation
// TODO: Reduce function complexity by extracting logic
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type, complexity
export function PoolInfo({ token, tokensByAddress, isTokenSelectorView, isDarkMode }: PoolInfoProps) {
  const poolName = token.lpTokenProvider ? LP_PROVIDER_NAMES[token.lpTokenProvider] : null
  const token0 = tokensByAddress[token.tokens[0]]
  const token1 = tokensByAddress[token.tokens[1]]

  if (!poolName) return null

  return (
    <styledEl.PoolInfo
      flow={isTokenSelectorView ? 'row' : 'column'}
      align={isTokenSelectorView ? 'center' : 'flex-start'}
      bgColor={
        isTokenSelectorView
          ? isDarkMode
            ? `var(${UI.COLOR_COWAMM_LIGHT_BLUE})`
            : `var(${UI.COLOR_COWAMM_DARK_GREEN_OPACITY_15})`
          : undefined
      }
      color={
        isTokenSelectorView
          ? isDarkMode
            ? `var(${UI.COLOR_COWAMM_DARK_BLUE})`
            : `var(${UI.COLOR_COWAMM_DARK_GREEN})`
          : undefined
      }
      tokenBorderColor={
        isTokenSelectorView
          ? isDarkMode
            ? `var(${UI.COLOR_COWAMM_LIGHT_BLUE})`
            : `var(${UI.COLOR_COWAMM_LIGHT_GREEN})`
          : undefined
      }
    >
      higher APR available for your {poolName} pool:
      <i>
        <div>
          <TokenLogo token={token0} /> <TokenLogo token={token1} />
        </div>
        <span>
          <TokenSymbol token={token0} />-<TokenSymbol token={token1} />
        </span>
      </i>
    </styledEl.PoolInfo>
  )
}
