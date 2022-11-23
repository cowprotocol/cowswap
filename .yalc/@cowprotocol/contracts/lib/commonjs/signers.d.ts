import type { JsonRpcProvider } from "@ethersproject/providers";
import { ethers, Signer } from "ethers";
import { TypedDataDomain, TypedDataSigner, TypedDataTypes } from "./types/ethers";
/**
 * Wrapper around a TypedDataSigner Signer object that implements `_signTypedData` using
 * `eth_signTypedData_v3` instead of `eth_signTypedData_v4`.
 *
 * Takes a Signer instance on creation.
 * All other Signer methods are proxied to initial instance.
 */
export declare class TypedDataVersionedSigner implements TypedDataSigner {
    signer: Signer;
    provider: JsonRpcProvider;
    _isSigner: boolean;
    _signMethod: string;
    constructor(signer: Signer, version?: "v1" | "v2" | "v3" | "v4");
    _signTypedData(domain: TypedDataDomain, types: TypedDataTypes, data: Record<string, unknown>): Promise<string>;
    getAddress(): Promise<string>;
    signMessage(message: string | ethers.utils.Bytes): Promise<string>;
    signTransaction(transaction: ethers.utils.Deferrable<ethers.providers.TransactionRequest>): Promise<string>;
    connect(provider: ethers.providers.Provider): ethers.Signer;
    getBalance(blockTag?: ethers.providers.BlockTag): Promise<ethers.BigNumber>;
    getTransactionCount(blockTag?: ethers.providers.BlockTag): Promise<number>;
    estimateGas(transaction: ethers.utils.Deferrable<ethers.providers.TransactionRequest>): Promise<ethers.BigNumber>;
    call(transaction: ethers.utils.Deferrable<ethers.providers.TransactionRequest>, blockTag?: ethers.providers.BlockTag): Promise<string>;
    sendTransaction(transaction: ethers.utils.Deferrable<ethers.providers.TransactionRequest>): Promise<ethers.providers.TransactionResponse>;
    getChainId(): Promise<number>;
    getGasPrice(): Promise<ethers.BigNumber>;
    getFeeData(): Promise<ethers.providers.FeeData>;
    resolveName(name: string): Promise<string>;
    checkTransaction(transaction: ethers.utils.Deferrable<ethers.providers.TransactionRequest>): ethers.utils.Deferrable<ethers.providers.TransactionRequest>;
    populateTransaction(transaction: ethers.utils.Deferrable<ethers.providers.TransactionRequest>): Promise<ethers.providers.TransactionRequest>;
    _checkProvider(operation?: string): void;
}
/**
 * Wrapper around a TypedDataSigner Signer object that implements `_signTypedData` using
 * `eth_signTypedData_v4` as usual.
 * The difference here is that the domain `chainId` is transformed to a `number`.
 * That's done to circumvent a bug introduced in the latest Metamask version (9.6.0)
 * that no longer accepts a string for domain `chainId`.
 * See for more details https://github.com/MetaMask/metamask-extension/issues/11308.
 *
 * Takes a Signer instance on creation.
 * All other Signer methods are proxied to initial instance.
 */
export declare class IntChainIdTypedDataV4Signer implements TypedDataSigner {
    signer: Signer;
    provider: JsonRpcProvider;
    _isSigner: boolean;
    constructor(signer: Signer);
    _signTypedData(domain: TypedDataDomain, types: TypedDataTypes, data: Record<string, unknown>): Promise<string>;
    getAddress(): Promise<string>;
    signMessage(message: string | ethers.utils.Bytes): Promise<string>;
    signTransaction(transaction: ethers.utils.Deferrable<ethers.providers.TransactionRequest>): Promise<string>;
    connect(provider: ethers.providers.Provider): ethers.Signer;
    getBalance(blockTag?: ethers.providers.BlockTag): Promise<ethers.BigNumber>;
    getTransactionCount(blockTag?: ethers.providers.BlockTag): Promise<number>;
    estimateGas(transaction: ethers.utils.Deferrable<ethers.providers.TransactionRequest>): Promise<ethers.BigNumber>;
    call(transaction: ethers.utils.Deferrable<ethers.providers.TransactionRequest>, blockTag?: ethers.providers.BlockTag): Promise<string>;
    sendTransaction(transaction: ethers.utils.Deferrable<ethers.providers.TransactionRequest>): Promise<ethers.providers.TransactionResponse>;
    getChainId(): Promise<number>;
    getGasPrice(): Promise<ethers.BigNumber>;
    getFeeData(): Promise<ethers.providers.FeeData>;
    resolveName(name: string): Promise<string>;
    checkTransaction(transaction: ethers.utils.Deferrable<ethers.providers.TransactionRequest>): ethers.utils.Deferrable<ethers.providers.TransactionRequest>;
    populateTransaction(transaction: ethers.utils.Deferrable<ethers.providers.TransactionRequest>): Promise<ethers.providers.TransactionRequest>;
    _checkProvider(operation?: string): void;
}
