/**
 * useSearchState - Returns onPressEnter callback for search input
 */
import { useSelectTokenWidgetState } from '../../../hooks/useSelectTokenWidgetState'

export function useSearchState(): (() => void) | undefined {
  const widgetState = useSelectTokenWidgetState()
  return widgetState.onInputPressEnter
}
