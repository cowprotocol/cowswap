import { useTokenListViewState } from './useTokenListViewState'

import { SelectTokenContext } from '../types'

/**
 * Reads the SelectTokenContext from the tokenListViewAtom.
 *
 * This hook replaces the props-based useSelectTokenContext pattern.
 * The controller now hydrates the context to the atom, and consumers
 * read it directly via this hook.
 */
export function useSelectTokenContextFromAtom(): SelectTokenContext {
  const { selectTokenContext } = useTokenListViewState()
  return selectTokenContext
}
