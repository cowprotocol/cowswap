import { useSetAtom } from 'jotai/index'
import { useCallback } from 'react'

import { Erc20, ERC_20_INTERFACE } from '@cowprotocol/abis'
import { COW_PROTOCOL_VAULT_RELAYER_ADDRESS, SupportedChainId } from '@cowprotocol/cow-sdk'
import { useWalletProvider } from '@cowprotocol/wallet-provider'
import { Contract } from '@ethersproject/contracts'

import { allowancesFullState } from '../state/allowancesAtom'

interface PriorityAllowanceParams {
  account: string | undefined
  chainId: SupportedChainId
  tokenAddress: string
  blockNumber: number
}

// TODO: Add proper return type annotation
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export function useAddPriorityAllowance() {
  const provider = useWalletProvider()
  const setAllowance = useSetAtom(allowancesFullState)

  return useCallback(
    ({ chainId, account, tokenAddress, blockNumber }: PriorityAllowanceParams) => {
      if (!provider || !account || !blockNumber) return undefined

      const spender = COW_PROTOCOL_VAULT_RELAYER_ADDRESS[chainId]
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
