import {
  PersistBalancesAndAllowancesParams,
  usePersistBalancesViaWebCalls,
} from '../hooks/usePersistBalancesViaWebCalls'

export function BalancesRpcCallUpdater(params: PersistBalancesAndAllowancesParams): null {
  usePersistBalancesViaWebCalls(params)

  return null
}
