import { useSetAtom } from 'jotai/index'
import { useCallback } from 'react'

import { Erc20, ERC_20_INTERFACE } from '@cowprotocol/abis'
import { GP_VAULT_RELAYER } from '@cowprotocol/common-const'
import { SupportedChainId } from '@cowprotocol/cow-sdk'
import { Contract } from '@ethersproject/contracts'
import { useWeb3React } from '@web3-react/core'

import { allowancesFullState } from '../state/allowancesAtom'

interface PriorityAllowanceParams {
  account: string | undefined
  chainId: SupportedChainId
  tokenAddress: string
  blockNumber: number
}

export function useAddPriorityAllowance() {
  const { provider } = useWeb3React()
  const setAllowance = useSetAtom(allowancesFullState)

  return useCallback(
    ({ chainId, account, tokenAddress, blockNumber }: PriorityAllowanceParams) => {
      if (!provider || !account || !blockNumber) return undefined

      const spender = GP_VAULT_RELAYER[chainId]
      const tokenContract = new Contract(tokenAddress, ERC_20_INTERFACE, provider) as Erc20

      tokenContract.callStatic.allowance(account, spender, { blockTag: blockNumber }).then((result) => {
        setAllowance((state) => ({
          ...state,
          priorityValues: {
            ...state.priorityValues,
            [tokenAddress.toLowerCase()]: {
              value: result,
              timestamp: Date.now(),
            },
          },
        }))
      })
    },
    [provider, setAllowance]
  )
}
