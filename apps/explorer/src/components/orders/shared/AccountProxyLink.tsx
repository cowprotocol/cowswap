import { ReactNode } from 'react'

import { getSwapBaseUrl } from '@cowprotocol/common-utils'
import { ExternalLink } from '@cowprotocol/ui'

export const AccountProxyLink = ({ children }: { children: ReactNode }): ReactNode => {
  return (
    <ExternalLink href={`${getSwapBaseUrl()}/#/account-proxy`} target="_blank" rel="noopener noreferrer">
      {children}
    </ExternalLink>
  )
}
