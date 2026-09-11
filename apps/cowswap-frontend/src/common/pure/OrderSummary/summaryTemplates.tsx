import { ReactElement, ReactNode } from 'react'

import { ChainInfo } from '@cowprotocol/cow-sdk'

import { t } from '@lingui/core/macro'
import { Trans } from '@lingui/react/macro'

export interface OrderSummaryTemplateProps {
  inputAmount: ReactElement
  outputAmount: ReactElement
  srcChainData?: ChainInfo
  dstChainData?: ChainInfo
  actionTitle?: string
}

export function BuyForAtMostTemplate({
  inputAmount,
  outputAmount,
  srcChainData,
  dstChainData,
  actionTitle,
}: OrderSummaryTemplateProps): ReactNode {
  const action = actionTitle ? actionTitle : t`Buy`
  const buyAmount = (
    <>
      {outputAmount}
      {dstChainData && ` (${dstChainData.label})`}
    </>
  )
  const payAmount = (
    <>
      {inputAmount}
      {srcChainData && ` (${srcChainData.label})`}
    </>
  )

  return (
    <Trans>
      {action} {buyAmount} for at most {payAmount}
    </Trans>
  )
}

export function SellForAtLeastTemplate({
  inputAmount,
  outputAmount,
  srcChainData,
  dstChainData,
  actionTitle,
}: OrderSummaryTemplateProps): ReactNode {
  const action = actionTitle ?? t`Sell`
  const sellAmount = (
    <>
      {inputAmount}
      {srcChainData && ` (${srcChainData.label})`}
    </>
  )
  const receiveAmount = (
    <>
      {outputAmount}
      {dstChainData && ` (${dstChainData.label})`}
    </>
  )

  return (
    <Trans>
      {action} {sellAmount} for at least {receiveAmount}
    </Trans>
  )
}
