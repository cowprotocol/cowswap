"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isJsonRpcProvider = exports.isTypedDataSigner = void 0;
/**
 * Checks whether the specified signer is a typed data signer.
 */
function isTypedDataSigner(signer) {
    return "_signTypedData" in signer;
}
exports.isTypedDataSigner = isTypedDataSigner;
/**
 * Checks whether the specified provider is a JSON RPC provider.
 */
function isJsonRpcProvider(provider) {
    return "send" in provider;
}
exports.isJsonRpcProvider = isJsonRpcProvider;
//# sourceMappingURL=ethers.js.map