import { useMemo } from 'react'

import { BigNumber } from '@ethersproject/bignumber'

import { useAppSelector } from 'legacy/state/hooks'

import { useWalletInfo } from 'modules/wallet'

import useCurrentBlockTimestamp from './useCurrentBlockTimestamp'

// combines the block timestamp with the user setting to give the deadline that should be used for any submitted transaction
export default function useTransactionDeadline(): BigNumber | undefined {
  const { chainId } = useWalletInfo()
  const ttl = useAppSelector((state) => state.user.userDeadline)
  const blockTimestamp = useCurrentBlockTimestamp()
  return useMemo(() => {
    if (blockTimestamp && ttl) return blockTimestamp.add(ttl)
    return undefined
  }, [blockTimestamp, chainId, ttl])
}
