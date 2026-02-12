import { ZERO_ADDRESS } from '@cowprotocol/common-const'
import { areAddressesEqual, type SupportedChainId } from '@cowprotocol/cow-sdk'
import type { CowShedHooks } from '@cowprotocol/sdk-cow-shed'
import { useWalletInfo } from '@cowprotocol/wallet'

import { getBytecode, readContract, getStorageAt } from '@wagmi/core'
import ms from 'ms.macro'
import useSWR, { SWRResponse, SWRConfiguration } from 'swr'
import { type Address, encodeAbiParameters, type Hex } from 'viem'
import { type Config, useConfig } from 'wagmi'

import { toKeccak256 } from 'common/utils/toKeccak256'

import { useCowShedHooks } from './useCowShedHooks'

function slot(name: string): Hex {
  return encodeAbiParameters(
    [{ type: 'bytes32' }],
    [`0x${(BigInt(toKeccak256(name)) - 1n).toString(16).padStart(64, '0')}`],
  )
}

const COW_SHED_ABI = [
  {
    inputs: [],
    name: 'trustedExecutor',
    outputs: [{ internalType: 'address', name: '', type: 'address' }],
    stateMutability: 'view',
    type: 'function',
  },
] as const

const IMPLEMENTATION_STORAGE_SLOT = slot('eip1967.proxy.implementation')

/**
 * Returns the address of the implementation of an EIP-1967-compatible proxy
 * from its address.
 *
 * @param proxy Address of the proxy contract.
 * @returns The address of the contract storing the proxy implementation.
 */
export async function implementationAddress(config: Config, proxy: string): Promise<string> {
  const storage = await getStorageAt(config, {
    address: proxy,
    slot: IMPLEMENTATION_STORAGE_SLOT,
  })

  if (!storage || storage === '0x') return ZERO_ADDRESS

  return `0x${storage.slice(-40)}`
}

interface ProxyAndAccount {
  chainId: SupportedChainId
  proxyAddress: string
  account: Address
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
  const config = useConfig()
  const { account, chainId } = useWalletInfo()
  const cowShedHooks = useCowShedHooks()

  return useSWR(
    account && cowShedHooks ? [account, chainId, 'useCurrentAccountProxyAddress'] : null,
    async ([account, chainId]) => {
      if (!cowShedHooks) return

      const proxyAddress = cowShedHooks.proxyOf(account)
      const proxyCode = await getBytecode(config, { address: proxyAddress })
      const isProxyDeployed = !!proxyCode && proxyCode !== '0x'

      const isProxySetupValid = isProxyDeployed
        ? await getIsProxySetupValid(chainId, proxyAddress, config, cowShedHooks)
        : true

      return {
        chainId,
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
  chainId: SupportedChainId,
  proxyAddress: string,
  config: Config,
  cowShedHooks: CowShedHooks,
): Promise<boolean | null> {
  console.debug('[CoWShed validation] network', {
    chainId,
  })

  const expectedImplementation = cowShedHooks.getImplementationAddress()
  const expectedFactoryAddress = cowShedHooks.getFactoryAddress()

  try {
    const implementation = await implementationAddress(config, proxyAddress)
    // If implementation is zero, it means proxy is not deployed and is considered as valid
    if (areAddressesEqual(implementation, ZERO_ADDRESS)) {
      return true
    }

    if (!areAddressesEqual(implementation, expectedImplementation)) {
      console.debug('[CoWShed validation] implementation', {
        implementation,
        expectedImplementation,
      })

      return false
    }
  } catch (e) {
    console.error('[CoWShed validation] Could not get implementationAddress', e)

    return null
  }

  try {
    const trustedExecutor = await readContract(config, {
      abi: COW_SHED_ABI,
      address: proxyAddress,
      functionName: 'trustedExecutor',
    })

    const isTrustedExecutorValid = areAddressesEqual(trustedExecutor, expectedFactoryAddress)

    if (!isTrustedExecutorValid) {
      console.debug('[CoWShed validation] trustedExecutor', {
        trustedExecutor,
        expectedFactoryAddress,
      })
    }

    return isTrustedExecutorValid
  } catch (e) {
    console.error('[CoWShed validation] Could not get trustedExecutor', e)

    return null
  }
}
