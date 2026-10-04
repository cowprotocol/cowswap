import React, { ReactNode } from 'react'

import { isSolanaChain, SupportedChainId } from '@cowprotocol/cow-sdk'

import { faHistory } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'

import { useSolanaTokenAccountOwner } from '../../../../hooks/solana/useSolanaTokenAccountOwner'
import { AddressLink } from '../../../common/AddressLink'
import { DetailRow } from '../../../common/DetailRow'
import { RowWithCopyButton } from '../../../common/RowWithCopyButton'
import { DetailsTableTooltips } from '../detailsTableTooltips'
import { LinkButton, Wrapper } from '../styled'

interface ToItemProps {
  chainId: SupportedChainId
  receiver: string
  isBridgingOrder: boolean
  bridgeProviderType
  onCopy(label: string): void
  /** Solana only, where the receiver is a token account whose owner these two can recover. */
  orderOwner?: string
  buyTokenAddress?: string
}

export function ToItem({
  receiver,
  isBridgingOrder,
  bridgeProviderType,
  onCopy,
  chainId,
  orderOwner,
  buyTokenAddress,
}: ToItemProps): ReactNode {
  const isSolana = isSolanaChain(chainId)
  const { owner: tokenAccountOwner, isLoading } = useSolanaTokenAccountOwner({
    tokenAccount: isSolana ? receiver : undefined,
    orderOwner,
    buyMint: buyTokenAddress,
  })

  const recipient = tokenAccountOwner ?? receiver
  // Orders are keyed by owner, so a token account's history page would always come back empty.
  const showOrderHistory = !isSolana || !!tokenAccountOwner
  const toTooltip = getToTooltip(isBridgingOrder, bridgeProviderType, isSolana, !!tokenAccountOwner)

  return (
    <>
      <DetailRow label="To" tooltipText={toTooltip} isLoading={isLoading}>
        <RowWithCopyButton
          textToCopy={recipient}
          onCopy={() => onCopy('receiverAddress')}
          contentsToDisplay={
            <AddressLink address={recipient} chainId={chainId} showIcon showNetworkName={isBridgingOrder} />
          }
        />
        {showOrderHistory && (
          <Wrapper>
            <LinkButton to={`/address/${recipient}`}>
              <FontAwesomeIcon icon={faHistory} />
              Order history
            </LinkButton>
          </Wrapper>
        )}
      </DetailRow>
      {tokenAccountOwner && (
        <DetailRow label="Token account" tooltipText={DetailsTableTooltips.solanaTokenAccount}>
          <RowWithCopyButton
            textToCopy={receiver}
            onCopy={() => onCopy('buyTokenAccount')}
            contentsToDisplay={<AddressLink address={receiver} chainId={chainId} showIcon showNetworkName={false} />}
          />
        </DetailRow>
      )}
    </>
  )
}

function getToTooltip(
  isBridgingOrder: boolean,
  bridgeProviderType: ToItemProps['bridgeProviderType'],
  isSolana: boolean,
  hasTokenAccountOwner: boolean,
): ReactNode {
  if (isBridgingOrder) {
    return bridgeProviderType === 'ReceiverAccountBridgeProvider'
      ? DetailsTableTooltips.toBridgeReceiver
      : DetailsTableTooltips.toBridgeProxy
  }

  if (!isSolana) return DetailsTableTooltips.to

  return hasTokenAccountOwner ? DetailsTableTooltips.toSolanaOwner : DetailsTableTooltips.toSolana
}
