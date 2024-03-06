import React from 'react'

import { percentToBps } from '@cowprotocol/common-utils'
import { useWalletInfo } from '@cowprotocol/wallet'
import { Percent } from '@uniswap/sdk-core'

import { useInjectedWidgetParams } from 'modules/injectedWidget'
import { useAppCodeWidgetAware } from 'modules/injectedWidget/hooks/useAppCodeWidgetAware'
import { useReplacedOrderUid } from 'modules/trade/state/alternativeOrder'
import { useUtm } from 'modules/utm'

import { AppDataHooksUpdater } from './AppDataHooksUpdater'
import { AppDataInfoUpdater, UseAppDataParams } from './AppDataInfoUpdater'

import { useAppCode, useAppDataHooks } from '../hooks'
import { AppDataOrderClass } from '../types'

interface AppDataUpdaterProps {
  slippage: Percent
  orderClass: AppDataOrderClass
}

export const AppDataUpdater = React.memo(({ slippage, orderClass }: AppDataUpdaterProps) => {
  const { chainId } = useWalletInfo()

  const appCode = useAppCode()
  const slippageBips = percentToBps(slippage)
  const utm = useUtm()
  const hooks = useAppDataHooks()
  const appCodeWithWidgetMetadata = useAppCodeWidgetAware(appCode)
  const { partnerFee } = useInjectedWidgetParams()
  const replacedOrderUid = useReplacedOrderUid()

  if (!chainId) return null

  return (
    <AppDataUpdaterMemo
      appCodeWithWidgetMetadata={appCodeWithWidgetMetadata}
      chainId={chainId}
      slippageBips={slippageBips}
      orderClass={orderClass}
      utm={utm}
      hooks={hooks}
      partnerFee={partnerFee}
      replacedOrderUid={replacedOrderUid}
    />
  )
})

const AppDataUpdaterMemo = React.memo((params: UseAppDataParams) => {
  AppDataHooksUpdater()
  AppDataInfoUpdater(params)

  return null
})
