import { areAddressesEqual, getContract } from '@cowprotocol/common-utils'
import { implementationAddress } from '@cowprotocol/contracts'
import type { CowShedHooks } from '@cowprotocol/cow-sdk'
import { useWalletInfo } from '@cowprotocol/wallet'
import { useWalletProvider } from '@cowprotocol/wallet-provider'
import type { BaseContract } from '@ethersproject/contracts'
import type { Web3Provider } from '@ethersproject/providers'

import ms from 'ms.macro'
import useSWR, { SWRResponse, SWRConfiguration } from 'swr'

import { useCowShedHooks } from './useCowShedHooks'

const COW_SHED_ABI = [
  {
    inputs: [],
    name: 'trustedExecutor',
    outputs: [{ internalType: 'address', name: '', type: 'address' }],
    stateMutability: 'view',
    type: 'function',
  },
]

interface CoWShedContract extends BaseContract {
  callStatic: {
    trustedExecutor(): Promise<string>
  }
}

interface ProxyAndAccount {
  proxyAddress: string
  account: string
  isProxyDeployed: boolean
  isProxySetupValid: boolean | null
}

const UNKNOW_COWSHED_REFRESH_INTERVAL = ms`3s`

const SWR_OPTIONS: SWRConfiguration<ProxyAndAccount | undefined> = {
  revalidateOnReconnect: true,
  revalidateOnFocus: false,
  refreshWhenHidden: false,
  refreshWhenOffline: false,
  revalidateIfStale: false,
  refreshInterval(data): number {
    // Update proxy data only when Proxy setup is unknown
    // It can happen when there were connection issues while data loading
    if (data?.isProxySetupValid === null) {
      return UNKNOW_COWSHED_REFRESH_INTERVAL
    }

    return 0
  },
}

export function useCurrentAccountProxy(): SWRResponse<ProxyAndAccount | undefined, unknown, typeof SWR_OPTIONS> {
  const { account, chainId } = useWalletInfo()
  const cowShedHooks = useCowShedHooks()
  const provider = useWalletProvider()

  return useSWR(
    account && provider && cowShedHooks ? [account, chainId, 'useCurrentAccountProxyAddress'] : null,
    async ([account]) => {
      if (!provider || !cowShedHooks) return

      const proxyAddress = cowShedHooks.proxyOf(account)
      const proxyCode = await provider.getCode(proxyAddress)
      const isProxyDeployed = !!proxyCode && proxyCode !== '0x'

      const isProxySetupValid = isProxyDeployed
        ? await getIsProxySetupValid(proxyAddress, provider, cowShedHooks)
        : true

      return {
        proxyAddress,
        account,
        isProxyDeployed,
        isProxySetupValid,
      }
    },
    SWR_OPTIONS,
  )
}

export function useCurrentAccountProxyAddress(): string | undefined {
  return useCurrentAccountProxy().data?.proxyAddress
}

async function getIsProxySetupValid(
  proxyAddress: string,
  provider: Web3Provider,
  cowShedHooks: CowShedHooks,
): Promise<boolean | null> {
  const shedContract = getContract(proxyAddress, COW_SHED_ABI, provider) as CoWShedContract
  const expectedImplementation = cowShedHooks.getImplementationAddress()
  const expectedFactoryAddress = cowShedHooks.getFactoryAddress()

  try {
    const implementation = await implementationAddress(provider, proxyAddress)

    if (!areAddressesEqual(implementation, expectedImplementation)) return false
  } catch (e) {
    console.error('[CoWShed validation] Could not get implementationAddress', e)

    return null
  }

  try {
    const trustedExecutor = await shedContract.callStatic.trustedExecutor()

    return areAddressesEqual(trustedExecutor, expectedFactoryAddress)
  } catch (e) {
    console.error('[CoWShed validation] Could not get trustedExecutor', e)

    return null
  }
}
