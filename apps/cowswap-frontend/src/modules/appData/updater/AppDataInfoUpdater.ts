import { useSetAtom } from 'jotai'

import { useAsyncEffect } from '@cowprotocol/common-hooks'
import { UtmParams } from '@cowprotocol/common-utils'
import { CowEnv } from '@cowprotocol/cow-sdk'

import { AppCodeWithWidgetMetadata } from 'modules/injectedWidget/hooks/useAppCodeWidgetAware'

import { UserConsentsMetadata } from '../hooks/useRwaConsentForAppData'
import { appDataInfoAtom } from '../state/atoms'
import { AppDataOrderClass, AppDataPartnerFee, TypedAppDataHooks } from '../types'
import { buildAppData, BuildAppDataParams } from '../utils/buildAppData'
import { getAppData } from '../utils/fullAppData'

export interface UseAppDataParams {
  appCodeWithWidgetMetadata: AppCodeWithWidgetMetadata | null
  slippageBips: number
  isSmartSlippage?: boolean
  orderClass: AppDataOrderClass
  utm: UtmParams | undefined
  typedHooks?: TypedAppDataHooks
  volumeFee?: AppDataPartnerFee
  replacedOrderUid?: string
  userConsent?: UserConsentsMetadata
  referrerCode?: string
}

/**
 * Fetches and updates appDataInfo whenever a dependency changes
 * The hook can be called only from an updater
 */
// TODO: Break down this large function into smaller functions

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export function AppDataInfoUpdater({
  appCodeWithWidgetMetadata,
  slippageBips,
  isSmartSlippage,
  orderClass,
  utm,
  typedHooks,
  volumeFee,
  replacedOrderUid,
  userConsent,
  referrerCode,
}: UseAppDataParams) {
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
      userConsent,
      referrerCode,
    }

    try {
      const { doc, fullAppData, appDataKeccak256 } = await buildAppData(params)

      setAppDataInfo({ doc, fullAppData, appDataKeccak256, env: getEnvByClass(orderClass) })
      // TODO: Replace any with proper type definitions
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (e: any) {
      console.error(`[useAppData] failed to build appData, falling back to default`, params, e)
      setAppDataInfo(getAppData())
    }
  }, [
    appCodeWithWidgetMetadata,
    setAppDataInfo,
    slippageBips,
    orderClass,
    utm,
    typedHooks,
    volumeFee,
    replacedOrderUid,
    isSmartSlippage,
    userConsent,
    referrerCode,
  ])

  return null
}

function getEnvByClass(orderClass: string): CowEnv | undefined {
  if (orderClass === 'twap') {
    return 'prod' // Upload the appData to production always, since WatchTower will create the orders there
  }

  return undefined
}
