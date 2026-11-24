import { useSetAtom } from 'jotai'

import { useAsyncEffect } from '@cowprotocol/common-hooks'
import { normalizeError } from '@cowprotocol/common-utils'
import { CowEnv } from '@cowprotocol/cow-sdk'

import { appDataInfoAtom } from '../state/atoms'
import { buildAppData } from '../utils/buildAppData'
import { getAppData } from '../utils/fullAppData'
import { toBuildAppDataParams, type UseAppDataParams } from '../utils/toBuildAppDataParams'

export type { UseAppDataParams } from '../utils/toBuildAppDataParams'

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
  enableWaitForCow,
}: UseAppDataParams) {
  // AppDataInfo, from Jotai
  const setAppDataInfo = useSetAtom(appDataInfoAtom)

  useAsyncEffect(async () => {
    const params = toBuildAppDataParams({
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
      enableWaitForCow,
    })

    if (!params) {
      // reset values when there is no price estimation or network changes
      setAppDataInfo(null)
      return
    }

    try {
      const { doc, fullAppData, appDataKeccak256 } = await buildAppData(params)

      setAppDataInfo({ doc, fullAppData, appDataKeccak256, env: getEnvByClass(orderClass) })
    } catch (err: unknown) {
      const error = normalizeError(err)
      console.error(`[useAppData] failed to build appData, falling back to default`, params, error)
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
    refCode,
    enableWaitForCow,
  ])

  return null
}

function getEnvByClass(orderClass: string): CowEnv | undefined {
  if (orderClass === 'twap') {
    return 'prod' // Upload the appData to production always, since WatchTower will create the orders there
  }

  return undefined
}
