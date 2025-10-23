import { useMemo } from 'react'

import { useIsSmartContractWallet, useWalletDetails, useWalletInfo } from '@cowprotocol/wallet'

import { AppDataInfo, useAppData } from 'modules/appData'
import { useIsCurrentTradeBridging } from 'modules/trade'

export interface CommonTradeConfirmContext {
  account: string | undefined
  ensName: string | undefined
  appData: AppDataInfo | null
  isSmartContractWallet: boolean | undefined
  isCurrentTradeBridging: boolean
}

export function useCommonTradeConfirmContext(): CommonTradeConfirmContext {
  const { account } = useWalletInfo()
  const { ensName } = useWalletDetails()
  const isSmartContractWallet = useIsSmartContractWallet()
  const appData = useAppData()
  const isCurrentTradeBridging = useIsCurrentTradeBridging()

  return useMemo(() => {
    return { account, ensName, isSmartContractWallet, appData, isCurrentTradeBridging }
  }, [account, ensName, isSmartContractWallet, appData, isCurrentTradeBridging])
}
