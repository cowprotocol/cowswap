import { toKeccak256 } from 'common/utils/toKeccak256'

export class SolanaAppDataMismatchError extends Error {
  constructor(
    readonly signedAppData: string,
    readonly fullAppData: string,
  ) {
    super(`Signed appData ${signedAppData} does not match the appData being registered (${toKeccak256(fullAppData)})`)
    this.name = 'SolanaAppDataMismatchError'
  }
}

/**
 * The order book rejects an order whose appData was not registered under its exact hash, but only after the
 * on-chain transaction it is created by has been paid for, so a mismatch has to stop the flow before signing.
 */
export function assertSignedAppData(signedAppData: string, fullAppData: string): void {
  if (toKeccak256(fullAppData) !== signedAppData) {
    throw new SolanaAppDataMismatchError(signedAppData, fullAppData)
  }
}
