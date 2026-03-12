import { useAtomValue } from 'jotai'
import { useMemo } from 'react'

import { COW_PROTOCOL_VAULT_RELAYER_ADDRESS } from '@cowprotocol/common-utils'
import { useWalletInfo } from '@cowprotocol/wallet'

import { tradeSpenderAtom } from '../state/balancesAtom'

export function useTradeSpenderAddress(): string | undefined {
  const { chainId } = useWalletInfo()
  const spenderOverride = useAtomValue(tradeSpenderAtom)

  return useMemo(
    () => spenderOverride ?? (chainId ? COW_PROTOCOL_VAULT_RELAYER_ADDRESS[chainId] : undefined),
    [chainId, spenderOverride],
  )
}
