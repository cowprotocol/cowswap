import { ReactNode } from 'react'

import { ACCOUNT_PROXY_LABEL } from '@cowprotocol/common-const'
import { getChainInfo } from '@cowprotocol/cow-sdk'
import { useWalletInfo } from '@cowprotocol/wallet'

import { Title } from './styled'

import { useAccountProxies } from '../../hooks/useAccountProxies'
import { AccountItem } from '../../pure/AccountItem'

export function AccountProxiesPage(): ReactNode {
  const { chainId } = useWalletInfo()

  const proxies = useAccountProxies()

  const chainIfo = getChainInfo(chainId)
  const chainLabel = chainIfo?.label

  return (
    <div>
      <Title>
        Select an {ACCOUNT_PROXY_LABEL} to see the amounts available for refund {chainLabel ? `on ${chainLabel}` : ''}
      </Title>
      <div>
        {proxies?.map(({ account, version }) => {
          return <AccountItem key={account} chainId={chainId} account={account} version={version} />
        })}
      </div>
    </div>
  )
}
