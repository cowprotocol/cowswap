import { ReactNode } from 'react'

import { SupportedChainId } from '@cowprotocol/cow-sdk'
import { TruncatedText } from '@cowprotocol/ui'

import { faGroupArrowsRotate, faPlus } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { bungeeBridgeProvider } from 'sdk/cowSdk'

import { Order, ORDER_FINAL_FAILED_STATUSES } from 'api/operator'
import { getCowSwapOrderUrl } from 'utils/getCowSwapOrderUrl'
import { getSocketApiUrl, getSocketUrl } from 'utils/socket'

import { DetailRow } from '../../../common/DetailRow'
import { RowWithCopyButton } from '../../../common/RowWithCopyButton'
import { DetailsTableTooltips } from '../detailsTableTooltips'
import { Wrapper, ExternalLinkButton } from '../styled'

interface OrderIdItemProps {
  chainId: SupportedChainId
  order: Order
  onCopy(label: string): void
  bridgeProviderId?: string
}

export function OrderIdItem({ chainId, order, onCopy, bridgeProviderId }: OrderIdItemProps): ReactNode {
  const orderId = order.uid

  if (!orderId) return null

  const socketUrl = getSocketUrl(orderId)
  const socketApiUrl = getSocketApiUrl(orderId)
  const cowSwapOrderUrl = getCowSwapOrderUrl(chainId, order)
  const isOrderInFinalFailedStatus = ORDER_FINAL_FAILED_STATUSES.includes(order.status)
  const showBungeeBridgeLinks = bridgeProviderId === bungeeBridgeProvider.info.dappId && !isOrderInFinalFailedStatus

  return (
    <DetailRow label="Order Id" tooltipText={DetailsTableTooltips.orderID}>
      <RowWithCopyButton
        textToCopy={orderId}
        onCopy={() => onCopy('orderId')}
        contentsToDisplay={<TruncatedText>{orderId}</TruncatedText>}
      />
      <Wrapper>
        {cowSwapOrderUrl && (
          <ExternalLinkButton href={cowSwapOrderUrl} target="_blank" rel="noopener noreferrer">
            <FontAwesomeIcon icon={faPlus} />
            New order↗
          </ExternalLinkButton>
        )}
        {showBungeeBridgeLinks && (
          <>
            <ExternalLinkButton href={socketUrl} target="_blank" rel="noopener noreferrer">
              <FontAwesomeIcon icon={faGroupArrowsRotate} />
              SocketScan↗
            </ExternalLinkButton>
            <ExternalLinkButton href={socketApiUrl} target="_blank" rel="noopener noreferrer">
              <FontAwesomeIcon icon={faGroupArrowsRotate} />
              Socket API↗
            </ExternalLinkButton>
          </>
        )}
      </Wrapper>
    </DetailRow>
  )
}
