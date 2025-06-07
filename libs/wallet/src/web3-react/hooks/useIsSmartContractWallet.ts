import { SWR_NO_REFRESH_OPTIONS } from '@cowprotocol/common-const'
import { useWeb3React } from '@web3-react/core'

import useSWR from 'swr'

import { useIsSafeWallet } from './useWalletMetadata'

import { useWalletInfo } from '../../api/hooks'

export function useIsSmartContractWallet(): boolean | undefined {
  const hasCodeAtAddress = useHasContractAtAddress()
  const isSafeWallet = useIsSafeWallet()

  return isSafeWallet || hasCodeAtAddress
}

function useHasContractAtAddress(): boolean | undefined {
  const { provider } = useWeb3React()
  const { account } = useWalletInfo()

  const { data } = useSWR(
    account && provider ? ['isSmartContract', account, provider] : null,
    async ([, _account, _provider]) => {
      try {
        const code = await _provider.getCode(_account)

        if (isEip7702EOA(code, _account)) {
          return false
        }

        return code !== '0x'
      // TODO: Replace any with proper type definitions
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } catch (e: any) {
        console.debug(`checkIsSmartContractWallet: failed to check address ${_account}`, e.message)
        return false
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
