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
exports.decodeEip1271SignatureData = exports.encodeEip1271SignatureData = exports.signOrderCancellation = exports.signOrder = exports.SigningScheme = exports.PRE_SIGNED = exports.EIP1271_MAGICVALUE = void 0;
var ethers_1 = require("ethers");
var order_1 = require("./order");
var ethers_2 = require("./types/ethers");
/**
 * Value returned by a call to `isValidSignature` if the signature was verified
 * successfully. The value is defined in the EIP-1271 standard as:
 * bytes4(keccak256("isValidSignature(bytes32,bytes)"))
 */
exports.EIP1271_MAGICVALUE = ethers_1.ethers.utils.hexDataSlice(ethers_1.ethers.utils.id("isValidSignature(bytes32,bytes)"), 0, 4);
/**
 * Marker value indicating a presignature is set.
 */
exports.PRE_SIGNED = ethers_1.ethers.utils.id("GPv2Signing.Scheme.PreSign");
/**
 * The signing scheme used to sign the order.
 */
var SigningScheme;
(function (SigningScheme) {
    /**
     * The EIP-712 typed data signing scheme. This is the preferred scheme as it
     * provides more infomation to wallets performing the signature on the data
     * being signed.
     *
     * <https://github.com/ethereum/EIPs/blob/master/EIPS/eip-712.md#definition-of-domainseparator>
     */
    SigningScheme[SigningScheme["EIP712"] = 0] = "EIP712";
    /**
     * Message signed using eth_sign RPC call.
     */
    SigningScheme[SigningScheme["ETHSIGN"] = 1] = "ETHSIGN";
    /**
     * Smart contract signatures as defined in EIP-1271.
     *
     * <https://eips.ethereum.org/EIPS/eip-1271>
     */
    SigningScheme[SigningScheme["EIP1271"] = 2] = "EIP1271";
    /**
     * Pre-signed order.
     */
    SigningScheme[SigningScheme["PRESIGN"] = 3] = "PRESIGN";
})(SigningScheme = exports.SigningScheme || (exports.SigningScheme = {}));
function ecdsaSignTypedData(scheme, owner, domain, types, data) {
    return __awaiter(this, void 0, void 0, function () {
        var signature, _a;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    signature = null;
                    _a = scheme;
                    switch (_a) {
                        case SigningScheme.EIP712: return [3 /*break*/, 1];
                        case SigningScheme.ETHSIGN: return [3 /*break*/, 3];
                    }
                    return [3 /*break*/, 5];
                case 1:
                    if (!(0, ethers_2.isTypedDataSigner)(owner)) {
                        throw new Error("signer does not support signing typed data");
                    }
                    return [4 /*yield*/, owner._signTypedData(domain, types, data)];
                case 2:
                    signature = _b.sent();
                    return [3 /*break*/, 6];
                case 3: return [4 /*yield*/, owner.signMessage(ethers_1.ethers.utils.arrayify((0, order_1.hashTypedData)(domain, types, data)))];
                case 4:
                    signature = _b.sent();
                    return [3 /*break*/, 6];
                case 5: throw new Error("invalid signing scheme");
                case 6: 
                // Passing the signature through split/join to normalize the `v` byte.
                // Some wallets do not pad it with `27`, which causes a signature failure
                // `splitSignature` pads it if needed, and `joinSignature` simply puts it back together
                return [2 /*return*/, ethers_1.ethers.utils.joinSignature(ethers_1.ethers.utils.splitSignature(signature))];
            }
        });
    });
}
/**
 * Returns the signature for the specified order with the signing scheme encoded
 * into the signature.
 *
 * @param domain The domain to sign the order for. This is used by the smart
 * contract to ensure orders can't be replayed across different applications,
 * but also different deployments (as the contract chain ID and address are
 * mixed into to the domain value).
 * @param order The order to sign.
 * @param owner The owner for the order used to sign.
 * @param scheme The signing scheme to use. See {@link SigningScheme} for more
 * details.
 * @return Encoded signature including signing scheme for the order.
 */
function signOrder(domain, order, owner, scheme) {
    return __awaiter(this, void 0, void 0, function () {
        var _a;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    _a = {
                        scheme: scheme
                    };
                    return [4 /*yield*/, ecdsaSignTypedData(scheme, owner, domain, { Order: order_1.ORDER_TYPE_FIELDS }, (0, order_1.normalizeOrder)(order))];
                case 1: return [2 /*return*/, (_a.data = _b.sent(),
                        _a)];
            }
        });
    });
}
exports.signOrder = signOrder;
/**
 * Returns the signature for the Order Cancellation with the signing scheme encoded
 * into the signature.
 *
 * @param domain The domain to sign the cancellation.
 * @param orderUid The unique identifier of the order being cancelled.
 * @param owner The owner for the order used to sign.
 * @param scheme The signing scheme to use. See {@link SigningScheme} for more
 * details.
 * @return Encoded signature including signing scheme for the cancellation.
 */
function signOrderCancellation(domain, orderUid, owner, scheme) {
    return __awaiter(this, void 0, void 0, function () {
        var _a;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    _a = {
                        scheme: scheme
                    };
                    return [4 /*yield*/, ecdsaSignTypedData(scheme, owner, domain, { OrderCancellation: order_1.CANCELLATION_TYPE_FIELDS }, { orderUid: orderUid })];
                case 1: return [2 /*return*/, (_a.data = _b.sent(),
                        _a)];
            }
        });
    });
}
exports.signOrderCancellation = signOrderCancellation;
/**
 * Encodes the necessary data required for the Gnosis Protocol contracts to
 * verify an EIP-1271 signature.
 *
 * @param signature The EIP-1271 signature data to encode.
 */
function encodeEip1271SignatureData(_a) {
    var verifier = _a.verifier, signature = _a.signature;
    return ethers_1.ethers.utils.solidityPack(["address", "bytes"], [verifier, signature]);
}
exports.encodeEip1271SignatureData = encodeEip1271SignatureData;
/**
 * Decodes a GPv2 EIP-1271-type signature into the actual EIP-1271 signature
 * and the verifier contract.
 *
 * @param signature The EIP-1271 signature data to decode.
 * @returns decodedSignature The decoded signature object, composed of an
 * EIP-1271 signature and a verifier.
 */
function decodeEip1271SignatureData(signature) {
    var arrayifiedSignature = ethers_1.ethers.utils.arrayify(signature);
    var verifier = ethers_1.ethers.utils.getAddress(ethers_1.ethers.utils.hexlify(arrayifiedSignature.slice(0, 20)));
    return {
        verifier: verifier,
        signature: arrayifiedSignature.slice(20),
    };
}
exports.decodeEip1271SignatureData = decodeEip1271SignatureData;
//# sourceMappingURL=sign.js.map