/**
 * useSearchState - Search slot state
 */
import { useSelectTokenWidgetState } from '../../../hooks/useSelectTokenWidgetState'

export interface SearchState {
  onPressEnter?: () => void
}

export function useSearchState(): SearchState {
  const widgetState = useSelectTokenWidgetState()

  return {
    onPressEnter: widgetState.onInputPressEnter,
  }
}
