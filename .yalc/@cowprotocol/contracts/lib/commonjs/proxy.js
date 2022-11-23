"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.proxyInterface = exports.EIP173_PROXY_ABI = exports.ownerAddress = exports.implementationAddress = void 0;
var ethers_1 = require("ethers");
/**
 * Compute an EIP-1967 slot for the specified name. The proxy contract used by
 * `hardhat-deploy` implements EIP-1967 (Standard Proxy Storage Slot).
 *
 * <https://eips.ethereum.org/EIPS/eip-1967>.
 */
function slot(name) {
    return ethers_1.ethers.utils.defaultAbiCoder.encode(["bytes32"], [ethers_1.BigNumber.from(ethers_1.ethers.utils.id(name)).sub(1)]);
}
var IMPLEMENTATION_STORAGE_SLOT = slot("eip1967.proxy.implementation");
var OWNER_STORAGE_SLOT = slot("eip1967.proxy.admin");
/**
 * Returns the address of the implementation of an EIP-1967-compatible proxy
 * from its address.
 *
 * @param proxy Address of the proxy contract.
 * @returns The address of the contract storing the proxy implementation.
 */
function implementationAddress(provider, proxy) {
    return __awaiter(this, void 0, void 0, function () {
        var implementation, _a, _b, _c;
        return __generator(this, function (_d) {
            switch (_d.label) {
                case 0:
                    _b = (_a = ethers_1.ethers.utils.defaultAbiCoder).decode;
                    _c = [["address"]];
                    return [4 /*yield*/, provider.getStorageAt(proxy, IMPLEMENTATION_STORAGE_SLOT)];
                case 1:
                    implementation = _b.apply(_a, _c.concat([_d.sent()]))[0];
                    return [2 /*return*/, implementation];
            }
        });
    });
}
exports.implementationAddress = implementationAddress;
/**
 * Returns the address of the implementation of an EIP-1967-compatible proxy
 * from its address.
 *
 * @param proxy Address of the proxy contract.
 * @returns The address of the administrator of the proxy.
 */
function ownerAddress(provider, proxy) {
    return __awaiter(this, void 0, void 0, function () {
        var owner, _a, _b, _c;
        return __generator(this, function (_d) {
            switch (_d.label) {
                case 0:
                    _b = (_a = ethers_1.ethers.utils.defaultAbiCoder).decode;
                    _c = [["address"]];
                    return [4 /*yield*/, provider.getStorageAt(proxy, OWNER_STORAGE_SLOT)];
                case 1:
                    owner = _b.apply(_a, _c.concat([_d.sent()]))[0];
                    return [2 /*return*/, owner];
            }
        });
    });
}
exports.ownerAddress = ownerAddress;
/**
 * EIP-173 proxy ABI in "human-readable ABI" format. The proxy used by the
 * deployment plugin implements this interface, and copying it here avoids
 * pulling in `hardhat` as a dependency for just this ABI.
 *
 * <https://eips.ethereum.org/EIPS/eip-173#specification>
 */
exports.EIP173_PROXY_ABI = [
    "event OwnershipTransferred(address indexed previousOwner, address indexed newOwner)",
    "function owner() view external returns(address)",
    "function transferOwnership(address newOwner) external",
    "function supportsInterface(bytes4 interfaceID) external view returns (bool)",
];
/**
 * Returns the proxy interface for the specified address.
 *
 * @param contract The proxy contract to return a proxy interface for.
 * @returns A Ethers.js contract instance for interacting with the proxy.
 */
function proxyInterface(contract) {
    var _a;
    return new ethers_1.Contract(contract.address, exports.EIP173_PROXY_ABI, (_a = contract.signer) !== null && _a !== void 0 ? _a : contract.provider);
}
exports.proxyInterface = proxyInterface;
//# sourceMappingURL=proxy.js.map