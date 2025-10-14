import { useMemo } from 'react'

import { useFeatureFlags } from '@cowprotocol/common-hooks'
import { getIsNativeToken } from '@cowprotocol/common-utils'

import { useSwapPartialApprovalToggleState } from '../../../hooks/useSwapSettings'

import type { useSwapDerivedState } from '../../../hooks/useSwapDerivedState'

export interface PartialApprovalOptions {
  enablePartialApprovalState: ReturnType<typeof useSwapPartialApprovalToggleState>
  enablePartialApproval: boolean
}

export function usePartialApprovalOptions(
  derivedState: ReturnType<typeof useSwapDerivedState>,
): PartialApprovalOptions {
  const { isPartialApproveEnabled } = useFeatureFlags()
  const enablePartialApprovalState = useSwapPartialApprovalToggleState(isPartialApproveEnabled)

  const enablePartialApproval = useMemo(() => {
    const [enablePartialApprovalBySettings] = enablePartialApprovalState

    if (enablePartialApprovalBySettings === null) {
      return false
    }

    const inputCurrency = derivedState.inputCurrency

    return Boolean(enablePartialApprovalBySettings && inputCurrency && !getIsNativeToken(inputCurrency))
  }, [enablePartialApprovalState, derivedState.inputCurrency])

  return useMemo(
    () => ({ enablePartialApprovalState, enablePartialApproval }),
    [enablePartialApprovalState, enablePartialApproval],
  )
}
