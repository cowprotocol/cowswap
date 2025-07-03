import React, { ReactNode } from 'react'

import { SupportedChainId } from '@cowprotocol/cow-sdk'
import { Icon, UI } from '@cowprotocol/ui'

import { faHistory } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'

import { AddressLink } from '../../../common/AddressLink'
import { DetailRow } from '../../../common/DetailRow'
import { RowWithCopyButton } from '../../../common/RowWithCopyButton'
import { DetailsTableTooltips } from '../detailsTableTooltips'
import { LinkButton, Wrapper } from '../styled'

interface FromItemProps {
  chainId: SupportedChainId
  isSigning: boolean
  isBridgingOrder: boolean
  owner: string
  onCopy(label: string): void
}

export function FromItem({ chainId, isSigning, isBridgingOrder, onCopy, owner }: FromItemProps): ReactNode {
  return (
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
          onCopy={() => onCopy('ownerAddress')}
          contentsToDisplay={
            <span>
              <AddressLink address={owner} chainId={chainId} showNetworkName={isBridgingOrder} />
            </span>
          }
        />
        <LinkButton to={`/address/${owner}`}>
          <FontAwesomeIcon icon={faHistory} />
          Order history
        </LinkButton>
      </Wrapper>
    </DetailRow>
  )
}
