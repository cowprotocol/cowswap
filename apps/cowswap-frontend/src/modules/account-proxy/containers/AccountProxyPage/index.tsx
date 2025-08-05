import { ReactNode } from 'react'

import { useWalletInfo } from '@cowprotocol/wallet'

import { useParams } from 'react-router'

import { AccountCard } from '../../pure/AccountCard'

export function AccountProxyPage(): ReactNode {
  const { chainId } = useWalletInfo()
  const { proxyAddress } = useParams()

  if (!proxyAddress) return null

  return (
    <div>
      <AccountCard chainId={chainId} account={proxyAddress} />
    </div>
  )
}
