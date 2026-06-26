import { ReactNode } from 'react'

import { getSafeAbsoluteUrl } from '@cowprotocol/common-utils'
import { OnBridgingSuccessPayload, ToastMessageType } from '@cowprotocol/events'
import { ExternalLink } from '@cowprotocol/ui'

import { t } from '@lingui/core/macro'
import { Trans } from '@lingui/react/macro'

import type { OrderSummaryTemplateProps } from 'common/pure/OrderSummary/summaryTemplates'

import { OrderNotification } from '../OrderNotification'

interface BridgingSuccessNotificationProps {
  payload: OnBridgingSuccessPayload
}

export function BridgingSuccessNotification({ payload }: BridgingSuccessNotificationProps): ReactNode {
  const { chainId, order } = payload
  const safeExplorerUrl = getSafeAbsoluteUrl(payload.explorerUrl)

  return (
    <OrderNotification
      title={<Trans>Bridging succeeded</Trans>}
      actionTitle={t`Bridge`}
      skipExplorerLink
      chainId={chainId}
      customTemplate={summaryTemplate}
      orderUid={order.uid}
      messageType={ToastMessageType.ORDER_FULFILLED}
      bottomContent={
        safeExplorerUrl ? (
          <div>
            <br />
            <ExternalLink href={safeExplorerUrl}>
              <Trans>View on Bridge Explorer ↗</Trans>
            </ExternalLink>
          </div>
        ) : null
      }
    />
  )
}

function summaryTemplate({
  inputAmount,
  outputAmount,
  srcChainData,
  dstChainData,
}: OrderSummaryTemplateProps): ReactNode {
  return (
    <>
      <Trans>Sell</Trans> {inputAmount}{' '}
      {srcChainData && (
        <>
          ({srcChainData.label}) <Trans>for a total of</Trans> {outputAmount}{' '}
          {dstChainData && <> ({dstChainData.label})</>}
        </>
      )}
    </>
  )
}
