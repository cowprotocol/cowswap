import { useAtomValue } from 'jotai'
import React from 'react'

import { useWalletInfo } from '@cowprotocol/wallet'

import { affiliateTraderSavedCodeAtom, useIsRefCodeExpired } from 'modules/affiliate'
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
  // Fast path (out-of-competition execution) — swap flow only, see cowprotocol/services#4883.
  enableFastPath?: boolean
}

export const AppDataUpdater = React.memo(
  ({ slippageBips, isSmartSlippage, orderClass, enableFastPath }: AppDataUpdaterProps) => {
    const { chainId } = useWalletInfo()

    const appCode = useAppCode()
    const utm = useUtm()
    const typedHooks = useAppDataHooks()
    const appCodeWithWidgetMetadata = useAppCodeWidgetAware(appCode)
    const volumeFee = useVolumeFee()
    const replacedOrderUid = useReplacedOrderUid()
    const userConsent = useRwaConsentForAppData()
    const { savedCode: refCode } = useAtomValue(affiliateTraderSavedCodeAtom)
    const isRefCodeExpired = useIsRefCodeExpired()

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
        refCode={isRefCodeExpired ? undefined : refCode}
        enableFastPath={enableFastPath}
      />
    )
  },
)

const AppDataUpdaterMemo = React.memo((params: UseAppDataParams) => (
  <>
    <AppDataHooksUpdater />
    <AppDataInfoUpdater {...params} />
  </>
))
