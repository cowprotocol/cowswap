import { useEffect } from 'react'
import { SupportedChainId } from '@cowprotocol/cow-sdk'
import { useAtom } from 'jotai'
import { Percent } from '@uniswap/sdk-core'

import { APP_DATA_HASH } from 'constants/index'
import { buildAppData, BuildAppDataParams } from 'utils/appData'
import { appDataInfoAtom } from 'state/appData/atoms'
import { AppDataInfo } from 'state/appData/types'
import { useReferralAddress } from 'state/affiliate/hooks'
import { useAppCode } from 'hooks/useAppCode'
import { percentToBips } from 'utils/misc'
import { OrderClass } from 'state/orders/actions'

type UseAppDataParams = {
  chainId?: SupportedChainId
  allowedSlippage: Percent
  orderClass: OrderClass
}

/**
 * Fetches and updates appDataInfo whenever a dependency changes
 */
export function useAppData({ chainId, allowedSlippage, orderClass }: UseAppDataParams): AppDataInfo | null {
  // AppDataInfo, from Jotai
  const [appDataInfo, setAppDataInfo] = useAtom(appDataInfoAtom)
  // Referrer address, from Redux
  const referrer = useReferralAddress()
  // De-normalizing as we only care about the address if it's set, valid and active
  const referrerAccount = referrer?.value && referrer?.isActive && referrer?.isValid ? referrer.value : undefined
  // AppCode is dynamic and based on how it's loaded (if used as a Gnosis Safe app)
  const appCode = useAppCode()

  // Transform slippage Percent to bips
  const slippageBips = percentToBips(allowedSlippage)

  useEffect(() => {
    if (!chainId) {
      // reset values when there is no price estimation or network changes
      setAppDataInfo(null)
      return
    }

    const params: BuildAppDataParams = { chainId, slippageBips, referrerAccount, appCode, orderClass }

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
        console.error(`[useAppData] failed to generate appData, falling back to default`, params, e.message)
        setAppDataInfo({ hash: APP_DATA_HASH })
      }
    }

    updateAppData()
  }, [appCode, chainId, referrerAccount, setAppDataInfo, slippageBips, orderClass])

  return appDataInfo
}
