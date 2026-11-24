import type { UtmParams } from '@cowprotocol/common-utils'

import type { AppCodeWithWidgetMetadata } from 'modules/injectedWidget/hooks/useAppCodeWidgetAware'

import type { UserConsentsMetadata } from '../hooks/useRwaConsentForAppData'
import type { AppDataOrderClass, AppDataPartnerFee, TypedAppDataHooks } from '../types'
import type { BuildAppDataParams } from './buildAppData'

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
  enableWaitForCow?: boolean
}

export function toBuildAppDataParams(params: UseAppDataParams): BuildAppDataParams | undefined {
  if (!params.appCodeWithWidgetMetadata) return undefined

  const { appCode, environment, widget } = params.appCodeWithWidgetMetadata

  return {
    slippageBips: params.slippageBips,
    isSmartSlippage: params.isSmartSlippage,
    appCode,
    environment,
    orderClass: params.orderClass,
    utm: params.utm,
    typedHooks: params.typedHooks,
    partnerFee: params.volumeFee,
    widget,
    replacedOrderUid: params.replacedOrderUid,
    userConsent: params.userConsent,
    refCode: params.refCode,
    enableWaitForCow: params.enableWaitForCow,
  }
}
