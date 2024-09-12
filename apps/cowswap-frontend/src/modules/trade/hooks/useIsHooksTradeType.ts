import { Routes } from 'common/constants/routes'

import { useTradeTypeInfo } from './useTradeTypeInfo'

export function useIsHooksTradeType() {
  const tradeTypeInfo = useTradeTypeInfo()

  return tradeTypeInfo?.route === Routes.HOOKS
}
