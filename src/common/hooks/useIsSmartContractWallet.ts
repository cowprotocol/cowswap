import useSWR from 'swr'
import { useState, useEffect } from 'react'
import { useWeb3React } from '@web3-react/core'
import useIsArgentWallet from 'legacy/hooks/useIsArgentWallet'
import useIsAmbireWallet from 'legacy/hooks/useIsAmbireWallet'
import { useWalletInfo } from 'modules/wallet'

function useCheckIsSmartContract(): boolean | undefined {
  const { provider } = useWeb3React()
  const { account } = useWalletInfo()

  const { data } = useSWR(['isSmartContract', account, provider], async () => {
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
  })

  return data
}

export function useIsSmartContractWallet(): boolean {
  const [isSmartContractWallet, setIsSmartContractWallet] = useState<boolean>(false)

  const { account } = useWalletInfo()

  const isArgentWallet = useIsArgentWallet()
  const isSmartContract = useCheckIsSmartContract()
  const isAmbireWallet = useIsAmbireWallet()

  useEffect(() => {
    if (!account) {
      setIsSmartContractWallet(false)
      return
    }

    if (isAmbireWallet || isArgentWallet || isSmartContract) {
      setIsSmartContractWallet(true)
    }
  }, [account, isAmbireWallet, isArgentWallet, isSmartContract])

  return isSmartContractWallet
}
