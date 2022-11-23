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
exports.grantRequiredRoles = exports.VAULT_INTERFACE = void 0;
var ethers_1 = require("ethers");
/**
 * Balancer Vault partial ABI interface.
 *
 * This definition only contains the Vault methods that are used by GPv2 Vault
 * relayer. It is copied here to avoid relying on build artifacts.
 */
exports.VAULT_INTERFACE = new ethers_1.ethers.utils.Interface([
    "function manageUserBalance((uint8, address, uint256, address, address)[])",
    "function batchSwap(uint8, (bytes32, uint256, uint256, uint256, bytes)[], address[], (address, bool, address, bool), int256[], uint256)",
]);
/**
 * Grants the required roles to the specified Vault relayer.
 *
 * This method is intended to be called by the Balancer Vault admin, and **not**
 * traders. It is included in the exported TypeScript library for completeness
 * and "documentation".
 *
 * @param authorizer The Vault authorizer contract that manages access.
 * @param vaultAddress The address to the Vault.
 * @param vaultRelayerAddress The address to the GPv2 Vault relayer contract.
 */
function grantRequiredRoles(authorizer, vaultAddress, vaultRelayerAddress) {
    return __awaiter(this, void 0, void 0, function () {
        var _a, _b, _i, name_1;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    _a = [];
                    for (_b in exports.VAULT_INTERFACE.functions)
                        _a.push(_b);
                    _i = 0;
                    _c.label = 1;
                case 1:
                    if (!(_i < _a.length)) return [3 /*break*/, 4];
                    name_1 = _a[_i];
                    return [4 /*yield*/, authorizer.grantRole(ethers_1.ethers.utils.solidityKeccak256(["uint256", "bytes4"], [vaultAddress, exports.VAULT_INTERFACE.getSighash(name_1)]), vaultRelayerAddress)];
                case 2:
                    _c.sent();
                    _c.label = 3;
                case 3:
                    _i++;
                    return [3 /*break*/, 1];
                case 4: return [2 /*return*/];
            }
        });
    });
}
exports.grantRequiredRoles = grantRequiredRoles;
//# sourceMappingURL=vault.js.map