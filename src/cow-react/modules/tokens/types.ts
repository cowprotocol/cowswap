export interface OnchainState<T> {
  value: T
  loading: boolean
  syncing: boolean
  error: boolean
  valid: boolean
}
