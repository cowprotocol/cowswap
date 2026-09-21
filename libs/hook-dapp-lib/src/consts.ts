export enum HookDappType {
  INTERNAL = 'INTERNAL',
  IFRAME = 'IFRAME',
}

export enum HookDappWalletCompatibility {
  EOA = 'EOA',
  SMART_CONTRACT = 'SMART_CONTRACT',
}

export const HOOK_DAPP_ID_LENGTH = 64

export const PERMIT_HOOK_DAPP_ID = 'cow-swap://libs/hook-dapp-lib/permit'

/** Dapp id for the pollFunds pre-hook embedded in EOA TWAP part appData. */
export const EOA_TWAP_POLL_FUNDS_DAPP_ID = 'cowswap://twap/eoa-poll-funds'
