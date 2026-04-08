import { SWR_NO_REFRESH_OPTIONS } from '@cowprotocol/common-const'
import { AccountType } from '@cowprotocol/types'

import useSWR from 'swr'
import { useConnection, usePublicClient } from 'wagmi'

import { useIsSafeWallet } from './useWalletMetadata'

import { useSelectedEip6963ProviderInfo, useWalletInfo } from '../../api/hooks'
import { useWalletCapabilities } from '../../api/hooks/useWalletCapabilities'
import { ConnectorType } from '../../api/types'
import { getIsSmartContractWallet } from '../../api/utils/getIsSmartContractWallet'
import { isActiveMetaMaskConnection } from '../../api/utils/isActiveMetaMaskConnection'

export function useIsSmartContractWallet(): boolean | undefined {
  const accountType = useAccountType()
  const isSafeWallet = useIsSafeWallet()
  const { data: capabilities, isLoading: capabilitiesLoading } = useWalletCapabilities()
  const { connector } = useConnection()
  const selectedEip6963Provider = useSelectedEip6963ProviderInfo()

  const isMetaMaskConnection = isActiveMetaMaskConnection({
    connectorName: connector?.name,
    ethereumProvider: typeof window === 'undefined' ? undefined : window.ethereum,
    isInjectedConnection: connector?.type === ConnectorType.INJECTED,
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
  const { chainId } = useConnection()
  const publicClient = usePublicClient({ chainId })
  const { account } = useWalletInfo()

  const { data } = useSWR(
    account ? ['isSmartContract', account, chainId] : null,
    async ([, _account]) => {
      try {
        const code = await publicClient?.getCode({ address: _account })

        if (!code) {
          return AccountType.EOA
        }

        if (isEip7702EOA(code, _account)) {
          return AccountType.EIP7702EOA
        }

        return AccountType.SMART_CONTRACT
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
