import React, { ReactNode } from 'react'

import { SupportedChainId } from '@cowprotocol/cow-sdk'

import { faHistory } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'

import { AddressLink } from '../../../common/AddressLink'
import { DetailRow } from '../../../common/DetailRow'
import { RowWithCopyButton } from '../../../common/RowWithCopyButton'
import { DetailsTableTooltips } from '../detailsTableTooltips'
import { LinkButton, Wrapper } from '../styled'

interface ToItemProps {
  chainId: SupportedChainId
  receiver: string
  isBridgingOrder: boolean
  onCopy(label: string): void
}

export function ToItem({ receiver, isBridgingOrder, onCopy, chainId }: ToItemProps): ReactNode {
  return (
    <DetailRow label="To" tooltipText={DetailsTableTooltips.to}>
      <Wrapper>
        <RowWithCopyButton
          textToCopy={receiver}
          onCopy={() => onCopy('receiverAddress')}
          contentsToDisplay={
            <span>
              <AddressLink address={receiver} chainId={chainId} showNetworkName={isBridgingOrder} />
            </span>
          }
        />
        <LinkButton to={`/address/${receiver}`}>
          <FontAwesomeIcon icon={faHistory} />
          Order history
        </LinkButton>
      </Wrapper>
    </DetailRow>
  )
}
