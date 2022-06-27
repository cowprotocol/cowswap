import { useEffect } from 'react'
import { SupportedChainId } from '@cowprotocol/cow-sdk'
import { useAtom } from 'jotai'

import TradeGp from 'state/swap/TradeGp'
import { APP_DATA_HASH } from 'constants/index'
import { buildAppData } from 'utils/appData'
import { appDataInfoAtom } from 'state/appData/atoms'
import { AppDataInfo } from 'state/appData/types'
import { useReferralAddress } from 'state/affiliate/hooks'
import { useAppCode } from 'hooks/useAppCode'

/**
 * Fetches and updates appDataInfo whenever a dependency changes
 *
 * @param chainId
 * @param trade
 */
export function useAppData(chainId?: SupportedChainId, trade?: TradeGp): AppDataInfo | null {
  // AppDataInfo, from Jotai
  const [appDataInfo, setAppDataInfo] = useAtom(appDataInfoAtom)
  // Referrer address, from Redux
  const referrer = useReferralAddress()
  // De-normalizing as we only care about the address if it's set, valid and active
  const referrerAccount = referrer?.value && referrer?.isActive && referrer?.isValid ? referrer.value : undefined
  // AppCode is dynamic and based on how it's loaded (if used as a Gnosis Safe app)
  const appCode = useAppCode()

  // Sell and buy amounts, from trade param
  const sellAmount = trade?.inputAmountWithFee.quotient.toString()
  const buyAmount = trade?.outputAmount.quotient.toString()
  const quoteId = trade?.quoteId

  useEffect(() => {
    if (!chainId || !sellAmount || !buyAmount) {
      // reset values when there is no price estimation or network changes
      setAppDataInfo(null)
      return
    }

    const params: Parameters<typeof buildAppData> = [chainId, sellAmount, buyAmount, quoteId, referrerAccount, appCode]

    const updateAppData = async (): Promise<void> => {
      try {
        const { doc, calculatedAppData } = await buildAppData(...params)

        console.debug(`[useAppData] appDataInfo`, JSON.stringify(doc), calculatedAppData)

        if (calculatedAppData?.appDataHash) {
          setAppDataInfo({ doc, hash: calculatedAppData.appDataHash })
        } else {
          // For some reason failed to calculate the appDataHash, use a default hash
          throw new Error("Couldn't calculate appDataHash")
        }
      } catch (e) {
        console.error(`[useAppData] failed to generate appData, falling back to default`, params, e.message)
        setAppDataInfo({ hash: APP_DATA_HASH })
      }
    }

    updateAppData()
  }, [appCode, buyAmount, chainId, quoteId, referrerAccount, sellAmount, setAppDataInfo])

  return appDataInfo
}
