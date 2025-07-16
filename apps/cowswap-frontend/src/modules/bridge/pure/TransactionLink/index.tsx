import { ReactNode } from 'react'

import ReceiptIcon from '@cowprotocol/assets/cow-swap/icon-receipt.svg'
import { getChainInfo } from '@cowprotocol/common-const'
import { useMediaQuery } from '@cowprotocol/common-hooks'
import { BridgeProviderInfo } from '@cowprotocol/cow-sdk'
import { ExternalLink, Media } from '@cowprotocol/ui'

import { useBridgeSupportedNetworks } from 'entities/bridgeProvider'

import { ConfirmDetailsItem } from 'modules/trade'

import { StyledTimelineReceiptIcon, TimelineIconCircleWrapper } from '../../styles'

function getTransactionLinkText(
  bridgeProvider: BridgeProviderInfo | undefined,
  isBridgeTransaction: boolean,
  explorerTitle: string,
  isMobile: boolean,
): string {
  return bridgeProvider || isBridgeTransaction
    ? isMobile
      ? 'Bridge explorer ↗'
      : 'View on bridge explorer ↗'
    : isMobile
      ? `${explorerTitle} ↗`
      : `View on ${explorerTitle} ↗`
}

interface TransactionLinkItemProps {
  link: string
  label: string
  chainId: number
  bridgeProvider?: BridgeProviderInfo
  isBridgeTransaction?: boolean
}

export function TransactionLinkItem({ link, label, chainId, bridgeProvider, isBridgeTransaction = false }: TransactionLinkItemProps): ReactNode {
  const { data: bridgeSupportedNetworks } = useBridgeSupportedNetworks()
  const bridgeNetwork = bridgeSupportedNetworks?.find((network) => network.id === chainId)
  const isMobile = useMediaQuery(Media.upToSmall(false))

  const explorerTitle = bridgeNetwork?.blockExplorer.name || getChainInfo(chainId)?.explorerTitle || 'Explorer'
  const linkText = getTransactionLinkText(bridgeProvider, isBridgeTransaction, explorerTitle, isMobile)

  return (
    <ConfirmDetailsItem
      label={
        <>
          <TimelineIconCircleWrapper padding="0" bgColor={'transparent'}>
            <StyledTimelineReceiptIcon src={ReceiptIcon} />
          </TimelineIconCircleWrapper>{' '}
          {label}
        </>
      }
    >
      <ExternalLink href={link}>{linkText}</ExternalLink>
    </ConfirmDetailsItem>
  )
}
