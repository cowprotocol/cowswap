import { SWR_NO_REFRESH_OPTIONS } from '@cowprotocol/common-const'
import { AccountType } from '@cowprotocol/types'
import { useWeb3React } from '@web3-react/core'

import useSWR from 'swr'

import { useIsSafeWallet } from './useWalletMetadata'

import { useWalletInfo } from '../../api/hooks'

export function useIsSmartContractWallet(): boolean | undefined {
  const accountType = useAccountType()
  const isSafeWallet = useIsSafeWallet()

  return isSafeWallet || accountType === AccountType.SMART_CONTRACT
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
