import { useEffect, useMemo, useState } from 'react'

import { ArgentWalletDetectorAbi } from '@cowprotocol/abis'
import { ARGENT_WALLET_DETECTOR_ADDRESS } from '@cowprotocol/common-const'
import { getProviderOrSigner } from '@cowprotocol/common-utils'
import { Contract } from '@ethersproject/contracts'
import { useWeb3React } from '@web3-react/core'

import useSWR from 'swr'
import { useAsyncMemo } from 'use-async-memo'

import { useIsSafeWallet, useWalletMetaData } from './useWalletMetadata'

import { useWalletInfo } from '../../api/hooks'
import { getIsAmbireWallet } from '../../api/utils/connection'

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

export function useIsSmartContractWallet(): boolean | undefined {
  const [isSmartContractWallet, setIsSmartContractWallet] = useState<boolean | undefined>(undefined)

  const { account } = useWalletInfo()

  const isArgentWallet = useIsArgentWallet()
  const isSmartContract = useCheckIsSmartContract()
  const isAmbireWallet = useIsAmbireWallet()
  const isSafeWallet = useIsSafeWallet()

  useEffect(() => {
    if (!account) {
      setIsSmartContractWallet(false)
    } else {
      setIsSmartContractWallet(isSafeWallet || isAmbireWallet || isArgentWallet || isSmartContract)
    }
  }, [account, isAmbireWallet, isArgentWallet, isSafeWallet, isSmartContract])

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
