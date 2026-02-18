import { useSetAtom } from 'jotai'
import { type ReactNode } from 'react'

import { useAsyncEffect } from '@cowprotocol/common-hooks'
import { CowEnv, SupportedChainId } from '@cowprotocol/cow-sdk'

import { type AppCodeWithWidgetMetadata } from 'modules/injectedWidget'

import { UserConsentsMetadata } from '../hooks/useRwaConsentForAppData'
import { appDataInfoAtom } from '../state/atoms'
import { AppDataOrderClass, AppDataPartnerFee, TypedAppDataHooks } from '../types'
import { buildAppData, BuildAppDataParams } from '../utils/buildAppData'
import { getAppData } from '../utils/fullAppData'

export interface UseAppDataParams {
  appCodeWithWidgetMetadata: AppCodeWithWidgetMetadata | null
  chainId: SupportedChainId
  slippageBips: number
  isSmartSlippage?: boolean
  orderClass: AppDataOrderClass
  typedHooks?: TypedAppDataHooks
  volumeFee?: AppDataPartnerFee
  replacedOrderUid?: string
  userConsent?: UserConsentsMetadata
}

/**
 * Fetches and updates appDataInfo whenever a dependency changes
 * The hook can be called only from an updater
 */
export function AppDataInfoUpdater({
  appCodeWithWidgetMetadata,
  chainId,
  slippageBips,
  isSmartSlippage,
  orderClass,
  typedHooks,
  volumeFee,
  replacedOrderUid,
  userConsent,
}: UseAppDataParams): ReactNode {
  // AppDataInfo, from Jotai
  const setAppDataInfo = useSetAtom(appDataInfoAtom)

  useAsyncEffect(async () => {
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
      typedHooks,
      partnerFee: volumeFee,
      widget,
      replacedOrderUid,
      userConsent,
    }

    try {
      const { doc, fullAppData, appDataKeccak256 } = await buildAppData(params)

      setAppDataInfo({ doc, fullAppData, appDataKeccak256, env: getEnvByClass(orderClass) })
    } catch (error: unknown) {
      console.error(`[useAppData] failed to build appData, falling back to default`, params, error)
      setAppDataInfo(getAppData())
    }
  }, [
    appCodeWithWidgetMetadata,
    chainId,
    setAppDataInfo,
    slippageBips,
    orderClass,
    typedHooks,
    volumeFee,
    replacedOrderUid,
    isSmartSlippage,
    userConsent,
  ])

  return null
}

function getEnvByClass(orderClass: string): CowEnv | undefined {
  if (orderClass === 'twap') {
    return 'prod' // Upload the appData to production always, since WatchTower will create the orders there
  }

  return undefined
}
