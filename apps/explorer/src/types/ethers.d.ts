/**
 * Additional typings extensions for Ethers.js.
 */

import { ethers } from 'ethers'

declare module 'ethers' {
  /**
   * A signature-like type.
   */
  export type SignatureLike = Parameters<typeof ethers.utils.splitSignature>[0]

  /**
   * EIP-712 typed data domain.
   */
  export type TypedDataDomain = Parameters<typeof ethers.utils._TypedDataEncoder.hashDomain>[0]

  interface Signer {
    /**
     * Signs the typed data value with types data structure for domain using the
     * EIP-712 specification.
     */
    _signTypedData?: typeof ethers.VoidSigner.prototype._signTypedData
  }
}
