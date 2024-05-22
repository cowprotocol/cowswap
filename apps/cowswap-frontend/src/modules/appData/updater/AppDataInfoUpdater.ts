import { useSetAtom } from 'jotai'
import { useEffect, useRef } from 'react'

import { CowEnv, SupportedChainId } from '@cowprotocol/cow-sdk'

import { AppCodeWithWidgetMetadata } from 'modules/injectedWidget/hooks/useAppCodeWidgetAware'
import { UtmParams } from 'modules/utm'

import { appDataInfoAtom } from '../state/atoms'
import { AppDataHooks, AppDataOrderClass, AppDataPartnerFee } from '../types'
import { buildAppData, BuildAppDataParams } from '../utils/buildAppData'
import { getAppData } from '../utils/fullAppData'

export type UseAppDataParams = {
  appCodeWithWidgetMetadata: AppCodeWithWidgetMetadata | null
  chainId: SupportedChainId
  slippageBips: number
  orderClass: AppDataOrderClass
  utm: UtmParams | undefined
  hooks?: AppDataHooks
  partnerFee?: AppDataPartnerFee
  replacedOrderUid?: string
}

/**
 * Fetches and updates appDataInfo whenever a dependency changes
 * The hook can be called only from an updater
 */
export function AppDataInfoUpdater({
  appCodeWithWidgetMetadata,
  chainId,
  slippageBips,
  orderClass,
  utm,
  hooks,
  partnerFee,
  replacedOrderUid,
}: UseAppDataParams): void {
  // AppDataInfo, from Jotai
  const setAppDataInfo = useSetAtom(appDataInfoAtom)

  const updateAppDataPromiseRef = useRef(Promise.resolve())

  useEffect(() => {
    if (!appCodeWithWidgetMetadata) {
      // reset values when there is no price estimation or network changes
      setAppDataInfo(null)
      return
    }

    const { appCode, environment, widget } = appCodeWithWidgetMetadata
    const params: BuildAppDataParams = {
      chainId,
      slippageBips,
      appCode,
      environment,
      orderClass,
      utm,
      hooks,
      partnerFee,
      widget,
      replacedOrderUid,
    }

    const updateAppData = async (): Promise<void> => {
      try {
        const { doc, fullAppData, appDataKeccak256 } = await buildAppData(params)

        setAppDataInfo({ doc, fullAppData, appDataKeccak256, env: getEnvByClass(orderClass) })
      } catch (e: any) {
        console.error(`[useAppData] failed to build appData, falling back to default`, params, e)
        setAppDataInfo(getAppData())
      }
    }

    // Chain the next update to avoid race conditions
    updateAppDataPromiseRef.current = updateAppDataPromiseRef.current.finally(updateAppData)
  }, [
    appCodeWithWidgetMetadata,
    chainId,
    setAppDataInfo,
    slippageBips,
    orderClass,
    utm,
    hooks,
    partnerFee,
    replacedOrderUid,
  ])
}

function getEnvByClass(orderClass: string): CowEnv | undefined {
  if (orderClass === 'twap') {
    return 'prod' // Upload the appData to production always, since WatchTower will create the orders there
  }

  return undefined
}
