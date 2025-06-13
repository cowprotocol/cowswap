import { useTradeFlowContext } from 'modules/tradeFlow'

import { useSafeMemoObject } from 'common/hooks/useSafeMemo'

import { useSwapDeadlineState } from './useSwapSettings'

// TODO: Add proper return type annotation
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export function useSwapFlowContext() {
  const [deadline] = useSwapDeadlineState()
  return useTradeFlowContext(useSafeMemoObject({ deadline }))
}
