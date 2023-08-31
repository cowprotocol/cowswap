import React from 'react'

import { Percent } from '@uniswap/sdk-core'

import { percentToBips } from 'legacy/utils/misc'

import { useUtm } from 'modules/utm'
import { useWalletInfo } from 'modules/wallet'

import { UseAppDataParams, useAppDataUpdater } from './useAppDataUpdater'

import { AppDataOrderClass } from '../types'

interface AppDataUpdaterProps {
  slippage: Percent
  orderClass: AppDataOrderClass
}

export const AppDataUpdater = React.memo(({ slippage, orderClass }: AppDataUpdaterProps) => {
  const { chainId } = useWalletInfo()

  const slippageBips = percentToBips(slippage)
  const utm = useUtm()

  if (!chainId) return null

  return <AppDataUpdaterMemo chainId={chainId} slippageBips={slippageBips} orderClass={orderClass} utm={utm} />
})

const AppDataUpdaterMemo = React.memo((params: UseAppDataParams) => {
  useAppDataUpdater(params)

  return null
})
