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
exports.IntChainIdTypedDataV4Signer = exports.TypedDataVersionedSigner = void 0;
var hash_1 = require("@ethersproject/hash");
var ethers_1 = require("./types/ethers");
/**
 * Wrapper around a TypedDataSigner Signer object that implements `_signTypedData` using
 * `eth_signTypedData_v3` instead of `eth_signTypedData_v4`.
 *
 * Takes a Signer instance on creation.
 * All other Signer methods are proxied to initial instance.
 */
var TypedDataVersionedSigner = /** @class */ (function () {
    function TypedDataVersionedSigner(signer, version) {
        this._isSigner = true;
        this.signer = signer;
        var versionSufix = version ? "_" + version : "";
        this._signMethod = "eth_signTypedData" + versionSufix;
        if (!signer.provider) {
            throw new Error("Signer does not have a provider set");
        }
        if (!(0, ethers_1.isJsonRpcProvider)(signer.provider)) {
            throw new Error("Provider must be of type JsonRpcProvider");
        }
        this.provider = signer.provider;
    }
    TypedDataVersionedSigner.prototype._signTypedData = function (domain, types, data) {
        return __awaiter(this, void 0, void 0, function () {
            var populated, payload, msg, address;
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, hash_1._TypedDataEncoder.resolveNames(domain, types, data, function (name) { return _this.resolveName(name); })];
                    case 1:
                        populated = _a.sent();
                        payload = hash_1._TypedDataEncoder.getPayload(populated.domain, types, populated.value);
                        msg = JSON.stringify(payload);
                        return [4 /*yield*/, this.getAddress()];
                    case 2:
                        address = _a.sent();
                        return [4 /*yield*/, this.provider.send(this._signMethod, [
                                address.toLowerCase(),
                                msg,
                            ])];
                    case 3: 
                    // Actual signing
                    return [2 /*return*/, (_a.sent())];
                }
            });
        });
    };
    // --- start boilerplate proxy methods ---
    TypedDataVersionedSigner.prototype.getAddress = function () {
        return this.signer.getAddress();
    };
    TypedDataVersionedSigner.prototype.signMessage = function (message) {
        return this.signer.signMessage(message);
    };
    TypedDataVersionedSigner.prototype.signTransaction = function (transaction) {
        return this.signer.signTransaction(transaction);
    };
    TypedDataVersionedSigner.prototype.connect = function (provider) {
        return this.signer.connect(provider);
    };
    TypedDataVersionedSigner.prototype.getBalance = function (blockTag) {
        return this.signer.getBalance(blockTag);
    };
    TypedDataVersionedSigner.prototype.getTransactionCount = function (blockTag) {
        return this.signer.getTransactionCount(blockTag);
    };
    TypedDataVersionedSigner.prototype.estimateGas = function (transaction) {
        return this.signer.estimateGas(transaction);
    };
    TypedDataVersionedSigner.prototype.call = function (transaction, blockTag) {
        return this.signer.call(transaction, blockTag);
    };
    TypedDataVersionedSigner.prototype.sendTransaction = function (transaction) {
        return this.signer.sendTransaction(transaction);
    };
    TypedDataVersionedSigner.prototype.getChainId = function () {
        return this.signer.getChainId();
    };
    TypedDataVersionedSigner.prototype.getGasPrice = function () {
        return this.signer.getGasPrice();
    };
    TypedDataVersionedSigner.prototype.getFeeData = function () {
        return this.signer.getFeeData();
    };
    TypedDataVersionedSigner.prototype.resolveName = function (name) {
        return this.signer.resolveName(name);
    };
    TypedDataVersionedSigner.prototype.checkTransaction = function (transaction) {
        return this.signer.checkTransaction(transaction);
    };
    TypedDataVersionedSigner.prototype.populateTransaction = function (transaction) {
        return this.signer.populateTransaction(transaction);
    };
    TypedDataVersionedSigner.prototype._checkProvider = function (operation) {
        return this.signer._checkProvider(operation);
    };
    return TypedDataVersionedSigner;
}());
exports.TypedDataVersionedSigner = TypedDataVersionedSigner;
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
var IntChainIdTypedDataV4Signer = /** @class */ (function () {
    function IntChainIdTypedDataV4Signer(signer) {
        this._isSigner = true;
        this.signer = signer;
        if (!signer.provider) {
            throw new Error("Signer does not have a provider set");
        }
        if (!(0, ethers_1.isJsonRpcProvider)(signer.provider)) {
            throw new Error("Provider must be of type JsonRpcProvider");
        }
        this.provider = signer.provider;
    }
    IntChainIdTypedDataV4Signer.prototype._signTypedData = function (domain, types, data) {
        return __awaiter(this, void 0, void 0, function () {
            var populated, payload, msg, address;
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, hash_1._TypedDataEncoder.resolveNames(domain, types, data, function (name) { return _this.resolveName(name); })];
                    case 1:
                        populated = _a.sent();
                        payload = hash_1._TypedDataEncoder.getPayload(populated.domain, types, populated.value);
                        // Making `chainId` an int since Latest Metamask version (9.6.0) breaks otherwise
                        payload.domain.chainId = parseInt(payload.domain.chainId, 10);
                        msg = JSON.stringify(payload);
                        return [4 /*yield*/, this.getAddress()];
                    case 2:
                        address = _a.sent();
                        return [4 /*yield*/, this.provider.send("eth_signTypedData_v4", [
                                address.toLowerCase(),
                                msg,
                            ])];
                    case 3: 
                    // Actual signing
                    return [2 /*return*/, (_a.sent())];
                }
            });
        });
    };
    // --- start boilerplate proxy methods ---
    IntChainIdTypedDataV4Signer.prototype.getAddress = function () {
        return this.signer.getAddress();
    };
    IntChainIdTypedDataV4Signer.prototype.signMessage = function (message) {
        return this.signer.signMessage(message);
    };
    IntChainIdTypedDataV4Signer.prototype.signTransaction = function (transaction) {
        return this.signer.signTransaction(transaction);
    };
    IntChainIdTypedDataV4Signer.prototype.connect = function (provider) {
        return this.signer.connect(provider);
    };
    IntChainIdTypedDataV4Signer.prototype.getBalance = function (blockTag) {
        return this.signer.getBalance(blockTag);
    };
    IntChainIdTypedDataV4Signer.prototype.getTransactionCount = function (blockTag) {
        return this.signer.getTransactionCount(blockTag);
    };
    IntChainIdTypedDataV4Signer.prototype.estimateGas = function (transaction) {
        return this.signer.estimateGas(transaction);
    };
    IntChainIdTypedDataV4Signer.prototype.call = function (transaction, blockTag) {
        return this.signer.call(transaction, blockTag);
    };
    IntChainIdTypedDataV4Signer.prototype.sendTransaction = function (transaction) {
        return this.signer.sendTransaction(transaction);
    };
    IntChainIdTypedDataV4Signer.prototype.getChainId = function () {
        return this.signer.getChainId();
    };
    IntChainIdTypedDataV4Signer.prototype.getGasPrice = function () {
        return this.signer.getGasPrice();
    };
    IntChainIdTypedDataV4Signer.prototype.getFeeData = function () {
        return this.signer.getFeeData();
    };
    IntChainIdTypedDataV4Signer.prototype.resolveName = function (name) {
        return this.signer.resolveName(name);
    };
    IntChainIdTypedDataV4Signer.prototype.checkTransaction = function (transaction) {
        return this.signer.checkTransaction(transaction);
    };
    IntChainIdTypedDataV4Signer.prototype.populateTransaction = function (transaction) {
        return this.signer.populateTransaction(transaction);
    };
    IntChainIdTypedDataV4Signer.prototype._checkProvider = function (operation) {
        return this.signer._checkProvider(operation);
    };
    return IntChainIdTypedDataV4Signer;
}());
exports.IntChainIdTypedDataV4Signer = IntChainIdTypedDataV4Signer;
//# sourceMappingURL=signers.js.map