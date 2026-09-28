import React, { ReactNode } from 'react'

import { isSolanaChain, SupportedChainId } from '@cowprotocol/cow-sdk'
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
  tooltipText?: string
  onCopy(label: string): void
}

export function FromItem({
  chainId,
  isSigning,
  isBridgingOrder,
  onCopy,
  owner,
  tooltipText,
}: FromItemProps): ReactNode {
  return (
    <DetailRow label="From" tooltipText={tooltipText ?? DetailsTableTooltips.from}>
      {isSigning && (
        <>
          <Icon image="ALERT" color={UI.COLOR_ALERT_TEXT} />
          &nbsp;
        </>
      )}
      <RowWithCopyButton
        textToCopy={owner}
        onCopy={() => onCopy('ownerAddress')}
        contentsToDisplay={<AddressLink address={owner} chainId={chainId} showIcon showNetworkName={isBridgingOrder} />}
      />
      {/* TODO: enable once the explorer user page supports Solana */}
      {!isSolanaChain(chainId) && (
        <Wrapper>
          <LinkButton to={`/address/${owner}`}>
            <FontAwesomeIcon icon={faHistory} />
            Order history
          </LinkButton>
        </Wrapper>
      )}
    </DetailRow>
  )
}
