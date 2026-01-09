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
  actionTitle,
}: OrderSummaryTemplateProps): ReactNode {
  return (
    <>
      {actionTitle ?? t`Sell`} {inputAmount}
      {srcChainData && ` (${srcChainData.label})`} {t`for at least`} {outputAmount}
      {dstChainData && ` (${dstChainData.label})`}
    </>
  )
}

export function BuyForAtMostTemplate({
  inputAmount,
  outputAmount,
  srcChainData,
  dstChainData,
  actionTitle,
}: OrderSummaryTemplateProps): ReactNode {
  return (
    <>
      {actionTitle ? actionTitle : t`Buy`} {outputAmount}
      {dstChainData && ` (${dstChainData.label})`} {t`for at most`} {inputAmount}
      {srcChainData && ` (${srcChainData.label})`}
    </>
  )
}
