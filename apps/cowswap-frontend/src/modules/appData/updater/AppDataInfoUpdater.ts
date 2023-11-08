import { useSetAtom } from 'jotai'
import { useEffect, useRef } from 'react'

import { CowEnv, SupportedChainId } from '@cowprotocol/cow-sdk'

import { UtmParams } from 'modules/utm'

import { useAppCode } from '../hooks'
import { appDataInfoAtom } from '../state/atoms'
import { AppDataHooks, AppDataOrderClass } from '../types'
import { buildAppData, BuildAppDataParams } from '../utils/buildAppData'
import { getAppData } from '../utils/fullAppData'

export type UseAppDataParams = {
  chainId: SupportedChainId
  slippageBips: string
  orderClass: AppDataOrderClass
  utm: UtmParams | undefined
  hooks?: AppDataHooks
}

/**
 * Fetches and updates appDataInfo whenever a dependency changes
 * The hook can be called only from an updater
 */
export function AppDataInfoUpdater({ chainId, slippageBips, orderClass, utm, hooks }: UseAppDataParams): void {
  // AppDataInfo, from Jotai
  const setAppDataInfo = useSetAtom(appDataInfoAtom)

  // AppCode is dynamic and based on how it's loaded (if used as a Gnosis Safe app)
  const appCode = useAppCode()

  const updateAppDataPromiseRef = useRef(Promise.resolve())

  useEffect(() => {
    if (!appCode) {
      // reset values when there is no price estimation or network changes
      setAppDataInfo(null)
      return
    }

    const params: BuildAppDataParams = { chainId, slippageBips, appCode, orderClass, utm, hooks }

    const updateAppData = async (): Promise<void> => {
      try {
        const { doc, fullAppData, appDataKeccak256 } = await buildAppData(params)
        console.debug(`[useAppData] appDataInfo`, fullAppData)

        setAppDataInfo({ doc, fullAppData, appDataKeccak256, env: getEnvByClass(orderClass) })
      } catch (e: any) {
        console.error(`[useAppData] failed to build appData, falling back to default`, params, e)
        setAppDataInfo(getAppData())
      }
    }

    // Chain the next update to avoid race conditions
    updateAppDataPromiseRef.current = updateAppDataPromiseRef.current.finally(updateAppData)
  }, [appCode, chainId, setAppDataInfo, slippageBips, orderClass, utm, hooks])
}
function getEnvByClass(orderClass: string): CowEnv | undefined {
  if (orderClass === 'twap') {
    return 'prod' // Upload the appData to production always, since WatchTower will create the orders there
  }

  return undefined
}
