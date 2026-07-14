export interface AddToWalletState {
  state: AddToWalletStateValues
  errorMessage?: string
  autoConnect: boolean
}

export type AddToWalletStateValues = 'unknown' | 'adding' | 'added' | 'error' | 'takingTooLong' | 'connecting'
