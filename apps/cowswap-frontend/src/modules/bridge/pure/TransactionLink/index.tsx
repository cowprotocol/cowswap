import { ReactNode } from 'react'

import { getChainInfo } from '@cowprotocol/common-const'
import { useMediaQuery } from '@cowprotocol/common-hooks'
import { Media } from '@cowprotocol/ui'

import { useBridgeSupportedNetwork } from 'entities/bridgeProvider'

import { TransactionLinkDisplay } from './TransactionLinkDisplay'

function getChainTransactionLinkText(explorerTitle: string, isMobile: boolean): string {
  return isMobile ? `${explorerTitle} ↗` : `View on ${explorerTitle} ↗`
}

interface TransactionLinkItemProps {
  link: string
  label: string
  chainId: number
}

export function TransactionLinkItem({ link, label, chainId }: TransactionLinkItemProps): ReactNode {
  const bridgeNetwork = useBridgeSupportedNetwork(chainId)
  const isMobile = useMediaQuery(Media.upToSmall(false))

  const explorerTitle = bridgeNetwork?.blockExplorer.name || getChainInfo(chainId)?.explorerTitle || 'Explorer'
  const linkText = getChainTransactionLinkText(explorerTitle, isMobile)

  return <TransactionLinkDisplay link={link} label={label} linkText={linkText} />
}
