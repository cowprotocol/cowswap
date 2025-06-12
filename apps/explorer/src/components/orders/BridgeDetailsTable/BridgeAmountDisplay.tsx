import React, { useMemo } from 'react'

import type { TokenInfo } from '@uniswap/token-lists'

import BigNumber from 'bignumber.js'
import { RowWithCopyButton } from 'components/common/RowWithCopyButton'
import { TokenDisplay as CommonTokenDisplay } from 'components/common/TokenDisplay'
import ShimmerBar from 'explorer/components/common/ShimmerBar'

import { formatTokenAmount } from 'utils/tokenFormatting'

import { AmountDetailBlock, AmountLabel, AmountTokenDisplayAndCopyWrapper } from './styled'

interface BridgeAmountDisplayProps {
  labelPrefix: string
  bridgeToken?: TokenInfo
  amount?: string | BigNumber | null
  isLoading?: boolean
}

export function BridgeAmountDisplay({
  labelPrefix,
  bridgeToken,
  amount,
  isLoading,
}: BridgeAmountDisplayProps): React.ReactNode {
  const { formattedAmount, isNative } = useMemo(() => {
    if (!bridgeToken || amount === undefined || amount === null) {
      return { formattedAmount: null, isNative: false }
    }
    return formatTokenAmount(new BigNumber(amount), bridgeToken)
  }, [bridgeToken, amount])

  const tokenDisplayElement = useMemo(() => {
    if (!bridgeToken?.chainId) return null

    return <CommonTokenDisplay erc20={bridgeToken} network={bridgeToken.chainId} showNetworkName />
  }, [bridgeToken])

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
          <RowWithCopyButton textToCopy={bridgeToken.address} contentsToDisplay={tokenDisplayElement} />
        )}
      </AmountTokenDisplayAndCopyWrapper>
    </AmountDetailBlock>
  )
}
