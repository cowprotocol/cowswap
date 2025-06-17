import React, { ReactNode } from 'react'

import { useCowAnalytics } from '@cowprotocol/analytics'
import { SupportedChainId } from '@cowprotocol/cow-sdk'
import { TruncatedText } from '@cowprotocol/ui/pure/TruncatedText'

import { DateDisplay } from 'components/common/DateDisplay'
import { DetailRow } from 'components/common/DetailRow'
import { RowWithCopyButton } from 'components/common/RowWithCopyButton'
import { SimpleTable } from 'components/common/SimpleTable'
import { AmountsDisplay } from 'components/orders/AmountsDisplay'
import { StatusLabel } from 'components/orders/StatusLabel'
import { capitalize } from 'utils'

import { Order, OrderStatus } from 'api/operator'
import { ExplorerCategory } from 'common/analytics/types'
import { getUiOrderType } from 'utils/getUiOrderType'

import { DetailsTableTooltips } from './detailsTableTooltips'
import { FromItem } from './items/FromItem'
import { ToItem } from './items/ToItem'
import { TxHashItem } from './items/TxHashItem'
import { WarningRow } from './styled'

import { UnsignedOrderWarning } from '../UnsignedOrderWarning'

export type Props = {
  chainId: SupportedChainId
  order: Order
  areTradesLoading: boolean
  showFillsButton?: boolean
  children?: ReactNode
}

// eslint-disable-next-line max-lines-per-function
export function DetailsTable(props: Props): ReactNode {
  const { chainId, order, areTradesLoading, showFillsButton = false, children } = props
  const cowAnalytics = useCowAnalytics()
  const {
    uid,
    owner,
    receiver,
    txHash,
    kind,
    partiallyFillable,
    creationDate,
    executionDate,
    status,
    partiallyFilled,
    buyToken,
    sellToken,
  } = order

  if (!buyToken || !sellToken) {
    return null
  }

  const isBridgingOrder = !!order.bridgeProviderId

  const onCopy = (label: string): void => {
    cowAnalytics.sendEvent({
      category: ExplorerCategory.ORDER_DETAILS,
      action: 'Copy',
      label,
    })
  }
  const isSigning = status === OrderStatus.Signing

  return (
    <SimpleTable
      columnViewMobile
      body={
        <>
          {isSigning && (
            <WarningRow>
              <td colSpan={2}>
                <UnsignedOrderWarning />
              </td>
            </WarningRow>
          )}
          <DetailRow label="Order Id" tooltipText={DetailsTableTooltips.orderID}>
            <RowWithCopyButton
              textToCopy={uid}
              contentsToDisplay={<TruncatedText>{uid}</TruncatedText>}
              onCopy={() => onCopy('orderId')}
            />
          </DetailRow>
          <FromItem
            chainId={chainId}
            isSigning={isSigning}
            onCopy={onCopy}
            owner={owner}
            isBridgingOrder={isBridgingOrder}
          />
          <ToItem chainId={chainId} onCopy={onCopy} receiver={receiver} isBridgingOrder={isBridgingOrder} />
          {!partiallyFilled && (
            <TxHashItem chainId={chainId} txHash={txHash} isLoading={areTradesLoading} onCopy={onCopy} />
          )}
          <DetailRow label="Status" tooltipText={DetailsTableTooltips.status}>
            <StatusLabel status={status} partiallyFilled={partiallyFilled} partialTagPosition="right" />
          </DetailRow>
          <DetailRow label="Submission Time" tooltipText={DetailsTableTooltips.submission}>
            <DateDisplay date={creationDate} showIcon={true} />
          </DetailRow>
          {executionDate && !showFillsButton && (
            <DetailRow label="Execution Time" tooltipText={DetailsTableTooltips.execution}>
              <DateDisplay date={executionDate} showIcon={true} />
            </DetailRow>
          )}
          <DetailRow label="Type" tooltipText={DetailsTableTooltips.type}>
            <>
              {capitalize(kind)} {getUiOrderType(order).toLowerCase()} order{' '}
              {partiallyFillable ? '(Partially fillable)' : '(Fill or Kill)'}
            </>
          </DetailRow>
          <DetailRow label="Amount" tooltipText={DetailsTableTooltips.amount}>
            <AmountsDisplay order={order} />
          </DetailRow>
          {children}
        </>
      }
    />
  )
}
