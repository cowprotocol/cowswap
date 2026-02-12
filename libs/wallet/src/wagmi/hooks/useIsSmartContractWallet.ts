import { SWR_NO_REFRESH_OPTIONS } from '@cowprotocol/common-const'
import { AccountType } from '@cowprotocol/types'

import useSWR from 'swr'
import { useConnection, usePublicClient } from 'wagmi'

import { useIsSafeWallet } from './useWalletMetadata'

import { useWalletInfo } from '../../api/hooks'
import { useWalletCapabilities, WalletCapabilities } from '../../api/hooks/useWalletCapabilities'

// EIP-5792: atomic batching capability — catches counterfactual ERC-4337 wallets (e.g. Coinbase Smart Wallet)
function hasAtomicBatchSupport(capabilities: WalletCapabilities | undefined): boolean {
  const status = capabilities?.atomic?.status
  return status === 'supported' || status === 'ready'
}

export function useIsSmartContractWallet(): boolean | undefined {
  const accountType = useAccountType()
  const isSafeWallet = useIsSafeWallet()
  const { data: capabilities, isLoading: capabilitiesLoading } = useWalletCapabilities()

  // Definitive positive signals
  if (isSafeWallet) return true
  if (accountType === AccountType.SMART_CONTRACT) return true
  if (hasAtomicBatchSupport(capabilities)) return true

  // If either detection signal is still loading, stay unknown
  if (accountType === undefined || capabilitiesLoading) {
    return undefined
  }

  return false
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
