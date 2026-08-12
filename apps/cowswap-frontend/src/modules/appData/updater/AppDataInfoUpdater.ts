import { useSetAtom } from 'jotai'
import { useRef } from 'react'

import { useAsyncEffect } from '@cowprotocol/common-hooks'
import { normalizeError, UtmParams } from '@cowprotocol/common-utils'
import { CowEnv } from '@cowprotocol/cow-sdk'

import { AppCodeWithWidgetMetadata } from 'modules/injectedWidget/hooks/useAppCodeWidgetAware'

import { UserConsentsMetadata } from '../hooks/useRwaConsentForAppData'
import { appDataBuiltWithHooksAtom, appDataInfoAtom } from '../state/atoms'
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
  refCode?: string
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
  refCode,
}: UseAppDataParams) {
  // AppDataInfo, from Jotai
  const setAppDataInfo = useSetAtom(appDataInfoAtom)
  const setAppDataBuiltWithHooks = useSetAtom(appDataBuiltWithHooksAtom)
  // Tracks the latest effect run so a slower, superseded build can't overwrite
  // appDataInfo (and its built-with-hooks marker) after a newer run has started.
  const latestRunIdRef = useRef(0)

  useAsyncEffect(async () => {
    const runId = ++latestRunIdRef.current

    if (!appCodeWithWidgetMetadata) {
      // reset values when there is no price estimation or network changes
      setAppDataInfo(null)
      setAppDataBuiltWithHooks(undefined)
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
      refCode,
    }

    try {
      const { doc, fullAppData, appDataKeccak256 } = await buildAppData(params)

      // Skip stale writes: a newer run started while this build was in flight.
      if (runId !== latestRunIdRef.current) return

      setAppDataInfo({ doc, fullAppData, appDataKeccak256, env: getEnvByClass(orderClass) })
      // Record the hooks this appData build was based on, so consumers can tell
      // whether the current appDataInfo is in sync with the latest hooks.
      setAppDataBuiltWithHooks(typedHooks)
    } catch (err: unknown) {
      const error = normalizeError(err)
      console.error(`[useAppData] failed to build appData, falling back to default`, params, error)

      if (runId !== latestRunIdRef.current) return

      setAppDataInfo(getAppData())
      // The fallback document may omit the newly added hooks, so clear the
      // marker instead of claiming it was built with them.
      setAppDataBuiltWithHooks(undefined)
    }
  }, [
    appCodeWithWidgetMetadata,
    setAppDataInfo,
    setAppDataBuiltWithHooks,
    slippageBips,
    orderClass,
    utm,
    typedHooks,
    volumeFee,
    replacedOrderUid,
    isSmartSlippage,
    userConsent,
    refCode,
  ])

  return null
}

function getEnvByClass(orderClass: string): CowEnv | undefined {
  if (orderClass === 'twap') {
    return 'prod' // Upload the appData to production always, since WatchTower will create the orders there
  }

  return undefined
}
