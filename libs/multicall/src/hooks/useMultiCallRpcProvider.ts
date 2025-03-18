import { useAtomValue } from 'jotai/index'

import { getRpcProvider } from '@cowprotocol/common-const'
import { JsonRpcProvider } from '@ethersproject/providers'

import { multiCallContextAtom } from '../state/multiCallContextAtom'

export function useMultiCallRpcProvider(): JsonRpcProvider | null {
  const context = useAtomValue(multiCallContextAtom)

  if (!context) return null

  return getRpcProvider(context.chainId)
}
