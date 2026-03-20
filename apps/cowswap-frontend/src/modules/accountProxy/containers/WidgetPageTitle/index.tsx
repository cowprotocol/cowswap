import { ReactNode } from 'react'

import { getAddressKey } from '@cowprotocol/cow-sdk'
import { useTokensByAddressMap } from '@cowprotocol/tokens'
import { useWalletInfo } from '@cowprotocol/wallet'

import { useLingui } from '@lingui/react/macro'
import { useLocation, useParams } from 'react-router'

import { NEED_HELP_LABEL } from '../../consts'
import { AccountProxyKind, useAccountProxies } from '../../hooks/useAccountProxies'

export function WidgetPageTitle(): ReactNode {
  const { t, i18n } = useLingui()
  const { account } = useWalletInfo()
  const { proxyAddress, tokenAddress } = useParams()
  const location = useLocation()
  const proxies = useAccountProxies()
  const tokensByAddress = useTokensByAddressMap()
  const token = tokenAddress ? tokensByAddress[getAddressKey(tokenAddress)] : null
  const isWalletConnected = !!account
  const isHelpPage = location.pathname.endsWith('/help')
  const isRecoverPage = !!tokenAddress
  const selectedProxy = proxies?.find((proxy) => proxy.account.toLowerCase() === proxyAddress?.toLowerCase())
  const isTwapPrototypeProxy = selectedProxy?.kind === AccountProxyKind.TwapPrototype

  // Check for help page first, regardless of wallet connection
  if (isHelpPage) {
    return i18n._(NEED_HELP_LABEL)
  }

  if (!isWalletConnected) {
    return t`Proxy Accounts`
  }

  if (isTwapPrototypeProxy) {
    return isRecoverPage ? t`Withdraw TWAP funds` : t`TWAP proxy account`
  }

  if (isRecoverPage) {
    const target = token?.symbol ?? t`funds`
    return t`Recover ${target}`
  }

  return t`Recover funds`
}
