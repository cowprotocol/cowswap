import type { JsonRpcProvider, Provider } from "@ethersproject/providers";
import type { ethers, Signer } from "ethers";

/**
 * A signature-like type.
 */
export type SignatureLike = Parameters<typeof ethers.utils.splitSignature>[0];

/**
 * EIP-712 typed data domain.
 */
export type TypedDataDomain = Parameters<
  typeof ethers.utils._TypedDataEncoder.hashDomain
>[0];

/**
 * EIP-712 typed data type definitions.
 */
export type TypedDataTypes = Parameters<
  typeof ethers.utils._TypedDataEncoder.hashStruct
>[1];

/**
 * Ethers EIP-712 typed data signer interface.
 */
export interface TypedDataSigner extends Signer {
  /**
   * Signs the typed data value with types data structure for domain using the
   * EIP-712 specification.
   */
  _signTypedData: typeof ethers.VoidSigner.prototype._signTypedData;
}

/**
 * Checks whether the specified signer is a typed data signer.
 */
export function isTypedDataSigner(signer: Signer): signer is TypedDataSigner {
  return "_signTypedData" in signer;
}

/**
 * Checks whether the specified provider is a JSON RPC provider.
 */
export function isJsonRpcProvider(
  provider: Provider,
): provider is JsonRpcProvider {
  return "send" in provider;
}
