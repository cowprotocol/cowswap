import { BigNumber } from '@ethersproject/bignumber'

export interface Erc20MulticallState {
  isLoading: boolean
  values: { [address: string]: BigNumber | undefined }
}
