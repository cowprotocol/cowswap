import { ReactNode } from 'react'

import { TokenSelectorView } from './TokenSelectorView'

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
 * A custom flow slot that can render before or after a target view.
 * Returns ReactNode to render, or null to skip this flow.
 */
export type CustomFlowSlot = (context: CustomFlowContext) => ReactNode

/**
 * Configuration for custom flows for a specific view.
 * Allows injecting views before or after the main view.
 */
export interface ViewFlowConfig {
  /** Custom flow to show before the main view. Return null to skip. */
  preFlow?: CustomFlowSlot
  /** Custom flow to show after the main view. Return null to skip. */
  postFlow?: CustomFlowSlot
}

/**
 * Registry mapping view names to their custom flow configurations.
 * This is passed from outside the token selector to configure custom flows.
 *
 * @example
 * // In trade module or other consumer:
 * const customFlows: CustomFlowsRegistry = {
 *   [TokenSelectorView.ImportToken]: {
 *     preFlow: (context) => {
 *       if (needsConsent) {
 *         return <ConsentModal onConfirm={context.onDone} onCancel={context.onCancel} />
 *       }
 *       return null
 *     }
 *   }
 * }
 */
export type CustomFlowsRegistry = Partial<Record<TokenSelectorView, ViewFlowConfig>>
