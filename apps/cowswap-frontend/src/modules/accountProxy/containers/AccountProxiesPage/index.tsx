import { ReactNode } from 'react'

import { ACCOUNT_PROXY_LABEL } from '@cowprotocol/common-const'
import { useWalletInfo } from '@cowprotocol/wallet'

import { Title, Wrapper } from './styled'

import { useAccountProxies } from '../../hooks/useAccountProxies'
import { AccountItem } from '../../pure/AccountItem'

export function AccountProxiesPage(): ReactNode {
  const { chainId } = useWalletInfo()

  const proxies = useAccountProxies()

  return (
    <Wrapper>
      <Title>Select an {ACCOUNT_PROXY_LABEL} to check for available refunds</Title>

      {proxies?.map(({ account, version }) => {
        return <AccountItem key={account} chainId={chainId} account={account} version={version} />
      })}
    </Wrapper>
  )
}
