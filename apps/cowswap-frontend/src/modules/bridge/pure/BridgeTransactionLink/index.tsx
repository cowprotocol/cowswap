import { ReactNode } from 'react'

import { useMediaQuery } from '@cowprotocol/common-hooks'
import { Media } from '@cowprotocol/ui'

import { useLingui } from '@lingui/react/macro'

import { TransactionLinkDisplay } from '../TransactionLink/TransactionLinkDisplay'

interface BridgeTransactionLinkProps {
  link: string
  label: string
}

export function BridgeTransactionLink({ link, label }: BridgeTransactionLinkProps): ReactNode {
  const isMobile = useMediaQuery(Media.upToSmall(false))
  const { t } = useLingui()

  const getBridgeTransactionLinkText = (isMobile: boolean): string => {
    return (isMobile ? t`Bridge explorer` : t`View on bridge explorer`) + `  ↗`
  }

  return <TransactionLinkDisplay link={link} label={label} linkText={getBridgeTransactionLinkText(isMobile)} />
}
