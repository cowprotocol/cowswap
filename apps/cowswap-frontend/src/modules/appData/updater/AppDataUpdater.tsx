import React from 'react'

import { percentToBips } from '@cowprotocol/common-utils'
import { useWalletInfo } from '@cowprotocol/wallet'
import { Percent } from '@uniswap/sdk-core'

import { useUtm } from 'modules/utm'

import { AppDataHooksUpdater } from './AppDataHooksUpdater'
import { AppDataInfoUpdater, UseAppDataParams } from './AppDataInfoUpdater'

import { useAppDataHooks } from '../hooks'
import { AppDataOrderClass } from '../types'

interface AppDataUpdaterProps {
  slippage: Percent
  orderClass: AppDataOrderClass
}

export const AppDataUpdater = React.memo(({ slippage, orderClass }: AppDataUpdaterProps) => {
  const { chainId } = useWalletInfo()

  const slippageBips = percentToBips(slippage)
  const utm = useUtm()
  const hooks = useAppDataHooks()

  if (!chainId) return null

  return (
    <AppDataUpdaterMemo chainId={chainId} slippageBips={slippageBips} orderClass={orderClass} utm={utm} hooks={hooks} />
  )
})

const AppDataUpdaterMemo = React.memo((params: UseAppDataParams) => {
  AppDataHooksUpdater()
  AppDataInfoUpdater(params)

  return null
})
