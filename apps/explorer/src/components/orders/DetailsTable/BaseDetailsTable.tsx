import React from 'react'

import { useCowAnalytics } from '@cowprotocol/analytics'
import { SupportedChainId } from '@cowprotocol/cow-sdk'
import { BridgeProviderType } from '@cowprotocol/sdk-bridging'
import { Icon, UI } from '@cowprotocol/ui'
import { TruncatedText } from '@cowprotocol/ui/pure/TruncatedText'

import { faHistory } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { AddressLink } from 'components/common/AddressLink'
import { DateDisplay } from 'components/common/DateDisplay'
import { RowWithCopyButton } from 'components/common/RowWithCopyButton'
import { SimpleTable } from 'components/common/SimpleTable'
import Spinner from 'components/common/Spinner'
import { AmountsDisplay } from 'components/orders/AmountsDisplay'
import { StatusLabel } from 'components/orders/StatusLabel'
import { HelpTooltip } from 'components/Tooltip'
import { capitalize } from 'utils'

import { Order } from 'api/operator'
import { ExplorerCategory } from 'common/analytics/types'
import { getUiOrderType } from 'utils/getUiOrderType'

import { DetailsTableTooltips } from './detailsTableTooltips'
import { TxHashItem } from './items/TxHashItem'
import { LinkButton, WarningRow, Wrapper } from './styled'

import { UnsignedOrderWarning } from '../UnsignedOrderWarning'

export interface BaseDetailsTableProps {
  chainId: SupportedChainId
  order: Order
  showFillsButton: boolean | undefined
  areTradesLoading: boolean
  bridgeProviderType?: BridgeProviderType
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
  bridgeProviderType,
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
  const isBridging = !!order?.bridgeProviderId
  const toTooltip = isBridging
    ? bridgeProviderType === 'ReceiverAccountBridgeProvider'
      ? DetailsTableTooltips.toBridgeReceiver
      : DetailsTableTooltips.toBridgeProxy
    : DetailsTableTooltips.to

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
                  contentsToDisplay={<AddressLink address={owner} chainId={chainId} showNetworkName />}
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
                <HelpTooltip placement="bottom" tooltip={toTooltip} /> To
              </span>
            </td>
            <td>
              <Wrapper>
                <RowWithCopyButton
                  textToCopy={receiver}
                  onCopy={(): void => onCopy('receiverAddress')}
                  contentsToDisplay={<AddressLink address={receiver} chainId={chainId} showNetworkName />}
                />
                <LinkButton to={`/address/${receiver}`}>
                  <FontAwesomeIcon icon={faHistory} />
                  Order history
                </LinkButton>
              </Wrapper>
            </td>
          </tr>
          {(!partiallyFillable || txHash) && areTradesLoading ? (
            <Spinner />
          ) : (
            <TxHashItem chainId={chainId} txHash={txHash} onCopy={onCopy} isLoading={areTradesLoading} />
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
