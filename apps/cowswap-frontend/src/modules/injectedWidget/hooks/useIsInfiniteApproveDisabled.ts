import { useInjectedWidgetParams } from './useInjectedWidgetParams'

export function useIsInfiniteApproveDisabled(): boolean {
  return Boolean(useInjectedWidgetParams().disableInfiniteApprove)
}
