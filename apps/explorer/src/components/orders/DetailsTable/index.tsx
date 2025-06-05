import React, { ReactNode } from 'react'

import { useCowAnalytics } from '@cowprotocol/analytics'
import { ExplorerDataType, getExplorerLink } from '@cowprotocol/common-utils'
import { SupportedChainId } from '@cowprotocol/cow-sdk'
import { Icon, UI } from '@cowprotocol/ui'
import { TruncatedText } from '@cowprotocol/ui/pure/TruncatedText'

import { faGroupArrowsRotate, faHistory, faProjectDiagram } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { DateDisplay } from 'components/common/DateDisplay'
import { DetailRow } from 'components/common/DetailRow'
import { RowWithCopyButton } from 'components/common/RowWithCopyButton'
import { SimpleTable } from 'components/common/SimpleTable'
import { AmountsDisplay } from 'components/orders/AmountsDisplay'
import { StatusLabel } from 'components/orders/StatusLabel'
import { TAB_QUERY_PARAM_KEY } from 'explorer/const'
import { Link } from 'react-router'
import { capitalize } from 'utils'

import { Order, OrderStatus } from 'api/operator'
import { ExplorerCategory } from 'common/analytics/types'
import { getUiOrderType } from 'utils/getUiOrderType'

import { DetailsTableTooltips } from './detailsTableTooltips'
import { Wrapper, LinkButton, WarningRow } from './styled'

import { AddressLink } from '../../common/AddressLink'
import { UnsignedOrderWarning } from '../UnsignedOrderWarning'

export type Props = {
  chainId: SupportedChainId
  order: Order
  areTradesLoading: boolean
  showFillsButton?: boolean
  children?: ReactNode
}

export function DetailsTable(props: Props): ReactNode | null {
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
              onCopy={(): void => onCopy('orderId')}
            />
          </DetailRow>
          <DetailRow label="From" tooltipText={DetailsTableTooltips.from}>
            <Wrapper>
              {isSigning && (
                <>
                  <Icon image="ALERT" color={UI.COLOR_ALERT_TEXT} />
                  &nbsp;
                </>
              )}
              <RowWithCopyButton
                textToCopy={owner}
                onCopy={(): void => onCopy('ownerAddress')}
                contentsToDisplay={
                  <span>
                    <AddressLink address={owner} chainId={chainId} />
                  </span>
                }
              />
              <LinkButton to={`/address/${owner}`}>
                <FontAwesomeIcon icon={faHistory} />
                Order history
              </LinkButton>
            </Wrapper>
          </DetailRow>
          <DetailRow label="To" tooltipText={DetailsTableTooltips.to}>
            <Wrapper>
              <RowWithCopyButton
                textToCopy={receiver}
                onCopy={(): void => onCopy('receiverAddress')}
                contentsToDisplay={
                  <span>
                    <AddressLink address={receiver} chainId={chainId} />
                  </span>
                }
              />
              <LinkButton to={`/address/${receiver}`}>
                <FontAwesomeIcon icon={faHistory} />
                Order history
              </LinkButton>
            </Wrapper>
          </DetailRow>
          {(!partiallyFillable || txHash) && (
            <DetailRow label="Transaction hash" tooltipText={DetailsTableTooltips.hash} isLoading={areTradesLoading}>
              {txHash ? (
                <Wrapper>
                  <RowWithCopyButton
                    textToCopy={txHash}
                    onCopy={(): void => onCopy('settlementTx')}
                    contentsToDisplay={
                      <Link to={getExplorerLink(chainId, txHash, ExplorerDataType.TRANSACTION)} target="_blank">
                        {txHash}↗
                      </Link>
                    }
                  />
                  <Wrapper>
                    <LinkButton to={`/tx/${txHash}`}>
                      <FontAwesomeIcon icon={faGroupArrowsRotate} />
                      Batch
                    </LinkButton>
                    <LinkButton to={`/tx/${txHash}/?${TAB_QUERY_PARAM_KEY}=graph`}>
                      <FontAwesomeIcon icon={faProjectDiagram} />
                      Graph
                    </LinkButton>
                  </Wrapper>
                </Wrapper>
              ) : null}
            </DetailRow>
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
