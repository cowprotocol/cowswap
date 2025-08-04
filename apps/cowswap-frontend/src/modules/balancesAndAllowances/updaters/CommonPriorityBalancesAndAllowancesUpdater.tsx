import { ReactNode, useMemo } from 'react'

import { BalancesAndAllowancesUpdater, PriorityTokensUpdater } from '@cowprotocol/balances-and-allowances'
import { useWalletInfo } from '@cowprotocol/wallet'

import { useBalancesContext } from 'entities/balancesContext/useBalancesContext'

import { useSourceChainId } from 'modules/tokensList'
import { usePriorityTokenAddresses } from 'modules/trade'

export function CommonPriorityBalancesAndAllowancesUpdater(): ReactNode {
  const sourceChainId = useSourceChainId().chainId
  const { account } = useWalletInfo()
  const balancesContext = useBalancesContext()
  const balancesAccount = balancesContext.account || account
  const excludedTokens = usePriorityTokenAddresses()

  const priorityTokenAddresses = usePriorityTokenAddresses()
  const priorityTokenAddressesAsArray = useMemo(() => {
    return Array.from(priorityTokenAddresses.values())
  }, [priorityTokenAddresses])

  return (
    <>
      <PriorityTokensUpdater
        account={balancesAccount}
        chainId={sourceChainId}
        tokenAddresses={priorityTokenAddressesAsArray}
      />
      <BalancesAndAllowancesUpdater account={balancesAccount} chainId={sourceChainId} excludedTokens={excludedTokens} />
    </>
  )
}
