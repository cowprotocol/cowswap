import { ReactNode } from 'react'

import { useMediaQuery } from '@cowprotocol/common-hooks'
import { Media } from '@cowprotocol/ui'

import { TransactionLinkDisplay } from '../TransactionLink/TransactionLinkDisplay'

function getBridgeTransactionLinkText(isMobile: boolean): string {
  return isMobile ? 'Bridge explorer ↗' : 'View on bridge explorer ↗'
}

interface BridgeTransactionLinkProps {
  link: string
  label: string
}

export function BridgeTransactionLink({ link, label }: BridgeTransactionLinkProps): ReactNode {
  const isMobile = useMediaQuery(Media.upToSmall(false))
  const linkText = getBridgeTransactionLinkText(isMobile)

  return <TransactionLinkDisplay link={link} label={label} linkText={linkText} />
}