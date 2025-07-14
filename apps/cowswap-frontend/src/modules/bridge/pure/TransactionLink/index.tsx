import { ReactNode } from 'react'

import ReceiptIcon from '@cowprotocol/assets/cow-swap/icon-receipt.svg'
import { getChainInfo } from '@cowprotocol/common-const'
import { useMediaQuery } from '@cowprotocol/common-hooks'
import { ExternalLink, Media } from '@cowprotocol/ui'

import { useBridgeSupportedNetworks } from 'entities/bridgeProvider'

import { ConfirmDetailsItem } from 'modules/trade'

import { StyledTimelineReceiptIcon, TimelineIconCircleWrapper } from '../../styles'

interface TransactionLinkItemProps {
  link: string
  label: string
  chainId: number
}

export function TransactionLinkItem({ link, label, chainId }: TransactionLinkItemProps): ReactNode {
  const { data: bridgeSupportedNetworks } = useBridgeSupportedNetworks()
  const bridgeNetwork = bridgeSupportedNetworks?.find((network) => network.id === chainId)
  const isMobile = useMediaQuery(Media.upToSmall(false))

  const explorerTitle = bridgeNetwork?.blockExplorer.name || getChainInfo(chainId)?.explorerTitle || 'Explorer'

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
      <ExternalLink href={link}>{isMobile ? `${explorerTitle} ↗` : `View on ${explorerTitle} ↗`}</ExternalLink>
    </ConfirmDetailsItem>
  )
}
