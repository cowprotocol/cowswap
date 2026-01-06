/**
 * SelectTokenWidget Controller
 *
 * Minimal controller - just handles widget visibility.
 * Token data is fetched directly by components via useTokenListData hook.
 */
import { useWidgetOpenState } from './hooks'

export interface SelectTokenWidgetProps {
  displayLpTokenLists?: boolean
  standalone?: boolean
}

export interface SelectTokenWidgetController {
  isOpen: boolean
}

export function useSelectTokenWidgetController({
  displayLpTokenLists,
  standalone,
}: SelectTokenWidgetProps): SelectTokenWidgetController {
  const { isOpen } = useWidgetOpenState()

  // Note: displayLpTokenLists and standalone are now passed via context
  // to components that need them, rather than hydrating an atom
  void displayLpTokenLists
  void standalone

  return { isOpen }
}
