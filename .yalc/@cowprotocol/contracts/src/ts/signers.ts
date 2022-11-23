import { _TypedDataEncoder } from "@ethersproject/hash";
import type { JsonRpcProvider } from "@ethersproject/providers";
import { ethers, Signer } from "ethers";

import {
  isJsonRpcProvider,
  TypedDataDomain,
  TypedDataSigner,
  TypedDataTypes,
} from "./types/ethers";

/**
 * Wrapper around a TypedDataSigner Signer object that implements `_signTypedData` using
 * `eth_signTypedData_v3` instead of `eth_signTypedData_v4`.
 *
 * Takes a Signer instance on creation.
 * All other Signer methods are proxied to initial instance.
 */
export class TypedDataVersionedSigner implements TypedDataSigner {
  signer: Signer;
  provider: JsonRpcProvider;
  _isSigner = true;
  _signMethod: string;

  constructor(signer: Signer, version?: "v1" | "v2" | "v3" | "v4") {
    this.signer = signer;
    const versionSufix = version ? "_" + version : "";
    this._signMethod = "eth_signTypedData" + versionSufix;

    if (!signer.provider) {
      throw new Error("Signer does not have a provider set");
    }
    if (!isJsonRpcProvider(signer.provider)) {
      throw new Error("Provider must be of type JsonRpcProvider");
    }

    this.provider = signer.provider;
  }

  async _signTypedData(
    domain: TypedDataDomain,
    types: TypedDataTypes,
    data: Record<string, unknown>,
  ): Promise<string> {
    const populated = await _TypedDataEncoder.resolveNames(
      domain,
      types,
      data,
      (name: string) => this.resolveName(name),
    );

    const payload = _TypedDataEncoder.getPayload(
      populated.domain,
      types,
      populated.value,
    );
    const msg = JSON.stringify(payload);

    const address = await this.getAddress();

    // Actual signing
    return (await this.provider.send(this._signMethod, [
      address.toLowerCase(),
      msg,
    ])) as string;
  }

  // --- start boilerplate proxy methods ---

  getAddress(): Promise<string> {
    return this.signer.getAddress();
  }
  signMessage(message: string | ethers.utils.Bytes): Promise<string> {
    return this.signer.signMessage(message);
  }
  signTransaction(
    transaction: ethers.utils.Deferrable<ethers.providers.TransactionRequest>,
  ): Promise<string> {
    return this.signer.signTransaction(transaction);
  }
  connect(provider: ethers.providers.Provider): ethers.Signer {
    return this.signer.connect(provider);
  }
  getBalance(blockTag?: ethers.providers.BlockTag): Promise<ethers.BigNumber> {
    return this.signer.getBalance(blockTag);
  }
  getTransactionCount(blockTag?: ethers.providers.BlockTag): Promise<number> {
    return this.signer.getTransactionCount(blockTag);
  }
  estimateGas(
    transaction: ethers.utils.Deferrable<ethers.providers.TransactionRequest>,
  ): Promise<ethers.BigNumber> {
    return this.signer.estimateGas(transaction);
  }
  call(
    transaction: ethers.utils.Deferrable<ethers.providers.TransactionRequest>,
    blockTag?: ethers.providers.BlockTag,
  ): Promise<string> {
    return this.signer.call(transaction, blockTag);
  }
  sendTransaction(
    transaction: ethers.utils.Deferrable<ethers.providers.TransactionRequest>,
  ): Promise<ethers.providers.TransactionResponse> {
    return this.signer.sendTransaction(transaction);
  }
  getChainId(): Promise<number> {
    return this.signer.getChainId();
  }
  getGasPrice(): Promise<ethers.BigNumber> {
    return this.signer.getGasPrice();
  }
  getFeeData(): Promise<ethers.providers.FeeData> {
    return this.signer.getFeeData();
  }
  resolveName(name: string): Promise<string> {
    return this.signer.resolveName(name);
  }
  checkTransaction(
    transaction: ethers.utils.Deferrable<ethers.providers.TransactionRequest>,
  ): ethers.utils.Deferrable<ethers.providers.TransactionRequest> {
    return this.signer.checkTransaction(transaction);
  }
  populateTransaction(
    transaction: ethers.utils.Deferrable<ethers.providers.TransactionRequest>,
  ): Promise<ethers.providers.TransactionRequest> {
    return this.signer.populateTransaction(transaction);
  }
  _checkProvider(operation?: string): void {
    return this.signer._checkProvider(operation);
  }

  // --- end boilerplate proxy methods ---
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
export class IntChainIdTypedDataV4Signer implements TypedDataSigner {
  signer: Signer;
  provider: JsonRpcProvider;
  _isSigner = true;

  constructor(signer: Signer) {
    this.signer = signer;

    if (!signer.provider) {
      throw new Error("Signer does not have a provider set");
    }
    if (!isJsonRpcProvider(signer.provider)) {
      throw new Error("Provider must be of type JsonRpcProvider");
    }

    this.provider = signer.provider;
  }

  async _signTypedData(
    domain: TypedDataDomain,
    types: TypedDataTypes,
    data: Record<string, unknown>,
  ): Promise<string> {
    const populated = await _TypedDataEncoder.resolveNames(
      domain,
      types,
      data,
      (name: string) => this.resolveName(name),
    );

    const payload = _TypedDataEncoder.getPayload(
      populated.domain,
      types,
      populated.value,
    );
    // Making `chainId` an int since Latest Metamask version (9.6.0) breaks otherwise
    payload.domain.chainId = parseInt(payload.domain.chainId, 10);
    const msg = JSON.stringify(payload);

    const address = await this.getAddress();

    // Actual signing
    return (await this.provider.send("eth_signTypedData_v4", [
      address.toLowerCase(),
      msg,
    ])) as string;
  }

  // --- start boilerplate proxy methods ---

  getAddress(): Promise<string> {
    return this.signer.getAddress();
  }
  signMessage(message: string | ethers.utils.Bytes): Promise<string> {
    return this.signer.signMessage(message);
  }
  signTransaction(
    transaction: ethers.utils.Deferrable<ethers.providers.TransactionRequest>,
  ): Promise<string> {
    return this.signer.signTransaction(transaction);
  }
  connect(provider: ethers.providers.Provider): ethers.Signer {
    return this.signer.connect(provider);
  }
  getBalance(blockTag?: ethers.providers.BlockTag): Promise<ethers.BigNumber> {
    return this.signer.getBalance(blockTag);
  }
  getTransactionCount(blockTag?: ethers.providers.BlockTag): Promise<number> {
    return this.signer.getTransactionCount(blockTag);
  }
  estimateGas(
    transaction: ethers.utils.Deferrable<ethers.providers.TransactionRequest>,
  ): Promise<ethers.BigNumber> {
    return this.signer.estimateGas(transaction);
  }
  call(
    transaction: ethers.utils.Deferrable<ethers.providers.TransactionRequest>,
    blockTag?: ethers.providers.BlockTag,
  ): Promise<string> {
    return this.signer.call(transaction, blockTag);
  }
  sendTransaction(
    transaction: ethers.utils.Deferrable<ethers.providers.TransactionRequest>,
  ): Promise<ethers.providers.TransactionResponse> {
    return this.signer.sendTransaction(transaction);
  }
  getChainId(): Promise<number> {
    return this.signer.getChainId();
  }
  getGasPrice(): Promise<ethers.BigNumber> {
    return this.signer.getGasPrice();
  }
  getFeeData(): Promise<ethers.providers.FeeData> {
    return this.signer.getFeeData();
  }
  resolveName(name: string): Promise<string> {
    return this.signer.resolveName(name);
  }
  checkTransaction(
    transaction: ethers.utils.Deferrable<ethers.providers.TransactionRequest>,
  ): ethers.utils.Deferrable<ethers.providers.TransactionRequest> {
    return this.signer.checkTransaction(transaction);
  }
  populateTransaction(
    transaction: ethers.utils.Deferrable<ethers.providers.TransactionRequest>,
  ): Promise<ethers.providers.TransactionRequest> {
    return this.signer.populateTransaction(transaction);
  }
  _checkProvider(operation?: string): void {
    return this.signer._checkProvider(operation);
  }

  // --- end boilerplate proxy methods ---
}
