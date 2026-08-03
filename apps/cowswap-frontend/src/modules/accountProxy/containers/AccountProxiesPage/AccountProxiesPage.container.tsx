import { ReactNode } from 'react'

import { ACCOUNT_PROXY_LABEL } from '@cowprotocol/common-const'
import { getChainInfo } from '@cowprotocol/cow-sdk'
import { useWalletInfo } from '@cowprotocol/wallet'

import { t } from '@lingui/core/macro'
import { Trans, useLingui } from '@lingui/react/macro'

import * as styledEl from './AccountProxiesPage.styled'

import { useAccountProxies } from '../../hooks/useAccountProxies'
import { AccountItem } from '../../pure/AccountItem/AccountItem.pure'

export function AccountProxiesPage(): ReactNode {
  const { chainId } = useWalletInfo()
  const { i18n } = useLingui()
  const proxies = useAccountProxies()

  const chainIfo = getChainInfo(chainId)
  const chainLabel = chainIfo?.label
  const chain = chainLabel ? t`on ${chainLabel}` : ''
  const accountProxyLabelString = i18n._(ACCOUNT_PROXY_LABEL)

  return (
    <styledEl.Wrapper>
      <styledEl.Title>
        <Trans>
          Select an {accountProxyLabelString} to check for available refunds {chain}
        </Trans>
      </styledEl.Title>

      {proxies?.map(({ account, version, label }) => {
        return <AccountItem key={account} chainId={chainId} account={account} version={version} label={label} />
      })}
    </styledEl.Wrapper>
  )
}
