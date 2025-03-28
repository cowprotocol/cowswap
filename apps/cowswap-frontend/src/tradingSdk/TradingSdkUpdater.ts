import { useEffect } from 'react'

import { isBarnBackendEnv } from '@cowprotocol/common-utils'
import { useWalletInfo } from '@cowprotocol/wallet'
import { useWalletProvider } from '@cowprotocol/wallet-provider'

import { tradingSdk } from './tradingSdk'

import { useAppCode } from '../modules/appData/hooks'

export function TradingSdkUpdater() {
  const provider = useWalletProvider()
  const appCode = useAppCode()
  const { chainId } = useWalletInfo()

  useEffect(() => {
    const signer = provider?.getSigner()

    if (signer && appCode) {
      tradingSdk.setTraderParams({ signer, chainId, appCode, env: isBarnBackendEnv ? 'staging' : 'prod' })
    }
  }, [chainId, provider, appCode])

  return null
}
