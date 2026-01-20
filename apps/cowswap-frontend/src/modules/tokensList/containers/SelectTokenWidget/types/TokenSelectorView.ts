/**
 * All possible views in the token selector widget.
 *
 * Custom flows (like consent) can be configured externally via CustomFlowsRegistry.
 * This keeps the token selector domain-agnostic.
 */
export enum TokenSelectorView {
  /** Main token list view */
  Main,

  /** Import a single token */
  ImportToken,

  /** Import a token list */
  ImportList,

  /** Manage tokens/lists */
  Manage,

  /** LP token view */
  LpToken,
}
