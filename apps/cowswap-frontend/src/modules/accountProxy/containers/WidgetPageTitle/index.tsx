import { ReactNode } from 'react'

import { useTokensByAddressMap } from '@cowprotocol/tokens'
import { useWalletInfo } from '@cowprotocol/wallet'

import { t } from '@lingui/core/macro'
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
    return t`Proxy Accounts`
  }

  if (isRecoverPage) {
    const target = token?.symbol ?? t`funds`
    return t`Recover ${target}`
  }

  if (isHelpPage) {
    return t`Need help`
  }

  return t`Recover funds`
}
