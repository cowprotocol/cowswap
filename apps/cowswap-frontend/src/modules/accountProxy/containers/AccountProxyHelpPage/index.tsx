import { ReactNode } from 'react'

import { useWalletInfo } from '@cowprotocol/wallet'

import { useIsTwapEoaPrototypeEnabled } from 'modules/twap'

import { Routes } from 'common/constants/routes'

import { FAQContent } from '../../pure/FAQContent'
import { parameterizeRoute } from '../../utils/parameterizeRoute'

export function AccountProxyHelpPage(): ReactNode {
  const { chainId } = useWalletInfo()
  const isTwapEoaPrototypeEnabled = useIsTwapEoaPrototypeEnabled()

  return (
    <div>
      <FAQContent
        isTwapPrototypeEnabled={isTwapEoaPrototypeEnabled}
        recoverRouteLink={parameterizeRoute(Routes.ACCOUNT_PROXIES, { chainId })}
      />
    </div>
  )
}
