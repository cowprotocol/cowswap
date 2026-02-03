import { useMemo } from 'react'

import { ChainInfo } from '@cowprotocol/cow-sdk'
import { useWalletInfo } from '@cowprotocol/wallet'

import { Field } from 'legacy/state/types'

import { TradeType } from 'modules/trade/types'

import { useSelectTokenWidgetState } from '../../../hooks/useSelectTokenWidgetState'

export interface ChainAnalyticsContext {
  tradeType?: TradeType
  field?: Field
  counterChainId?: ChainInfo['id']
}

export function useChainAnalyticsContext(): ChainAnalyticsContext {
  const { tradeType, field, oppositeToken, selectedTargetChainId } = useSelectTokenWidgetState()
  const { chainId } = useWalletInfo()
  const oppositeChainId = oppositeToken?.chainId

  const counterChainId = useMemo(() => {
    if (!field) {
      return undefined
    }

    if (oppositeChainId !== undefined) {
      return oppositeChainId
    }

    if (field === Field.INPUT) {
      return selectedTargetChainId ?? chainId
    }

    return chainId
  }, [field, oppositeChainId, selectedTargetChainId, chainId])

  return useMemo(
    () => ({
      tradeType,
      field,
      counterChainId,
    }),
    [tradeType, field, counterChainId],
  )
}
