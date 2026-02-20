import { ReactNode } from 'react'

import { getAddressKey } from '@cowprotocol/cow-sdk'
import { useTokensByAddressMap } from '@cowprotocol/tokens'
import { useWalletInfo } from '@cowprotocol/wallet'

import { useLingui } from '@lingui/react/macro'
import { matchPath, useLocation, useParams } from 'react-router'

import { Routes } from 'common/constants/routes'

import { NEED_HELP_LABEL } from '../../consts'

export function WidgetPageTitle(): ReactNode {
  const { t, i18n } = useLingui()
  const { account } = useWalletInfo()
  const { tokenAddress } = useParams()
  const location = useLocation()
  const tokensByAddress = useTokensByAddressMap()
  const token = tokenAddress ? tokensByAddress[getAddressKey(tokenAddress)] : null
  const isWalletConnected = !!account
  const isHelpPage = location.pathname.endsWith('/help')
  const isRecoverPage = !!tokenAddress
  const isRootProxyPage = !!matchPath(Routes.ACCOUNT_PROXIES, location.pathname)

  // Check for help page first, regardless of wallet connection
  if (isHelpPage) {
    return i18n._(NEED_HELP_LABEL)
  }

  if (isRootProxyPage) {
    return null
  }

  if (!isWalletConnected) {
    return t`Proxy Accounts`
  }

  if (isRecoverPage) {
    const target = token?.symbol ?? t`funds`
    return t`Recover ${target}`
  }

  return t`All accounts`
}
