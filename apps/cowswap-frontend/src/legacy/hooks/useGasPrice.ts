import { useMemo } from 'react'

import { useENSAddress } from '@cowprotocol/ens'

import JSBI from 'jsbi'
import useSWR from 'swr'

import { useContract } from 'common/hooks/useContract'

const CHAIN_DATA_ABI = [
  {
    inputs: [],
    name: 'latestAnswer',
    outputs: [{ internalType: 'int256', name: '', type: 'int256' }],
    stateMutability: 'view',
    type: 'function',
  },
]

/**
 * Returns the price of 1 gas in WEI for the currently selected network using the chainlink fast gas price oracle
 */
export default function useGasPrice(): JSBI | undefined {
  const { address } = useENSAddress('fast-gas-gwei.data.eth')
  const { contract } = useContract(address ?? undefined, CHAIN_DATA_ABI, false)

  const { data: result } = useSWR(contract ? ['useGasPrice', contract] : null, async ([, _contract]) =>
    _contract.callStatic.latestAnswer(),
  )
  const resultStr = result?.toString()

  return useMemo(() => (typeof resultStr === 'string' ? JSBI.BigInt(resultStr) : undefined), [resultStr])
}
