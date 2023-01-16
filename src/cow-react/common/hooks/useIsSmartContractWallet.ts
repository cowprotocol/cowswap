import useSWR from 'swr'
import { useState, useEffect } from 'react'
import { useWeb3React } from '@web3-react/core'
import useIsArgentWallet from 'hooks/useIsArgentWallet'

function useCheckIsSmartContract(): boolean | undefined {
  const { account, provider } = useWeb3React()

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

  const { account } = useWeb3React()

  const isArgentWallet = useIsArgentWallet()
  const isSmartContract = useCheckIsSmartContract()

  useEffect(() => {
    if (!account) {
      setIsSmartContractWallet(false)
    } else if (account && isArgentWallet) {
      setIsSmartContractWallet(true)
    } else if (account && isSmartContract) {
      setIsSmartContractWallet(true)
    }
  }, [account, isArgentWallet, isSmartContract])

  return isSmartContractWallet
}
