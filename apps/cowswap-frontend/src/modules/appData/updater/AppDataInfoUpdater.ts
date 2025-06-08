import { useSetAtom } from 'jotai'
import { useEffect, useRef } from 'react'

import { UtmParams } from '@cowprotocol/common-utils'
import { CowEnv, SupportedChainId } from '@cowprotocol/cow-sdk'

import { AppCodeWithWidgetMetadata } from 'modules/injectedWidget/hooks/useAppCodeWidgetAware'

import { appDataInfoAtom } from '../state/atoms'
import { AppDataOrderClass, AppDataPartnerFee, TypedAppDataHooks } from '../types'
import { buildAppData, BuildAppDataParams } from '../utils/buildAppData'
import { getAppData } from '../utils/fullAppData'

export type UseAppDataParams = {
  appCodeWithWidgetMetadata: AppCodeWithWidgetMetadata | null
  chainId: SupportedChainId
  slippageBips: number
  isSmartSlippage?: boolean
  orderClass: AppDataOrderClass
  utm: UtmParams | undefined
  typedHooks?: TypedAppDataHooks
  volumeFee?: AppDataPartnerFee
  replacedOrderUid?: string
}

/**
 * Fetches and updates appDataInfo whenever a dependency changes
 * The hook can be called only from an updater
 */
// TODO: Break down this large function into smaller functions
// eslint-disable-next-line max-lines-per-function
export function AppDataInfoUpdater({
  appCodeWithWidgetMetadata,
  chainId,
  slippageBips,
  isSmartSlippage,
  orderClass,
  utm,
  typedHooks,
  volumeFee,
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
      isSmartSlippage,
      appCode,
      environment,
      orderClass,
      utm,
      typedHooks,
      partnerFee: volumeFee,
      widget,
      replacedOrderUid,
    }

    const updateAppData = async (): Promise<void> => {
      try {
        const { doc, fullAppData, appDataKeccak256 } = await buildAppData(params)

        setAppDataInfo({ doc, fullAppData, appDataKeccak256, env: getEnvByClass(orderClass) })
      // TODO: Replace any with proper type definitions
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
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
    typedHooks,
    volumeFee,
    replacedOrderUid,
    isSmartSlippage,
  ])
}

function getEnvByClass(orderClass: string): CowEnv | undefined {
  if (orderClass === 'twap') {
    return 'prod' // Upload the appData to production always, since WatchTower will create the orders there
  }

  return undefined
}
