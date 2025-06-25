import { ReactNode } from 'react'

import { getChainInfo } from '@cowprotocol/common-const'
import { SupportedChainId } from '@cowprotocol/cow-sdk'

import { abbreviateString } from '../../../utils'

import type { TokenErc20 } from '@gnosis.pm/dex-js'

export function getTokenLabelBaseNode(erc20: TokenErc20, showAbbreviated?: boolean): ReactNode {
  const abbreviated = abbreviateString(erc20.address, 6, 4)

  if (showAbbreviated) {
    return `${erc20.symbol ?? erc20.name ?? abbreviated}`
  }
  if (erc20.name && erc20.symbol) {
    return `${erc20.name} (${erc20.symbol})`
  }
  if (!erc20.name && erc20.symbol) {
    return (
      <span>
        <i>{abbreviated}</i> ({erc20.symbol})
      </span>
    )
  }

  return <i>{abbreviated}</i>
}

export function getNetworkSuffix(effectiveChainId: SupportedChainId): string {
  try {
    const chainInfo = getChainInfo(effectiveChainId as SupportedChainId)

    if (chainInfo && chainInfo.label) {
      return chainInfo.label
    }
  } catch (error) {
    console.warn(`Could not get chain info for chainId: ${effectiveChainId}`, error)
  }

  return ''
}
