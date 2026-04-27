import { ReactNode } from 'react'

import { SupportedChainId } from '@cowprotocol/cow-sdk'
import { TruncatedText } from '@cowprotocol/ui'

import { faGroupArrowsRotate, faPlus } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { bungeeBridgeProvider } from 'sdk/cowSdk'

import { Order } from 'api/operator'
import { getCowSwapDuplicateOrderUrl } from 'utils/getCowSwapDuplicateOrderUrl'
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
  const duplicateOnCowSwapHref = getCowSwapDuplicateOrderUrl(chainId, order)

  return (
    <DetailRow label="Order Id" tooltipText={DetailsTableTooltips.orderID}>
      <RowWithCopyButton
        textToCopy={orderId}
        onCopy={() => onCopy('orderId')}
        contentsToDisplay={<TruncatedText>{orderId}</TruncatedText>}
      />
      <Wrapper>
        {duplicateOnCowSwapHref && (
          <ExternalLinkButton href={duplicateOnCowSwapHref} target="_blank" rel="noopener noreferrer">
            <FontAwesomeIcon icon={faPlus} />
            New order↗
          </ExternalLinkButton>
        )}
        {bridgeProviderId === bungeeBridgeProvider.info.dappId && (
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
