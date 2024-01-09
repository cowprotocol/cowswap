import { useState, useEffect, useMemo } from 'react'

import { useWeb3React } from '@web3-react/core'

import useSWR from 'swr'
import { useAsyncMemo } from 'use-async-memo'
import { useWalletInfo } from '../../api/hooks'
import { useWalletMetaData } from './useWalletMetadata'
import { getIsAmbireWallet } from '../../api/utils/connection'
import { Contract } from '@ethersproject/contracts'
import { getProviderOrSigner } from '@cowprotocol/common-utils'
import { ARGENT_WALLET_DETECTOR_ADDRESS } from '@cowprotocol/common-const'
import { ArgentWalletDetectorAbi } from '@cowprotocol/abis'

function useCheckIsSmartContract(): boolean | undefined {
  const { provider } = useWeb3React()
  const { account } = useWalletInfo()

  const { data } = useSWR(['isSmartContract', account, provider], async () => {
    if (!account || !provider) {
      return false
    }

    try {
      const code = await provider.getCode(account)
      return code !== '0x'
    } catch (e: any) {
      console.debug(`checkIsSmartContractWallet: failed to check address ${account}`, e.message)
      return false
    }
  })

  return data
}

export function useIsSmartContractWallet(): boolean {
  const [isSmartContractWallet, setIsSmartContractWallet] = useState<boolean>(false)

  const { account } = useWalletInfo()

  const isArgentWallet = useIsArgentWallet()
  const isSmartContract = useCheckIsSmartContract()
  const isAmbireWallet = useIsAmbireWallet()

  useEffect(() => {
    if (!account) {
      setIsSmartContractWallet(false)
    } else {
      setIsSmartContractWallet(Boolean(isAmbireWallet || isArgentWallet || isSmartContract))
    }
  }, [account, isAmbireWallet, isArgentWallet, isSmartContract])

  return isSmartContractWallet
}

function useIsArgentWallet(): boolean {
  const { provider } = useWeb3React()
  const { account, chainId } = useWalletInfo()
  const argentWalletContract = useMemo(() => {
    if (!provider) return null

    const address = ARGENT_WALLET_DETECTOR_ADDRESS[chainId]

    if (!address) return null

    return new Contract(address, ArgentWalletDetectorAbi, getProviderOrSigner(provider, account))
  }, [chainId, account, provider])

  return useAsyncMemo(
    () => {
      if (!argentWalletContract || !account) return Promise.resolve(false)

      return argentWalletContract.callStatic.isArgentWallet(account).catch(() => false)
    },
    [argentWalletContract],
    false
  )
}

function useIsAmbireWallet(): boolean {
  const { walletName } = useWalletMetaData()

  return getIsAmbireWallet(walletName)
}
