import { useAtomValue } from 'jotai'
import { useEffect, useMemo } from 'react'

import { UiOrderType } from '@cowprotocol/types'
import { useWalletInfo } from '@cowprotocol/wallet'

import { getSurveyType, triggerAppziSurvey } from 'appzi'
import { twapOrdersListAtom } from 'entities/twap'

import { getPendingTwapSurveyOrderIds } from '../utils/triggerTwapAppziSurvey.utils'

export function TriggerAppziTwapSurveyUpdater(): null {
  const { account, chainId } = useWalletInfo()
  const orders = useAtomValue(twapOrdersListAtom)
  const pendingOrderIds = useMemo(() => getPendingTwapSurveyOrderIds(orders), [orders])

  useEffect(() => {
    if (!account || !chainId || !pendingOrderIds) return

    triggerAppziSurvey(
      { account, chainId, pendingOrderIds, orderType: UiOrderType.TWAP, openedTwapPage: true },
      getSurveyType(UiOrderType.TWAP),
    )
  }, [account, chainId, pendingOrderIds])

  return null
}
