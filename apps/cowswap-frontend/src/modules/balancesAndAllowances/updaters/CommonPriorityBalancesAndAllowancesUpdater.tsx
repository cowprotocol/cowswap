import { ReactNode } from 'react'

import { BalancesAndAllowancesUpdater } from '@cowprotocol/balances-and-allowances'
import { useWalletInfo } from '@cowprotocol/wallet'

import { useSourceChainId } from 'modules/tokensList'
import { usePriorityTokenAddresses } from 'modules/trade'

import { useBalancesContext } from '../../../entities/balancesContext/useBalancesContext'

export function CommonPriorityBalancesAndAllowancesUpdater(): ReactNode {
  const sourceChainId = useSourceChainId()
  const { account } = useWalletInfo()
  const balancesContext = useBalancesContext()
  const balancesAccount = balancesContext.account || account
  const excludedTokens = usePriorityTokenAddresses()

  return <BalancesAndAllowancesUpdater account={balancesAccount} chainId={sourceChainId} excludedTokens={excludedTokens}/>
}
