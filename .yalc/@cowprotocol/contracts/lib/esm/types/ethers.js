/**
 * Checks whether the specified signer is a typed data signer.
 */
export function isTypedDataSigner(signer) {
    return "_signTypedData" in signer;
}
/**
 * Checks whether the specified provider is a JSON RPC provider.
 */
export function isJsonRpcProvider(provider) {
    return "send" in provider;
}
//# sourceMappingURL=ethers.js.map