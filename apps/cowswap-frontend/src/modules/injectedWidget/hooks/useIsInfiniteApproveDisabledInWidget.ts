import { useInjectedWidgetParams } from 'entities/injectedWidget'

export function useIsInfiniteApproveDisabledInWidget(): boolean {
  return Boolean(useInjectedWidgetParams().disableInfiniteApprove)
}
