import React from 'react'

import { useWalletInfo } from '@cowprotocol/wallet'

import { AppDataHooksUpdater } from './AppDataHooksUpdater'
import { AppDataInfoUpdater } from './AppDataInfoUpdater'

import { useAppDataBuildParams } from '../hooks/useAppDataBuildParams'
import { useEnableWaitForCow } from '../hooks/useEnableWaitForCow'
import { AppDataOrderClass } from '../types'

interface AppDataUpdaterProps {
  slippageBips: number
  isSmartSlippage?: boolean
  orderClass: AppDataOrderClass
}

export const AppDataUpdater = React.memo(({ slippageBips, isSmartSlippage, orderClass }: AppDataUpdaterProps) => {
  const { chainId } = useWalletInfo()
  const isWaitAndSaveEnabled = useEnableWaitForCow()
  const params = useAppDataBuildParams({
    slippageBips,
    isSmartSlippage,
    orderClass,
    enableWaitForCow: orderClass === 'market' ? isWaitAndSaveEnabled : undefined,
  })

  if (!chainId) return null

  return (
    <>
      <AppDataHooksUpdater />
      <AppDataInfoUpdater {...params} />
    </>
  )
})
