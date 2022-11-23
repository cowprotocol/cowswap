import type { JsonRpcProvider, Provider } from "@ethersproject/providers";
import type { ethers, Signer } from "ethers";
/**
 * A signature-like type.
 */
export declare type SignatureLike = Parameters<typeof ethers.utils.splitSignature>[0];
/**
 * EIP-712 typed data domain.
 */
export declare type TypedDataDomain = Parameters<typeof ethers.utils._TypedDataEncoder.hashDomain>[0];
/**
 * EIP-712 typed data type definitions.
 */
export declare type TypedDataTypes = Parameters<typeof ethers.utils._TypedDataEncoder.hashStruct>[1];
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
export declare function isTypedDataSigner(signer: Signer): signer is TypedDataSigner;
/**
 * Checks whether the specified provider is a JSON RPC provider.
 */
export declare function isJsonRpcProvider(provider: Provider): provider is JsonRpcProvider;
