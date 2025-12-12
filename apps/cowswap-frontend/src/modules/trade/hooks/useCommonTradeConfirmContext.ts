import { useMemo } from 'react'

import { useIsSmartContractWallet, useWalletDetails, useWalletInfo } from '@cowprotocol/wallet'

import { AppDataInfo, useAppData } from 'modules/appData'

export interface CommonTradeConfirmContext {
  account: string | undefined
  ensName: string | undefined
  appData: AppDataInfo | null
  isSmartContractWallet: boolean | undefined
}

export function useCommonTradeConfirmContext(): CommonTradeConfirmContext {
  const { account } = useWalletInfo()
  const { ensName } = useWalletDetails()
  const isSmartContractWallet = useIsSmartContractWallet()
  const appData = useAppData()

  return useMemo(() => {
    return { account, ensName, isSmartContractWallet, appData }
  }, [account, ensName, isSmartContractWallet, appData])
}
