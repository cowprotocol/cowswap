import { SWR_NO_REFRESH_OPTIONS } from '@cowprotocol/common-const'
import { AccountType } from '@cowprotocol/types'
import type { Web3Provider } from '@ethersproject/providers'
import { useWeb3React } from '@web3-react/core'

import useSWR from 'swr'

import { useIsSafeWallet } from './useWalletMetadata'

import { useSelectedEip6963ProviderInfo, useWalletInfo } from '../../api/hooks'
import { useWalletCapabilities } from '../../api/hooks/useWalletCapabilities'
import { getIsSmartContractWallet } from '../../api/utils/getIsSmartContractWallet'
import { isActiveMetaMaskConnection } from '../../api/utils/isActiveMetaMaskConnection'
import { injectedWalletConnection } from '../connection/injectedWallet'
import { metaMaskSdkConnection } from '../connection/metaMaskSdk'

export function useIsSmartContractWallet(): boolean | undefined {
  const accountType = useAccountType()
  const isSafeWallet = useIsSafeWallet()
  const { data: capabilities, isLoading: capabilitiesLoading } = useWalletCapabilities()
  const { connector, provider } = useWeb3React()
  const selectedEip6963Provider = useSelectedEip6963ProviderInfo()
  const ethereumProvider = (provider as Web3Provider | undefined)?.provider as
    | { isMetaMask?: boolean; isRabby?: boolean }
    | undefined

  const isMetaMaskConnection = isActiveMetaMaskConnection({
    ethereumProvider,
    isInjectedConnection: connector === injectedWalletConnection.connector,
    isMetaMaskSdkConnection: connector === metaMaskSdkConnection.connector,
    rdns: selectedEip6963Provider?.info.rdns,
  })

  return getIsSmartContractWallet({
    accountType,
    capabilities,
    capabilitiesLoading,
    isSafeWallet,
    shouldTreatAtomicCapabilitiesAsSmartWallet: !isMetaMaskConnection,
  })
}

export function useAccountType(): AccountType | undefined {
  const { provider, chainId } = useWeb3React()
  const { account } = useWalletInfo()

  const { data } = useSWR(
    account && provider ? ['isSmartContract', account, provider, chainId] : null,
    async ([, _account, _provider]) => {
      try {
        const code = await _provider.getCode(_account)

        if (isEip7702EOA(code, _account)) {
          return AccountType.EIP7702EOA
        }

        return code === '0x' ? AccountType.EOA : AccountType.SMART_CONTRACT
      } catch (e) {
        console.debug(`checkIsSmartContractWallet: failed to check address ${_account}`, e.message)
        // If we cannot determine yet, return undefined to avoid false negatives during init
        return undefined
      }
    },
    SWR_NO_REFRESH_OPTIONS,
  )

  return data
}

// https://eips.ethereum.org/EIPS/eip-7702#abstract
function isEip7702EOA(code: string, account: string): boolean {
  return code.startsWith('0xef0100') || code.toLowerCase() === account.toLowerCase()
}
