import { ReactNode } from 'react'

import { useTokensByAddressMap } from '@cowprotocol/tokens'
import { useWalletInfo } from '@cowprotocol/wallet'

import { useLocation, useParams } from 'react-router'

import { NEED_HELP_LABEL } from '../../consts'

export function WidgetPageTitle(): ReactNode {
  const { account } = useWalletInfo()
  const { tokenAddress } = useParams()
  const location = useLocation()
  const tokensByAddress = useTokensByAddressMap()
  const token = tokenAddress ? tokensByAddress[tokenAddress.toLowerCase()] : null

  const isWalletConnected = !!account
  const isHelpPage = location.pathname.endsWith('/help')
  const isRecoverPage = !!tokenAddress

  // Check for help page first, regardless of wallet connection
  if (isHelpPage) {
    return NEED_HELP_LABEL
  }

  if (!isWalletConnected) {
    return 'Proxy Accounts'
  }

  if (isRecoverPage) {
    return `Recover ${token?.symbol ?? 'funds'}`
  }

  return 'Recover funds'
}
