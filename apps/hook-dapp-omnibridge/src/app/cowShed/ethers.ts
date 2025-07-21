// This file was originally part of the cow-sdk but was removed during the SDK refactor
// to decouple from ethers.js. However, it has been temporarily reintroduced here due to
// current integration needs.
//
// Source: https://github.com/cowprotocol/contracts/blob/39d7f4d68e37d14adeaf3c0caca30ea5c1a2fad9/src/ts/types/ethers.ts
import type { Signer } from "@ethersproject/abstract-signer";
import { VoidSigner } from "@ethersproject/abstract-signer";
import { splitSignature } from "@ethersproject/bytes";
import { _TypedDataEncoder } from "@ethersproject/hash";
import type { JsonRpcProvider, Provider } from "@ethersproject/providers";

/**
 * A signature-like type.
 */
export type SignatureLike = Parameters<typeof splitSignature>[0];

/**
 * EIP-712 typed data domain.
 */
export type TypedDataDomain = Parameters<
  typeof _TypedDataEncoder.hashDomain
>[0];

/**
 * EIP-712 typed data type definitions.
 */
export type TypedDataTypes = Parameters<
  typeof _TypedDataEncoder.hashStruct
>[1];

/**
 * Ethers EIP-712 typed data signer interface.
 */
export interface TypedDataSigner extends Signer {
  /**
   * Signs the typed data value with types data structure for domain using the
   * EIP-712 specification.
   */
  _signTypedData: typeof VoidSigner.prototype._signTypedData;
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
