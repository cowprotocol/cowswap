import { useUpdateAtom } from 'jotai/utils'
import { useEffect } from 'react'

import { SupportedChainId } from '@cowprotocol/cow-sdk'
import { OrderClass } from '@cowprotocol/cow-sdk'

import { UtmParams } from 'modules/utm'

import { APP_DATA_HASH } from '../constants'
import { useAppCode } from '../hooks'
import { appDataInfoAtom } from '../state/atoms'
import { buildAppData, BuildAppDataParams } from '../utils/buildAppData'

export type UseAppDataParams = {
  chainId?: SupportedChainId
  slippageBips: string
  orderClass: OrderClass
  utm: UtmParams | undefined
}

/**
 * Fetches and updates appDataInfo whenever a dependency changes
 * The hook can be called only from an updater
 */
export function useAppDataUpdater({ chainId, slippageBips, orderClass, utm }: UseAppDataParams): void {
  // AppDataInfo, from Jotai
  const setAppDataInfo = useUpdateAtom(appDataInfoAtom)
  // AppCode is dynamic and based on how it's loaded (if used as a Gnosis Safe app)
  const appCode = useAppCode()

  useEffect(() => {
    if (!chainId) {
      // reset values when there is no price estimation or network changes
      setAppDataInfo(null)
      return
    }

    const params: BuildAppDataParams = { chainId, slippageBips, appCode, orderClass, utm }

    const updateAppData = async (): Promise<void> => {
      try {
        const { doc, calculatedAppData } = await buildAppData(params)
        console.debug(`[useAppData] appDataInfo`, JSON.stringify(doc), calculatedAppData)

        if (calculatedAppData?.appDataHash) {
          setAppDataInfo({ doc, hash: calculatedAppData.appDataHash })
        } else {
          // For some reason failed to calculate the appDataHash, use a default hash
          throw new Error("Couldn't calculate appDataHash")
        }
      } catch (e: any) {
        console.error(`[useAppData] failed to generate appData, falling back to default`, params)
        console.error(e)
        setAppDataInfo({ hash: APP_DATA_HASH })
      }
    }

    updateAppData()
  }, [appCode, chainId, setAppDataInfo, slippageBips, orderClass, utm])
}
