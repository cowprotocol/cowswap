import { ReactNode } from 'react'

import { useTokensByAddressMap } from '@cowprotocol/tokens'
import { useWalletInfo } from '@cowprotocol/wallet'

import { useLocation, useParams } from 'react-router'

export function WidgetPageTitle(): ReactNode {
  const { account } = useWalletInfo()
  const { tokenAddress } = useParams()
  const location = useLocation()
  const tokensByAddress = useTokensByAddressMap()
  const token = tokenAddress ? tokensByAddress[tokenAddress.toLowerCase()] : null

  const isWalletConnected = !!account
  const isHelpPage = location.pathname.endsWith('/help')
  const isRecoverPage = !!tokenAddress

  if (!isWalletConnected) {
    return 'Proxy Accounts'
  }

  if (isRecoverPage) {
    return `Recover ${token?.symbol ?? 'funds'}`
  }

  if (isHelpPage) {
    return 'Need help'
  }

  return 'Recover funds'
}
