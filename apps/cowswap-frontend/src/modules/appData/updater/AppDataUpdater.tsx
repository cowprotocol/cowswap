import { useAtomValue } from 'jotai'
import React from 'react'

import { useWalletInfo } from '@cowprotocol/wallet'

import { affiliateTraderAtom } from 'modules/affiliate/state/affiliateTraderAtom'
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
  const { savedCode: referrerCode } = useAtomValue(affiliateTraderAtom)

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

const AppDataUpdaterMemo = React.memo((params: UseAppDataParams) => (
  <>
    <AppDataHooksUpdater />
    <AppDataInfoUpdater {...params} />
  </>
))
