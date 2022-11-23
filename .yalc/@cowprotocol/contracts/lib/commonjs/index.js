"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.domain = void 0;
/**
 * Return the Gnosis Protocol v2 domain used for signing.
 * @param chainId The EIP-155 chain ID.
 * @param verifyingContract The address of the contract that will verify the
 * signature.
 * @return An EIP-712 compatible typed domain data.
 */
function domain(chainId, verifyingContract) {
    return {
        name: "Gnosis Protocol",
        version: "v2",
        chainId: chainId,
        verifyingContract: verifyingContract,
    };
}
exports.domain = domain;
__exportStar(require("./api"), exports);
__exportStar(require("./deploy"), exports);
__exportStar(require("./interaction"), exports);
__exportStar(require("./order"), exports);
__exportStar(require("./proxy"), exports);
__exportStar(require("./reader"), exports);
__exportStar(require("./settlement"), exports);
__exportStar(require("./sign"), exports);
__exportStar(require("./signers"), exports);
__exportStar(require("./swap"), exports);
__exportStar(require("./vault"), exports);
__exportStar(require("./types/ethers"), exports);
//# sourceMappingURL=index.js.map