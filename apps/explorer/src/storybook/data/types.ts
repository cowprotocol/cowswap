import { WithAddress, WithDecimals, WithId, WithSymbolAndName } from '@gnosis.pm/dex-js'
import { Network } from 'types'

export interface DefaultTokenDetails extends Required<WithId & WithSymbolAndName & WithAddress & WithDecimals> {
  label: string
}
export type NetworkMap = Record<keyof typeof Network, Network>
