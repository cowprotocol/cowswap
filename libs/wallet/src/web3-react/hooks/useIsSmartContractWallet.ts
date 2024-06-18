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
    ['isSmartContract', account, provider],
    async () => {
      if (!account || !provider) {
        return false
      }

      try {
        const code = await provider.getCode(account)
        return code !== '0x'
      } catch (e: any) {
        console.debug(`checkIsSmartContractWallet: failed to check address ${account}`, e.message)
        return false
      }
    },
    SWR_NO_REFRESH_OPTIONS
  )

  return data
}
