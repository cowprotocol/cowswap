export interface Erc20MulticallState {
  isLoading: boolean
  values: { [address: string]: bigint | undefined }
}
