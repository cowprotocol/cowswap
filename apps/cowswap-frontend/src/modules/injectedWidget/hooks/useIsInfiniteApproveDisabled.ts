import { useInjectedWidgetParams } from 'entities/injectedWidget'

export function useIsInfiniteApproveDisabled(): boolean {
  return Boolean(useInjectedWidgetParams().disableInfiniteApprove)
}
