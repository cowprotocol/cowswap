import { ReactNode, useMemo } from 'react'

import { CowShedHooks, COW_SHED_1_0_0_VERSION, COW_SHED_LATEST_VERSION, CoWShedVersion } from '@cowprotocol/cow-sdk'
import { useWalletInfo } from '@cowprotocol/wallet'

import { Title } from './styled'

import { AccountItem } from '../../pure/AccountItem'

const versions: CoWShedVersion[] = [COW_SHED_LATEST_VERSION, COW_SHED_1_0_0_VERSION]

export function AccountProxiesPage(): ReactNode {
  const { chainId, account } = useWalletInfo()

  const proxies = useMemo(() => {
    if (!account) return null

    return versions.map((version) => {
      const sdk = new CowShedHooks(chainId, undefined, version)

      return { account: sdk.proxyOf(account), version }
    })
  }, [chainId, account])

  return (
    <div>
      <Title>Select a proxy account to see the amounts available for refund</Title>
      <div>
        {proxies?.map(({ account, version }) => {
          return <AccountItem key={account} chainId={chainId} account={account} version={version} />
        })}
      </div>
    </div>
  )
}
