import { ReactElement, ReactNode } from 'react'

import { ChainInfo } from '@cowprotocol/cow-sdk'

import { t } from '@lingui/core/macro'

export interface OrderSummaryTemplateProps {
  inputAmount: ReactElement
  outputAmount: ReactElement
  srcChainData?: ChainInfo
  dstChainData?: ChainInfo
  actionTitle?: string
}

export function SellForAtLeastTemplate({
  inputAmount,
  outputAmount,
  srcChainData,
  dstChainData,
  actionTitle = t`Sell`,
}: OrderSummaryTemplateProps): ReactNode {
  return (
    <>
      {actionTitle} {inputAmount}
      {srcChainData && ` (${srcChainData.label})`} for at least {outputAmount}
      {dstChainData && ` (${dstChainData.label})`}
    </>
  )
}

export function BuyForAtMostTemplate({
  inputAmount,
  outputAmount,
  srcChainData,
  dstChainData,
  actionTitle = t`Buy`,
}: OrderSummaryTemplateProps): ReactNode {
  return (
    <>
      {actionTitle} {outputAmount}
      {dstChainData && ` (${dstChainData.label})`} for at most {inputAmount}
      {srcChainData && ` (${srcChainData.label})`}
    </>
  )
}
