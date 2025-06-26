import React from 'react'

import { useCowAnalytics } from '@cowprotocol/analytics'
import { ExplorerDataType, getExplorerLink } from '@cowprotocol/common-utils'
import { SupportedChainId } from '@cowprotocol/cow-sdk'
import { Icon, UI } from '@cowprotocol/ui'
import { TruncatedText } from '@cowprotocol/ui/pure/TruncatedText'

import { faGroupArrowsRotate, faHistory, faProjectDiagram } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { DateDisplay } from 'components/common/DateDisplay'
import { RowWithCopyButton } from 'components/common/RowWithCopyButton'
import { SimpleTable } from 'components/common/SimpleTable'
import Spinner from 'components/common/Spinner'
import { AmountsDisplay } from 'components/orders/AmountsDisplay'
import { StatusLabel } from 'components/orders/StatusLabel'
import { HelpTooltip } from 'components/Tooltip'
import { TAB_QUERY_PARAM_KEY } from 'explorer/const'
import { Link } from 'react-router'
import { capitalize } from 'utils'

import { Order } from 'api/operator'
import { ExplorerCategory } from 'common/analytics/types'
import { getUiOrderType } from 'utils/getUiOrderType'

import { DetailsTableTooltips } from './detailsTableTooltips'
import { LinkButton, Wrapper, WarningRow } from './styled'

import { UnsignedOrderWarning } from '../UnsignedOrderWarning'

export interface BaseDetailsTableProps {
  chainId: SupportedChainId
  order: Order
  showFillsButton: boolean | undefined
  areTradesLoading: boolean
  children?: React.ReactNode
}

// Foundation component with core order information that every order detail view needs
// TODO: Break down this large function into smaller functions
// TODO: Reduce function complexity by extracting logic
// eslint-disable-next-line max-lines-per-function
export function BaseDetailsTable({
  chainId,
  order,
  showFillsButton,
  areTradesLoading,
  children,
}: BaseDetailsTableProps): React.ReactNode | null {
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
    expirationDate,
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
  const isSigning = status === 'signing'

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
          <tr>
            <td>
              <span>
                <HelpTooltip tooltip={DetailsTableTooltips.orderID} /> Order Id
              </span>
            </td>
            <td>
              <RowWithCopyButton
                textToCopy={uid}
                contentsToDisplay={<TruncatedText>{uid}</TruncatedText>}
                onCopy={(): void => onCopy('orderId')}
              />
            </td>
          </tr>
          <tr>
            <td>
              <span>
                <HelpTooltip tooltip={DetailsTableTooltips.from} /> From
              </span>
            </td>
            <td>
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
                    <Link to={getExplorerLink(chainId, owner, ExplorerDataType.ADDRESS)} target="_blank">
                      {owner}↗
                    </Link>
                  }
                />
                <LinkButton to={`/address/${owner}`}>
                  <FontAwesomeIcon icon={faHistory} />
                  Order history
                </LinkButton>
              </Wrapper>
            </td>
          </tr>
          <tr>
            <td>
              <span>
                <HelpTooltip tooltip={DetailsTableTooltips.to} /> To
              </span>
            </td>
            <td>
              <Wrapper>
                <RowWithCopyButton
                  textToCopy={receiver}
                  onCopy={(): void => onCopy('receiverAddress')}
                  contentsToDisplay={
                    <Link to={getExplorerLink(chainId, receiver, ExplorerDataType.ADDRESS)} target="_blank">
                      {receiver}↗
                    </Link>
                  }
                />
                <LinkButton to={`/address/${receiver}`}>
                  <FontAwesomeIcon icon={faHistory} />
                  Order history
                </LinkButton>
              </Wrapper>
            </td>
          </tr>
          {(!partiallyFillable || txHash) && (
            <tr>
              <td>
                <span>
                  <HelpTooltip tooltip={DetailsTableTooltips.hash} /> Transaction hash
                </span>
              </td>
              <td>
                {areTradesLoading ? (
                  <Spinner />
                ) : txHash ? (
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
                ) : (
                  '-'
                )}
              </td>
            </tr>
          )}
          <tr>
            <td>
              <span>
                <HelpTooltip tooltip={DetailsTableTooltips.status} /> Status
              </span>
            </td>
            <td>
              <StatusLabel status={status} partiallyFilled={partiallyFilled} partialTagPosition="right" />
            </td>
          </tr>
          <tr>
            <td>
              <span>
                <HelpTooltip tooltip={DetailsTableTooltips.submission} /> Submission Time
              </span>
            </td>
            <td>
              <DateDisplay date={creationDate} showIcon={true} />
            </td>
          </tr>
          {executionDate && !showFillsButton && (
            <tr>
              <td>
                <span>
                  <HelpTooltip tooltip={DetailsTableTooltips.execution} /> Execution Time
                </span>
              </td>
              <td>
                <DateDisplay date={executionDate} showIcon={true} />
              </td>
            </tr>
          )}
          <tr>
            <td>
              <span>
                <HelpTooltip tooltip={DetailsTableTooltips.expiration} /> Expiration Time
              </span>
            </td>
            <td>
              <DateDisplay date={expirationDate} showIcon={true} />
            </td>
          </tr>
          <tr>
            <td>
              <span>
                <HelpTooltip tooltip={DetailsTableTooltips.type} /> Type
              </span>
            </td>
            <td>
              {capitalize(kind)} {getUiOrderType(order).toLowerCase()} order{' '}
              {partiallyFillable ? '(Partially fillable)' : '(Fill or Kill)'}
            </td>
          </tr>
          <tr>
            <td>
              <span>
                <HelpTooltip tooltip={DetailsTableTooltips.amount} /> Amount
              </span>
            </td>
            <td>
              <AmountsDisplay order={order} />
            </td>
          </tr>
          {children}
        </>
      }
    />
  )
}
