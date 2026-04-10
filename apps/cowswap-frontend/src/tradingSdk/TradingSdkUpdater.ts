import { useEffect } from 'react'

import { isBarnBackendEnv } from '@cowprotocol/common-utils'
import { getGlobalAdapter } from '@cowprotocol/cow-sdk'
import { useWalletInfo } from '@cowprotocol/wallet'

import { useWalletClient } from 'wagmi'

import { tradingSdk } from './tradingSdk'

import { orderBookApi } from '../cowSdk'
import { useAppCode } from '../modules/appData/hooks'

// TODO: Add proper return type annotation
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export function TradingSdkUpdater() {
  const appCode = useAppCode()
  const { chainId } = useWalletInfo()
  const { data: walletClient } = useWalletClient()

  useEffect(() => {
    if (appCode) {
      const signer = walletClient ? getGlobalAdapter().signerOrNull() : undefined
      tradingSdk.setTraderParams({
        chainId,
        appCode,
        env: isBarnBackendEnv ? 'staging' : 'prod',
        ...(signer ? { signer } : {}),
      })
      orderBookApi.context.chainId = chainId
    }
  }, [chainId, appCode, walletClient])

  return null
}
