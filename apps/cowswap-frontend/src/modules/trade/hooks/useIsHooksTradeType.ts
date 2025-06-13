import { Routes } from 'common/constants/routes'

import { useTradeTypeInfo } from './useTradeTypeInfo'

// TODO: Add proper return type annotation
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export function useIsHooksTradeType() {
  const tradeTypeInfo = useTradeTypeInfo()

  return tradeTypeInfo?.route === Routes.HOOKS
}
