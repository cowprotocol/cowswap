import React, { useMemo } from 'react'

import BigNumber from 'bignumber.js'
import { RowWithCopyButton } from 'components/common/RowWithCopyButton'
import { TokenDisplay as CommonTokenDisplay } from 'components/common/TokenDisplay'
import ShimmerBar from 'explorer/components/common/ShimmerBar'

import { formatTokenAmount, mapBridgeableToErc20 } from 'utils/tokenFormatting'

import { AmountDetailBlock, AmountLabel, AmountTokenDisplayAndCopyWrapper } from './styled'

interface BridgeAmountDisplayProps {
  labelPrefix: string
  bridgeToken?: { address: string; decimals?: number; symbol?: string; chainId: number }
  amount?: string | BigNumber | null
  isLoading?: boolean
}

export function BridgeAmountDisplay({
  labelPrefix,
  bridgeToken,
  amount,
  isLoading,
}: BridgeAmountDisplayProps): React.ReactNode {
  const mappedToken = useMemo(() => (bridgeToken ? mapBridgeableToErc20(bridgeToken) : null), [bridgeToken])

  const { formattedAmount, isNative } = useMemo(() => {
    if (!mappedToken || amount === undefined || amount === null) {
      return { formattedAmount: null, isNative: false }
    }
    return formatTokenAmount(new BigNumber(amount), mappedToken)
  }, [mappedToken, amount])

  const tokenDisplayElement = useMemo(() => {
    if (!mappedToken || !bridgeToken?.chainId) return null
    return <CommonTokenDisplay erc20={mappedToken} network={bridgeToken.chainId} showNetworkName />
  }, [mappedToken, bridgeToken?.chainId])

  if (isLoading) {
    return (
      <AmountDetailBlock>
        <AmountLabel>{labelPrefix}</AmountLabel>
        <ShimmerBar height={1.6} />
      </AmountDetailBlock>
    )
  }

  if (!bridgeToken || !formattedAmount) {
    return (
      <AmountDetailBlock>
        <AmountLabel>{labelPrefix}</AmountLabel>
        <span>N/A</span>
      </AmountDetailBlock>
    )
  }

  return (
    <AmountDetailBlock>
      <AmountLabel>{labelPrefix}</AmountLabel>
      <AmountTokenDisplayAndCopyWrapper>
        <span>{formattedAmount}</span>
        {isNative ? (
          tokenDisplayElement
        ) : (
          <RowWithCopyButton textToCopy={mappedToken?.address || ''} contentsToDisplay={tokenDisplayElement} />
        )}
      </AmountTokenDisplayAndCopyWrapper>
    </AmountDetailBlock>
  )
}
