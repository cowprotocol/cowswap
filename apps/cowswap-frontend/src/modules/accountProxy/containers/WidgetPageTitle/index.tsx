import { ReactNode } from 'react'

import { getTokenAddressKey } from '@cowprotocol/common-utils'
import { useTokensByAddressMap } from '@cowprotocol/tokens'
import { useWalletInfo } from '@cowprotocol/wallet'

import { useLingui } from '@lingui/react/macro'
import { useLocation, useParams } from 'react-router'

import { NEED_HELP_LABEL } from '../../consts'

export function WidgetPageTitle(): ReactNode {
  const { t, i18n } = useLingui()
  const { account } = useWalletInfo()
  const { tokenAddress } = useParams()
  const location = useLocation()
  const tokensByAddress = useTokensByAddressMap()
  const token = tokenAddress ? tokensByAddress[getTokenAddressKey(tokenAddress)] : null
  const isWalletConnected = !!account
  const isHelpPage = location.pathname.endsWith('/help')
  const isRecoverPage = !!tokenAddress

  // Check for help page first, regardless of wallet connection
  if (isHelpPage) {
    return i18n._(NEED_HELP_LABEL)
  }

  if (!isWalletConnected) {
    return t`Proxy Accounts`
  }

  if (isRecoverPage) {
    const target = token?.symbol ?? t`funds`
    return t`Recover ${target}`
  }

  return t`Recover funds`
}
