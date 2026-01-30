import { ZERO_ADDRESS } from '@cowprotocol/common-const'
import { areAddressesEqual, getContract } from '@cowprotocol/common-utils'
import type { SupportedChainId } from '@cowprotocol/cow-sdk'
import type { CowShedHooks } from '@cowprotocol/sdk-cow-shed'
import { useWalletInfo } from '@cowprotocol/wallet'
import { useWalletProvider } from '@cowprotocol/wallet-provider'
import { defaultAbiCoder } from '@ethersproject/abi'
import { BigNumber } from '@ethersproject/bignumber'
import type { BaseContract } from '@ethersproject/contracts'
import { id } from '@ethersproject/hash'
import type { Web3Provider } from '@ethersproject/providers'

import ms from 'ms.macro'
import useSWR, { SWRResponse, SWRConfiguration } from 'swr'
import { Address } from 'viem'

import { useCowShedHooks } from './useCowShedHooks'

function slot(name: string): string {
  return defaultAbiCoder.encode(['bytes32'], [BigNumber.from(id(name)).sub(1)])
}

const COW_SHED_ABI = [
  {
    inputs: [],
    name: 'trustedExecutor',
    outputs: [{ internalType: 'address', name: '', type: 'address' }],
    stateMutability: 'view',
    type: 'function',
  },
]

const IMPLEMENTATION_STORAGE_SLOT = slot('eip1967.proxy.implementation')

/**
 * Returns the address of the implementation of an EIP-1967-compatible proxy
 * from its address.
 *
 * @param proxy Address of the proxy contract.
 * @returns The address of the contract storing the proxy implementation.
 */
export async function implementationAddress(provider: Web3Provider, proxy: string): Promise<string> {
  const storage = await provider.getStorageAt(proxy, IMPLEMENTATION_STORAGE_SLOT)

  if (storage === '0x') return ZERO_ADDRESS

  const [implementation] = defaultAbiCoder.decode(['address'], storage)

  return implementation
}

interface CoWShedContract extends BaseContract {
  callStatic: {
    trustedExecutor(): Promise<string>
  }
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
  const { account, chainId } = useWalletInfo()
  const cowShedHooks = useCowShedHooks()
  // TODO M-6 COW-573
  // This flow will be reviewed and updated later, to include a wagmi alternative
  const provider = useWalletProvider()

  return useSWR(
    account && provider && cowShedHooks ? [account, chainId, 'useCurrentAccountProxyAddress'] : null,
    async ([account, chainId]) => {
      if (!provider || !cowShedHooks) return

      const proxyAddress = cowShedHooks.proxyOf(account)
      const proxyCode = await provider.getCode(proxyAddress)
      const isProxyDeployed = !!proxyCode && proxyCode !== '0x'

      const isProxySetupValid = isProxyDeployed
        ? await getIsProxySetupValid(chainId, proxyAddress, provider, cowShedHooks)
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
  provider: Web3Provider,
  cowShedHooks: CowShedHooks,
): Promise<boolean | null> {
  const providerNetwork = await provider.getNetwork()

  // Skip validation if network mismatch
  if (providerNetwork.chainId !== chainId) return true

  console.debug('[CoWShed validation] networks', {
    providerNetwork,
    chainId,
  })

  const shedContract = getContract(proxyAddress, COW_SHED_ABI, provider) as CoWShedContract
  const expectedImplementation = cowShedHooks.getImplementationAddress()
  const expectedFactoryAddress = cowShedHooks.getFactoryAddress()

  try {
    const implementation = await implementationAddress(provider, proxyAddress)

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
    const trustedExecutor = await shedContract.callStatic.trustedExecutor()

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
