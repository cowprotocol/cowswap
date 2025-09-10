import { ReactNode } from 'react'

import { ACCOUNT_PROXY_LABEL } from '@cowprotocol/common-const'
import { getChainInfo } from '@cowprotocol/cow-sdk'
import { useWalletInfo } from '@cowprotocol/wallet'

import { t } from '@lingui/core/macro'
import { Trans } from '@lingui/react/macro'

import { Title, Wrapper } from './styled'

import { useAccountProxies } from '../../hooks/useAccountProxies'
import { AccountItem } from '../../pure/AccountItem'

export function AccountProxiesPage(): ReactNode {
  const { chainId } = useWalletInfo()

  const proxies = useAccountProxies()

  const chainIfo = getChainInfo(chainId)
  const chainLabel = chainIfo?.label
  const chain = chainLabel ? t`on ${chainLabel}` : ''

  return (
    <Wrapper>
      <Title>
        <Trans>
          Select an {ACCOUNT_PROXY_LABEL} to check for available refunds {chain}
        </Trans>
      </Title>

      {proxies?.map(({ account, version }) => {
        return <AccountItem key={account} chainId={chainId} account={account} version={version} />
      })}
    </Wrapper>
  )
}
