import { ReactNode } from 'react'

import { useWalletInfo } from '@cowprotocol/wallet'

import { Routes } from 'common/constants/routes'

import { FAQContent } from '../../pure/FAQContent/FAQContent.pure'
import { parameterizeRoute } from '../../utils/parameterizeRoute'

export function AccountProxyHelpPage(): ReactNode {
  const { chainId } = useWalletInfo()

  return (
    <div>
      <FAQContent recoverRouteLink={parameterizeRoute(Routes.ACCOUNT_PROXIES, { chainId })} />
    </div>
  )
}
