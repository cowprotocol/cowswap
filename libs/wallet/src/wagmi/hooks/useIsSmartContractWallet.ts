import { SWR_NO_REFRESH_OPTIONS } from '@cowprotocol/common-const'
import { AccountType, type EIP1193Provider } from '@cowprotocol/types'

import useSWR from 'swr'
import { useConnection, usePublicClient } from 'wagmi'

import { useIsSafeWallet } from './useWalletMetadata'

import { useSelectedEip6963ProviderInfo, useWalletInfo } from '../../api/hooks'
import { useWalletCapabilities } from '../../api/hooks/useWalletCapabilities'
import { ConnectorType } from '../../api/types'
import { getIsSmartContractWallet } from '../../api/utils/getIsSmartContractWallet'
import { isActiveCoinbaseConnection } from '../../api/utils/isActiveCoinbaseConnection'
import { isActiveMetaMaskConnection } from '../../api/utils/isActiveMetaMaskConnection'

type WalletProviderLike = EIP1193Provider & {
  autoConnect?: true
  isCoinbaseWallet?: true
  isMetaMask?: true
  isRabby?: true
  providers?: unknown[]
}

export function useIsSmartContractWallet(): boolean | undefined {
  const accountType = useAccountType()
  const isSafeWallet = useIsSafeWallet()
  const { data: capabilities, isLoading: capabilitiesLoading } = useWalletCapabilities()
  const { connector } = useConnection()
  const selectedEip6963Provider = useSelectedEip6963ProviderInfo()
  const ethereumProvider = (typeof window === 'undefined' ? undefined : window.ethereum) as
    | WalletProviderLike
    | undefined
  const isInjectedConnection = connector?.type === ConnectorType.INJECTED
  let trustedRdns: string | undefined

  if (isInjectedConnection && selectedEip6963Provider && selectedEip6963Provider.provider === ethereumProvider) {
    trustedRdns = selectedEip6963Provider.info.rdns
  }

  const isMetaMaskConnection = isActiveMetaMaskConnection({
    connectorName: connector?.name,
    ethereumProvider,
    isInjectedConnection,
    trustedRdns,
  })

  const isCoinbaseConnection = isActiveCoinbaseConnection({
    ethereumProvider,
    isInjectedConnection,
    trustedRdns,
  })

  return getIsSmartContractWallet({
    accountType,
    capabilities,
    capabilitiesLoading,
    isSafeWallet,
    shouldKeepEoaUnknownWhileCapabilitiesLoad: isCoinbaseConnection,
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
