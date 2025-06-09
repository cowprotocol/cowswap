import { ConnectionType } from '../../api/types'

// TODO: add others
export const HARDWARE_WALLETS = [ConnectionType.TREZOR] as const

export type HardWareWallet = (typeof HARDWARE_WALLETS)[number]

// TODO: Add proper return type annotation
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export const getIsHardWareWallet = (connectionType: ConnectionType) =>
  HARDWARE_WALLETS.includes(connectionType as HardWareWallet)
