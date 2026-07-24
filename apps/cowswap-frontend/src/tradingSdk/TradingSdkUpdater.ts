import { useAtomValue } from 'jotai'
import { useEffect } from 'react'

import { isBarnBackendEnv } from '@cowprotocol/common-utils'
import { useWalletInfo } from '@cowprotocol/wallet'

import { tradingSdk, prodTradingSdk } from './tradingSdk'

import { appSignerAtom, orderBookApi, prodOrderBookApi } from '../cowSdk'
import { useAppCode } from '../modules/appData/hooks'

// TODO: Add proper return type annotation
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export function TradingSdkUpdater() {
  const appCode = useAppCode()
  const { chainId } = useWalletInfo()
  const appSigner = useAtomValue(appSignerAtom)

  useEffect(() => {
    if (appCode) {
      tradingSdk.setTraderParams({
        chainId,
        appCode,
        env: isBarnBackendEnv ? 'staging' : 'prod',
        ...(appSigner ? { signer: appSigner } : {}),
      })
      orderBookApi.context.chainId = chainId

      if (prodTradingSdk !== tradingSdk) {
        prodTradingSdk.setTraderParams({
          chainId,
          appCode,
          env: 'prod',
          ...(appSigner ? { signer: appSigner } : {}),
        })
      }

      if (prodOrderBookApi !== orderBookApi) {
        prodOrderBookApi.context.chainId = chainId
      }
    }
  }, [chainId, appCode, appSigner])

  return null
}
