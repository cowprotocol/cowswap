import { useAtomValue } from 'jotai'
import { useMemo } from 'react'

import { affiliateTraderSavedCodeAtom, useIsRefCodeExpired } from 'modules/affiliate'
import { useAppCodeWidgetAware } from 'modules/injectedWidget/hooks/useAppCodeWidgetAware'
import { useReplacedOrderUid } from 'modules/trade/state/alternativeOrder'
import { useUtm } from 'modules/utm'
import { useVolumeFee } from 'modules/volumeFee'

import { useRwaConsentForAppData } from './useRwaConsentForAppData'

import { useAppCode, useAppDataHooks } from '../hooks'

import type { UseAppDataParams } from '../utils/toBuildAppDataParams'

export function useAppDataBuildParams(
  params: Pick<UseAppDataParams, 'slippageBips' | 'isSmartSlippage' | 'orderClass' | 'enableWaitForCow'>,
): UseAppDataParams {
  const appCode = useAppCode()
  const utm = useUtm()
  const typedHooks = useAppDataHooks()
  const appCodeWithWidgetMetadata = useAppCodeWidgetAware(appCode)
  const volumeFee = useVolumeFee()
  const replacedOrderUid = useReplacedOrderUid()
  const userConsent = useRwaConsentForAppData()
  const { savedCode: refCode } = useAtomValue(affiliateTraderSavedCodeAtom)
  const isRefCodeExpired = useIsRefCodeExpired()

  const { slippageBips, isSmartSlippage, orderClass, enableWaitForCow } = params

  return useMemo(
    () => ({
      appCodeWithWidgetMetadata,
      slippageBips,
      isSmartSlippage,
      orderClass,
      utm,
      typedHooks,
      volumeFee,
      replacedOrderUid,
      userConsent,
      refCode: isRefCodeExpired ? undefined : refCode,
      enableWaitForCow,
    }),
    [
      appCodeWithWidgetMetadata,
      enableWaitForCow,
      isRefCodeExpired,
      isSmartSlippage,
      orderClass,
      refCode,
      replacedOrderUid,
      slippageBips,
      typedHooks,
      userConsent,
      utm,
      volumeFee,
    ],
  )
}
