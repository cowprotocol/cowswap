import React from 'react'

import { percentToBps } from '@cowprotocol/common-utils'
import { SupportedChainId } from '@cowprotocol/cow-sdk'
import { useWalletInfo } from '@cowprotocol/wallet'
import { PartnerFee } from '@cowprotocol/widget-lib'
import { Percent } from '@uniswap/sdk-core'

import { useInjectedWidgetParams } from 'modules/injectedWidget'
import { useAppCodeWidgetAware } from 'modules/injectedWidget/hooks/useAppCodeWidgetAware'
import { useReplacedOrderUid } from 'modules/trade/state/alternativeOrder'
import { useUtm } from 'modules/utm'

import { AppDataHooksUpdater } from './AppDataHooksUpdater'
import { AppDataInfoUpdater, UseAppDataParams } from './AppDataInfoUpdater'

import { useAppCode, useAppDataHooks } from '../hooks'
import { AppDataOrderClass } from '../types'

const ORDERS_WITH_PARTNER_FEE: AppDataOrderClass[] = ['market']

const mapPartnerFee = (
  partnerFee: PartnerFee | undefined,
  orderClass: AppDataOrderClass,
  chainId: SupportedChainId
) => {
  if (!partnerFee || !ORDERS_WITH_PARTNER_FEE.includes(orderClass)) return undefined

  const { recipient } = partnerFee

  return {
    bps: partnerFee.bps,
    recipient: typeof recipient === 'string' ? recipient : recipient[chainId],
  }
}

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
  const widgetParams = useInjectedWidgetParams()
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
      partnerFee={mapPartnerFee(widgetParams.partnerFee, orderClass, chainId)}
      replacedOrderUid={replacedOrderUid}
    />
  )
})

const AppDataUpdaterMemo = React.memo((params: UseAppDataParams) => {
  AppDataHooksUpdater()
  AppDataInfoUpdater(params)

  return null
})
