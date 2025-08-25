import React, { useMemo } from 'react'

import type { CrossChainOrder } from '@cowprotocol/sdk-bridging'
import type { TokenInfo } from '@uniswap/token-lists'

import BigNumber from 'bignumber.js'
import { RowWithCopyButton } from 'components/common/RowWithCopyButton'
import { TokenDisplay as CommonTokenDisplay } from 'components/common/TokenDisplay'
import ShimmerBar from 'explorer/components/common/ShimmerBar'

import { AmountDetailBlock, AmountLabel, AmountTokenDisplayAndCopyWrapper } from './styled'

import { isNativeToken } from '../../../utils'
import { TokenAmount } from '../../token/TokenAmount'

interface BridgeAmountDisplayProps {
  labelPrefix: string
  bridgeToken?: TokenInfo
  amount?: string | null
  isLoading?: boolean
  bridgeProvider?: CrossChainOrder['provider']
}

export function BridgeAmountDisplay({
  labelPrefix,
  bridgeToken,
  amount,
  isLoading,
  bridgeProvider,
}: BridgeAmountDisplayProps): React.ReactNode {
  const isNative = !!bridgeToken && isNativeToken(bridgeToken.address)

  const tokenDisplayElement = useMemo(() => {
    if (!bridgeToken?.chainId) return null

    return (
      <CommonTokenDisplay
        erc20={bridgeToken}
        network={bridgeToken.chainId}
        bridgeProvider={bridgeProvider}
        showNetworkName
      />
    )
  }, [bridgeToken, bridgeProvider])

  if (isLoading) {
    return (
      <AmountDetailBlock>
        <AmountLabel>{labelPrefix}</AmountLabel>
        <ShimmerBar height={1.6} />
      </AmountDetailBlock>
    )
  }

  if (!bridgeToken || !amount) {
    return (
      <AmountDetailBlock>
        <AmountLabel>{labelPrefix}</AmountLabel>
        <span>-</span>
      </AmountDetailBlock>
    )
  }

  return (
    <AmountDetailBlock>
      <AmountLabel>{labelPrefix}</AmountLabel>
      <AmountTokenDisplayAndCopyWrapper>
        <TokenAmount amount={new BigNumber(amount)} token={bridgeToken} noSymbol />
        {isNative ? (
          tokenDisplayElement
        ) : (
          <RowWithCopyButton textToCopy={bridgeToken.address} contentsToDisplay={tokenDisplayElement} />
        )}
      </AmountTokenDisplayAndCopyWrapper>
    </AmountDetailBlock>
  )
}
