export enum HookDappType {
  INTERNAL = 'INTERNAL',
  IFRAME = 'IFRAME',
}

export enum HookDappWalletCompatibility {
  EOA = 'EOA',
  SMART_CONTRACT = 'SMART_CONTRACT',
}

/** For custom iframe hook dapps. 64 hex chars = 32 bytes, which is the standard length for a keccak256 hash without 0x. */
export const HOOK_DAPP_ID_LENGTH = 64

/** Dapp id for the permit hook. */
export const PERMIT_HOOK_DAPP_ID = 'cow-swap://libs/hook-dapp-lib/permit'

/** Dapp id for the pollFunds pre-hook embedded in EOA TWAP part appData. */
export const EOA_TWAP_POLL_FUNDS_DAPP_ID = 'cow-swap://libs/hook-dapp-lib/twap/eoa-poll-funds'
