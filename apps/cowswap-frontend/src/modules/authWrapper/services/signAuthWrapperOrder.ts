import { size, type Address, type Hex, type WalletClient } from 'viem'

import { buildWrapperOrderTypedData } from '../utils/buildWrapperOrderTypedData'
import { computeOrderAppData, computeOrderAppDataFromParts } from '../utils/computeOrderAppData'
import { encodeWrapperParams } from '../utils/encodeWrapperParams'

import type { AuthWrapperOrderAuthorization, AuthWrapperOrderToSign, ResolvedAuthWrapper } from '../authWrapper.types'

const SIGNATURE_LENGTH_BYTES = 65
/** `v` values below this are the compact `{0, 1}` form some wallets still emit. */
const V_OFFSET = 27

export interface SignAuthWrapperOrderParams {
  wrapper: ResolvedAuthWrapper
  chainId: number
  account: Address
  /** The unsigned CoW order. Its own `appData` is ignored; the envelope replaces it. */
  order: AuthWrapperOrderToSign
  /** The ordinary CoW app-data hash, i.e. `keccak256(fullAppData)`. */
  nestedAppData: Hex
  walletClient: WalletClient
}

export class AuthWrapperSignatureError extends Error {}

/**
 * `CowAuthWrapper._commitOrder` reads `signature[64] == 0` as "no ECDSA signature —
 * check the pre-approved-hash registry instead". A wallet that returns the compact
 * `v ∈ {0, 1}` form would therefore have a perfectly good signature silently routed
 * down the pre-approval path and rejected as `Unauthorized`, so normalise it to the
 * `{27, 28}` form `ECDSA.recoverCalldata` expects.
 */
export function normalizeSignatureV(signature: Hex): Hex {
  if (size(signature) !== SIGNATURE_LENGTH_BYTES) {
    throw new AuthWrapperSignatureError(
      `Expected a ${SIGNATURE_LENGTH_BYTES}-byte wrapper authorization, got ${size(signature)} bytes.`,
    )
  }

  const v = Number.parseInt(signature.slice(-2), 16)

  if (v === 27 || v === 28) return signature

  if (v === 0 || v === 1) {
    return `${signature.slice(0, -2)}${(v + V_OFFSET).toString(16)}` as Hex
  }

  throw new AuthWrapperSignatureError(`Unsupported signature v value: ${v}.`)
}

/**
 * Signs a CoW order in the wrapper's EIP-712 domain and returns everything a solver
 * needs to rebuild the wrapper's `wrapperData` blob.
 *
 * The returned `signature` is NOT the order's own signature — the order is settled
 * under EIP-1271 with the wrapper as verifier. This is the separate authorization the
 * wrapper checks in `_wrap`, before any of its side effects run.
 */
export async function signAuthWrapperOrder({
  wrapper,
  chainId,
  account,
  order,
  nestedAppData,
  walletClient,
}: SignAuthWrapperOrderParams): Promise<AuthWrapperOrderAuthorization> {
  const orderAppData = computeOrderAppData(wrapper, nestedAppData)

  // Cheap invariant check: our derived WRAPPER_AND_APP_DATA_TYPE_HASH must agree with
  // viem's canonical encoder. If it does not, the wallet would sign a digest the
  // wrapper cannot reproduce, and the order could never settle.
  if (computeOrderAppDataFromParts(wrapper, nestedAppData) !== orderAppData) {
    throw new AuthWrapperSignatureError(
      'Wrapper app-data envelope hash is inconsistent; refusing to sign an order the wrapper cannot verify.',
    )
  }

  const typedData = buildWrapperOrderTypedData(wrapper, chainId, order, nestedAppData)

  const signature = await walletClient.signTypedData({
    account,
    domain: typedData.domain,
    types: typedData.types,
    primaryType: typedData.primaryType,
    message: typedData.message,
  })

  return {
    address: wrapper.address,
    nestedAppData,
    orderAppData,
    params: encodeWrapperParams(wrapper),
    signature: normalizeSignatureV(signature),
  }
}
