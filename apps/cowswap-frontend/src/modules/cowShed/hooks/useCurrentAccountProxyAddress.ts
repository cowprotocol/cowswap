import { getContract } from '@cowprotocol/common-utils'
import { implementationAddress } from '@cowprotocol/contracts'
import type { CowShedHooks } from '@cowprotocol/cow-sdk'
import { useWalletInfo } from '@cowprotocol/wallet'
import { useWalletProvider } from '@cowprotocol/wallet-provider'
import type { BaseContract } from '@ethersproject/contracts'
import type { Web3Provider } from '@ethersproject/providers'

import useSWR from 'swr'

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
  isProxySetupValid: boolean
}

export function useCurrentAccountProxyAddress(): ProxyAndAccount | undefined {
  const { account, chainId } = useWalletInfo()
  const cowShedHooks = useCowShedHooks()
  const provider = useWalletProvider()

  return useSWR(
    account && provider && cowShedHooks
      ? [account, provider, cowShedHooks, chainId, 'useCurrentAccountProxyAddress']
      : null,
    async ([account, provider, cowShedHooks]) => {
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
  ).data
}

async function getIsProxySetupValid(
  proxyAddress: string,
  provider: Web3Provider,
  cowShedHooks: CowShedHooks,
): Promise<boolean> {
  const shedContract = getContract(proxyAddress, COW_SHED_ABI, provider) as CoWShedContract

  const implementation = await implementationAddress(provider, proxyAddress)
  const trustedExecutor = await shedContract.callStatic.trustedExecutor()

  return (
    implementation === cowShedHooks.getImplementationAddress() && trustedExecutor === cowShedHooks.getFactoryAddress()
  )
}
