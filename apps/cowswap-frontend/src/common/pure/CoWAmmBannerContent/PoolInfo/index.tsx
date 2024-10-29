import React from 'react'

import { USDC, WBTC } from '@cowprotocol/common-const'
import { SupportedChainId } from '@cowprotocol/cow-sdk'
import { TokenLogo } from '@cowprotocol/tokens'
import { UI } from '@cowprotocol/ui'

import * as styledEl from '../styled'

interface PoolInfoProps {
  isDarkMode: boolean
  isTokenSelectorView: boolean
  poolName: string
}

export function PoolInfo({ poolName, isTokenSelectorView, isDarkMode }: PoolInfoProps) {
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
            : `var(${UI.COLOR_COWAMM_DARK_GREEN})`
          : undefined
      }
    >
      higher APR available for your {poolName} pool:
      <i>
        <div>
          <TokenLogo token={WBTC} /> <TokenLogo token={USDC[SupportedChainId.MAINNET]} />
        </div>
        <span>WBTC-USDC</span>
      </i>
    </styledEl.PoolInfo>
  )
}
