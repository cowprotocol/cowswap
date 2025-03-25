import { useSetAtom } from 'jotai'
import { useEffect } from 'react'

import { isBarnBackendEnv } from '@cowprotocol/common-utils'
import { useWalletInfo } from '@cowprotocol/wallet'
import { useWalletProvider } from '@cowprotocol/wallet-provider'

import { tradingSdkParamsAtom } from './tradingSdkAtom'

import { useAppCode } from '../modules/appData/hooks'

export function TradingSdkUpdater() {
  const setTradingSdkParams = useSetAtom(tradingSdkParamsAtom)
  const provider = useWalletProvider()
  const appCode = useAppCode()
  const { chainId } = useWalletInfo()

  useEffect(() => {
    const signer = provider?.getSigner()

    if (signer && appCode) {
      setTradingSdkParams({ signer, chainId, appCode, env: isBarnBackendEnv ? 'staging' : 'prod' })
    }
  }, [chainId, provider, appCode, setTradingSdkParams])

  return null
}
