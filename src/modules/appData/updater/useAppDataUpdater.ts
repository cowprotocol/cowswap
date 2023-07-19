import { useSetAtom } from 'jotai'
import { useEffect } from 'react'

import { SupportedChainId } from '@cowprotocol/cow-sdk'

import { UtmParams } from 'modules/utm'

import { useAppCode } from '../hooks'
import { appDataInfoAtom } from '../state/atoms'
import { AppDataOrderClass } from '../types'
import { buildAppData, BuildAppDataParams } from '../utils/buildAppData'
import { getAppData } from '../utils/fullAppData'

export type UseAppDataParams = {
  chainId: SupportedChainId
  slippageBips: string
  orderClass: AppDataOrderClass
  utm: UtmParams | undefined
}

/**
 * Fetches and updates appDataInfo whenever a dependency changes
 * The hook can be called only from an updater
 */
export function useAppDataUpdater({ chainId, slippageBips, orderClass, utm }: UseAppDataParams): void {
  // AppDataInfo, from Jotai
  const setAppDataInfo = useSetAtom(appDataInfoAtom)

  // AppCode is dynamic and based on how it's loaded (if used as a Gnosis Safe app)
  const appCode = useAppCode()

  useEffect(() => {
    if (!appCode) {
      // reset values when there is no price estimation or network changes
      setAppDataInfo(null)
      return
    }

    const params: BuildAppDataParams = { chainId, slippageBips, appCode, orderClass, utm }

    const updateAppData = async (): Promise<void> => {
      try {
        const { doc, fullAppData, appDataKeccak256 } = await buildAppData(params)
        console.debug(`[useAppData] appDataInfo`, fullAppData)

        setAppDataInfo({ doc, fullAppData, appDataKeccak256 })
      } catch (e: any) {
        console.error(`[useAppData] failed to build appData, falling back to default`, params, e)
        setAppDataInfo(getAppData())
      }
    }

    updateAppData()
  }, [appCode, chainId, setAppDataInfo, slippageBips, orderClass, utm])
}
