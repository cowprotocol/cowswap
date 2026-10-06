import { useAtomValue } from 'jotai'
import { useMemo } from 'react'

import { isSmartContractWalletAtom, useWalletDetails, useWalletInfo } from '@cowprotocol/wallet'

import { AppDataInfo, useAppData } from 'modules/appData'

import { useIsCurrentTradeBridging } from './useIsCurrentTradeBridging'

export interface CommonTradeConfirmContext {
  account: string | undefined
  ensName: string | undefined
  appData: AppDataInfo | null
  isSmartContractWallet: boolean | null
  isCurrentTradeBridging: boolean
}

export function useCommonTradeConfirmContext(): CommonTradeConfirmContext {
  const { account } = useWalletInfo()
  const { ensName } = useWalletDetails()
  const isSmartContractWallet = useAtomValue(isSmartContractWalletAtom)
  const appData = useAppData()
  const isCurrentTradeBridging = useIsCurrentTradeBridging()

  return useMemo(() => {
    return { account, ensName, isSmartContractWallet, appData, isCurrentTradeBridging }
  }, [account, ensName, isSmartContractWallet, appData, isCurrentTradeBridging])
}
