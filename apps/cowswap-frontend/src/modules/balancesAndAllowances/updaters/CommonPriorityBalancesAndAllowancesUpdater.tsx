import { ReactNode } from 'react'

import { BalancesAndAllowancesUpdater } from '@cowprotocol/balances-and-allowances'
import { useWalletInfo } from '@cowprotocol/wallet'

import { useSourceChainId } from 'modules/tokensList'
import { usePriorityTokenAddresses } from 'modules/trade'

export function CommonPriorityBalancesAndAllowancesUpdater(): ReactNode {
  const sourceChainId = useSourceChainId()
  const { account } = useWalletInfo()
  const excludedTokens = usePriorityTokenAddresses()

  return <BalancesAndAllowancesUpdater account={account} chainId={sourceChainId} excludedTokens={excludedTokens}/>
}
