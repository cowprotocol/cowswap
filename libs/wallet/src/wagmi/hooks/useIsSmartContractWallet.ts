import { useConnection, usePublicClient } from 'wagmi'

import { SWR_NO_REFRESH_OPTIONS } from '@cowprotocol/common-const'
import { AccountType } from '@cowprotocol/types'

import useSWR from 'swr'

import { useConnectionType } from './useConnectionType'
import { useIsSafeWallet } from './useWalletMetadata'

import { useWalletInfo } from '../../api/hooks'
import { ConnectionType } from '../../api/types'
import { isEip7702EOA } from '../utils/isEip7702EOA.utils'

// TODO: Replace with accountTypeAtom
export function useAccountType(): AccountType | undefined {
  const { chainId } = useConnection()
  const publicClient = usePublicClient({ chainId })
  const { account } = useWalletInfo()

  const { data } = useSWR(
    account ? ['isSmartContract', account, chainId] : null,
    async ([, _account]) => {
      try {
        if (!publicClient) return undefined

        const code = await publicClient.getCode({ address: _account })

        if (!code || code === '0x') {
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

// TODO: Replace with isSmartContractWalletAtom
export function useIsSmartContractWallet(): boolean | undefined {
  const accountType = useAccountType()
  const isSafeWallet = useIsSafeWallet()
  const connectionType = useConnectionType()

  // Base Account has no code while undeployed and only an EIP-7702 delegation where it was used,
  // but it always signs with its passkey owner (ERC-1271/ERC-6492), never with an ECDSA key
  if (connectionType === ConnectionType.BASE_ACCOUNT) return true

  return isSafeWallet || accountType === AccountType.SMART_CONTRACT
}
