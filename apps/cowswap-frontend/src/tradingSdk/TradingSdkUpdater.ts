import { useEffect } from 'react'

import { isBarnBackendEnv } from '@cowprotocol/common-utils'
import { useWalletInfo } from '@cowprotocol/wallet'
import { useWalletProvider } from '@cowprotocol/wallet-provider'

import { tradingSdk } from './tradingSdk'

import { orderBookApi } from '../cowSdk'
import { useAppCode } from '../modules/appData/hooks'

// TODO: Add proper return type annotation
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export function TradingSdkUpdater() {
  const provider = useWalletProvider()
  const appCode = useAppCode()
  const { chainId } = useWalletInfo()

  useEffect(() => {
    const signer = provider?.getSigner()

    if (signer && appCode) {
      tradingSdk.setTraderParams({ signer, chainId, appCode, env: isBarnBackendEnv ? 'staging' : 'prod' })
      orderBookApi.context.chainId = chainId
    }
  }, [chainId, provider, appCode])

  return null
}
