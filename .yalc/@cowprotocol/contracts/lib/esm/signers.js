var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { _TypedDataEncoder } from "@ethersproject/hash";
import { isJsonRpcProvider, } from "./types/ethers";
/**
 * Wrapper around a TypedDataSigner Signer object that implements `_signTypedData` using
 * `eth_signTypedData_v3` instead of `eth_signTypedData_v4`.
 *
 * Takes a Signer instance on creation.
 * All other Signer methods are proxied to initial instance.
 */
export class TypedDataVersionedSigner {
    constructor(signer, version) {
        this._isSigner = true;
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
    _signTypedData(domain, types, data) {
        return __awaiter(this, void 0, void 0, function* () {
            const populated = yield _TypedDataEncoder.resolveNames(domain, types, data, (name) => this.resolveName(name));
            const payload = _TypedDataEncoder.getPayload(populated.domain, types, populated.value);
            const msg = JSON.stringify(payload);
            const address = yield this.getAddress();
            // Actual signing
            return (yield this.provider.send(this._signMethod, [
                address.toLowerCase(),
                msg,
            ]));
        });
    }
    // --- start boilerplate proxy methods ---
    getAddress() {
        return this.signer.getAddress();
    }
    signMessage(message) {
        return this.signer.signMessage(message);
    }
    signTransaction(transaction) {
        return this.signer.signTransaction(transaction);
    }
    connect(provider) {
        return this.signer.connect(provider);
    }
    getBalance(blockTag) {
        return this.signer.getBalance(blockTag);
    }
    getTransactionCount(blockTag) {
        return this.signer.getTransactionCount(blockTag);
    }
    estimateGas(transaction) {
        return this.signer.estimateGas(transaction);
    }
    call(transaction, blockTag) {
        return this.signer.call(transaction, blockTag);
    }
    sendTransaction(transaction) {
        return this.signer.sendTransaction(transaction);
    }
    getChainId() {
        return this.signer.getChainId();
    }
    getGasPrice() {
        return this.signer.getGasPrice();
    }
    getFeeData() {
        return this.signer.getFeeData();
    }
    resolveName(name) {
        return this.signer.resolveName(name);
    }
    checkTransaction(transaction) {
        return this.signer.checkTransaction(transaction);
    }
    populateTransaction(transaction) {
        return this.signer.populateTransaction(transaction);
    }
    _checkProvider(operation) {
        return this.signer._checkProvider(operation);
    }
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
export class IntChainIdTypedDataV4Signer {
    constructor(signer) {
        this._isSigner = true;
        this.signer = signer;
        if (!signer.provider) {
            throw new Error("Signer does not have a provider set");
        }
        if (!isJsonRpcProvider(signer.provider)) {
            throw new Error("Provider must be of type JsonRpcProvider");
        }
        this.provider = signer.provider;
    }
    _signTypedData(domain, types, data) {
        return __awaiter(this, void 0, void 0, function* () {
            const populated = yield _TypedDataEncoder.resolveNames(domain, types, data, (name) => this.resolveName(name));
            const payload = _TypedDataEncoder.getPayload(populated.domain, types, populated.value);
            // Making `chainId` an int since Latest Metamask version (9.6.0) breaks otherwise
            payload.domain.chainId = parseInt(payload.domain.chainId, 10);
            const msg = JSON.stringify(payload);
            const address = yield this.getAddress();
            // Actual signing
            return (yield this.provider.send("eth_signTypedData_v4", [
                address.toLowerCase(),
                msg,
            ]));
        });
    }
    // --- start boilerplate proxy methods ---
    getAddress() {
        return this.signer.getAddress();
    }
    signMessage(message) {
        return this.signer.signMessage(message);
    }
    signTransaction(transaction) {
        return this.signer.signTransaction(transaction);
    }
    connect(provider) {
        return this.signer.connect(provider);
    }
    getBalance(blockTag) {
        return this.signer.getBalance(blockTag);
    }
    getTransactionCount(blockTag) {
        return this.signer.getTransactionCount(blockTag);
    }
    estimateGas(transaction) {
        return this.signer.estimateGas(transaction);
    }
    call(transaction, blockTag) {
        return this.signer.call(transaction, blockTag);
    }
    sendTransaction(transaction) {
        return this.signer.sendTransaction(transaction);
    }
    getChainId() {
        return this.signer.getChainId();
    }
    getGasPrice() {
        return this.signer.getGasPrice();
    }
    getFeeData() {
        return this.signer.getFeeData();
    }
    resolveName(name) {
        return this.signer.resolveName(name);
    }
    checkTransaction(transaction) {
        return this.signer.checkTransaction(transaction);
    }
    populateTransaction(transaction) {
        return this.signer.populateTransaction(transaction);
    }
    _checkProvider(operation) {
        return this.signer._checkProvider(operation);
    }
}
//# sourceMappingURL=signers.js.map