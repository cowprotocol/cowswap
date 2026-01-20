import { ReactNode } from 'react'

import { TokenSelectorView } from './TokenSelectorView'

import { ImportListModalProps } from '../../../pure/ImportListModal'
import { ImportTokenModalProps } from '../../../pure/ImportTokenModal'

/**
 * Context passed to custom flow components.
 * Contains information about the current flow and callbacks to control it.
 */
export interface CustomFlowContext {
  /** The target view this flow is associated with */
  targetView: TokenSelectorView
  /** Callback to proceed to the target view (complete the custom flow) */
  onDone: () => void
  /** Callback to cancel and go back to main token list */
  onCancel: () => void
}

/**
 * Maps each view to its modal props type.
 */
export interface ViewPropsMap {
  [TokenSelectorView.ImportToken]: ImportTokenModalProps
  [TokenSelectorView.ImportList]: ImportListModalProps
  [TokenSelectorView.Main]: never
  [TokenSelectorView.Manage]: never
  [TokenSelectorView.LpToken]: never
}

/**
 * result of a custom flow slot.
 * - content: component to render (or null to show base view)
 * - data: additional props to pass to the modal
 */
export interface CustomFlowResult<TView extends TokenSelectorView = TokenSelectorView> {
  content: ReactNode | null
  /** Additional props to merge into the modal */
  data?: Partial<ViewPropsMap[TView]>
}

/**
 * A custom flow slot that can render before or after a target view.
 * returns CustomFlowResult or null to skip this flow entirely.
 */
export type CustomFlowSlot<TView extends TokenSelectorView = TokenSelectorView> = (
  context: CustomFlowContext,
) => CustomFlowResult<TView> | null

/**
 * Configuration for custom flows for a specific view.
 */
export interface ViewFlowConfig<TView extends TokenSelectorView = TokenSelectorView> {
  /** Custom flow to show before the main view. */
  preFlow?: CustomFlowSlot<TView>
  /** Custom flow to show after the main view. */
  postFlow?: CustomFlowSlot<TView>
}

/**
 * Registry mapping view names to their custom flow configurations.
 */
export type CustomFlowsRegistry = {
  [TokenSelectorView.ImportToken]?: ViewFlowConfig<TokenSelectorView.ImportToken>
  [TokenSelectorView.ImportList]?: ViewFlowConfig<TokenSelectorView.ImportList>
  [TokenSelectorView.Main]?: ViewFlowConfig<TokenSelectorView.Main>
  [TokenSelectorView.Manage]?: ViewFlowConfig<TokenSelectorView.Manage>
  [TokenSelectorView.LpToken]?: ViewFlowConfig<TokenSelectorView.LpToken>
}
