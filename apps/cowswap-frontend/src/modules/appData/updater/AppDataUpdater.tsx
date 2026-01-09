import React from 'react'

import { useWalletInfo } from '@cowprotocol/wallet'

import { useReferral } from 'modules/affiliate'
import { useAppCodeWidgetAware } from 'modules/injectedWidget/hooks/useAppCodeWidgetAware'
import { useReplacedOrderUid } from 'modules/trade/state/alternativeOrder'
import { useUtm } from 'modules/utm'
import { useVolumeFee } from 'modules/volumeFee'

import { AppDataHooksUpdater } from './AppDataHooksUpdater'
import { AppDataInfoUpdater, UseAppDataParams } from './AppDataInfoUpdater'

import { useAppCode, useAppDataHooks } from '../hooks'
import { useRwaConsentForAppData } from '../hooks/useRwaConsentForAppData'
import { AppDataOrderClass } from '../types'

interface AppDataUpdaterProps {
  slippageBips: number
  isSmartSlippage?: boolean
  orderClass: AppDataOrderClass
}

export const AppDataUpdater = React.memo(({ slippageBips, isSmartSlippage, orderClass }: AppDataUpdaterProps) => {
  const { chainId } = useWalletInfo()

  const appCode = useAppCode()
  const utm = useUtm()
  const typedHooks = useAppDataHooks()
  const appCodeWithWidgetMetadata = useAppCodeWidgetAware(appCode)
  const volumeFee = useVolumeFee()
  const replacedOrderUid = useReplacedOrderUid()
  const userConsent = useRwaConsentForAppData()
  const referral = useReferral()
  const referrerCode = getReferrerCode(referral)

  if (!chainId) return null

  return (
    <AppDataUpdaterMemo
      appCodeWithWidgetMetadata={appCodeWithWidgetMetadata}
      slippageBips={slippageBips}
      isSmartSlippage={isSmartSlippage}
      orderClass={orderClass}
      utm={utm}
      typedHooks={typedHooks}
      volumeFee={volumeFee}
      replacedOrderUid={replacedOrderUid}
      userConsent={userConsent}
      referrerCode={referrerCode}
    />
  )
})

const AppDataUpdaterMemo = React.memo((params: UseAppDataParams) => {
  AppDataHooksUpdater()
  AppDataInfoUpdater(params)

  return null
})

function getReferrerCode(referral: ReturnType<typeof useReferral>): string | undefined {
  if (referral.wallet.status === 'linked') {
    return referral.wallet.code
  }

  if (referral.verification.kind === 'linked') {
    return referral.verification.linkedCode
  }

  if (referral.verification.kind === 'valid' && referral.savedCode) {
    return referral.savedCode
  }

  return undefined
}
