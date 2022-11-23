"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.extractOrderUidParams = exports.packOrderUidParams = exports.computeOrderUid = exports.ORDER_UID_LENGTH = exports.hashOrderCancellation = exports.hashOrder = exports.hashTypedData = exports.normalizeOrder = exports.normalizeBuyTokenBalance = exports.hashify = exports.timestamp = exports.ORDER_TYPE_HASH = exports.CANCELLATION_TYPE_FIELDS = exports.ORDER_TYPE_FIELDS = exports.OrderBalance = exports.OrderKind = exports.BUY_ETH_ADDRESS = void 0;
var ethers_1 = require("ethers");
/**
 * Marker address to indicate that an order is buying Ether.
 *
 * Note that this address is only has special meaning in the `buyToken` and will
 * be treated as a ERC20 token address in the `sellToken` position, causing the
 * settlement to revert.
 */
exports.BUY_ETH_ADDRESS = "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE";
/**
 * Order kind.
 */
var OrderKind;
(function (OrderKind) {
    /**
     * A sell order.
     */
    OrderKind["SELL"] = "sell";
    /**
     * A buy order.
     */
    OrderKind["BUY"] = "buy";
})(OrderKind = exports.OrderKind || (exports.OrderKind = {}));
/**
 * Order balance configuration.
 */
var OrderBalance;
(function (OrderBalance) {
    /**
     * Use ERC20 token balances.
     */
    OrderBalance["ERC20"] = "erc20";
    /**
     * Use Balancer Vault external balances.
     *
     * This can only be specified specified for the sell balance and allows orders
     * to re-use Vault ERC20 allowances. When specified for the buy balance, it
     * will be treated as {@link OrderBalance.ERC20}.
     */
    OrderBalance["EXTERNAL"] = "external";
    /**
     * Use Balancer Vault internal balances.
     */
    OrderBalance["INTERNAL"] = "internal";
})(OrderBalance = exports.OrderBalance || (exports.OrderBalance = {}));
/**
 * The EIP-712 type fields definition for a Gnosis Protocol v2 order.
 */
exports.ORDER_TYPE_FIELDS = [
    { name: "sellToken", type: "address" },
    { name: "buyToken", type: "address" },
    { name: "receiver", type: "address" },
    { name: "sellAmount", type: "uint256" },
    { name: "buyAmount", type: "uint256" },
    { name: "validTo", type: "uint32" },
    { name: "appData", type: "bytes32" },
    { name: "feeAmount", type: "uint256" },
    { name: "kind", type: "string" },
    { name: "partiallyFillable", type: "bool" },
    { name: "sellTokenBalance", type: "string" },
    { name: "buyTokenBalance", type: "string" },
];
/**
 * The EIP-712 type fields definition for a Gnosis Protocol v2 order.
 */
exports.CANCELLATION_TYPE_FIELDS = [{ name: "orderUid", type: "bytes" }];
/**
 * The EIP-712 type hash for a Gnosis Protocol v2 order.
 */
exports.ORDER_TYPE_HASH = ethers_1.ethers.utils.id("Order(".concat(exports.ORDER_TYPE_FIELDS.map(function (_a) {
    var name = _a.name, type = _a.type;
    return "".concat(type, " ").concat(name);
}).join(","), ")"));
/**
 * Normalizes a timestamp value to a Unix timestamp.
 * @param time The timestamp value to normalize.
 * @return Unix timestamp or number of seconds since the Unix Epoch.
 */
function timestamp(t) {
    return typeof t === "number" ? t : ~~(t.getTime() / 1000);
}
exports.timestamp = timestamp;
/**
 * Normalizes an app data value to a 32-byte hash.
 * @param hashLike A hash-like value to normalize.
 * @returns A 32-byte hash encoded as a hex-string.
 */
function hashify(h) {
    return typeof h === "number"
        ? "0x".concat(h.toString(16).padStart(64, "0"))
        : ethers_1.ethers.utils.hexZeroPad(h, 32);
}
exports.hashify = hashify;
/**
 * Normalizes the balance configuration for a buy token. Specifically, this
 * function ensures that {@link OrderBalance.EXTERNAL} gets normalized to
 * {@link OrderBalance.ERC20}.
 *
 * @param balance The balance configuration.
 * @returns The normalized balance configuration.
 */
function normalizeBuyTokenBalance(balance) {
    switch (balance) {
        case undefined:
        case OrderBalance.ERC20:
        case OrderBalance.EXTERNAL:
            return OrderBalance.ERC20;
        case OrderBalance.INTERNAL:
            return OrderBalance.INTERNAL;
        default:
            throw new Error("invalid order balance ".concat(balance));
    }
}
exports.normalizeBuyTokenBalance = normalizeBuyTokenBalance;
/**
 * Normalizes an order for hashing and signing, so that it can be used with
 * Ethers.js for EIP-712 operations.
 * @param hashLike A hash-like value to normalize.
 * @returns A 32-byte hash encoded as a hex-string.
 */
function normalizeOrder(order) {
    var _a, _b;
    if (order.receiver === ethers_1.ethers.constants.AddressZero) {
        throw new Error("receiver cannot be address(0)");
    }
    var normalizedOrder = __assign(__assign({}, order), { sellTokenBalance: (_a = order.sellTokenBalance) !== null && _a !== void 0 ? _a : OrderBalance.ERC20, receiver: (_b = order.receiver) !== null && _b !== void 0 ? _b : ethers_1.ethers.constants.AddressZero, validTo: timestamp(order.validTo), appData: hashify(order.appData), buyTokenBalance: normalizeBuyTokenBalance(order.buyTokenBalance) });
    return normalizedOrder;
}
exports.normalizeOrder = normalizeOrder;
/**
 * Compute the 32-byte signing hash for the specified order.
 *
 * @param domain The EIP-712 domain separator to compute the hash for.
 * @param types The order to compute the digest for.
 * @return Hex-encoded 32-byte order digest.
 */
function hashTypedData(domain, types, data) {
    return ethers_1.ethers.utils._TypedDataEncoder.hash(domain, types, data);
}
exports.hashTypedData = hashTypedData;
/**
 * Compute the 32-byte signing hash for the specified order.
 *
 * @param domain The EIP-712 domain separator to compute the hash for.
 * @param order The order to compute the digest for.
 * @return Hex-encoded 32-byte order digest.
 */
function hashOrder(domain, order) {
    return hashTypedData(domain, { Order: exports.ORDER_TYPE_FIELDS }, normalizeOrder(order));
}
exports.hashOrder = hashOrder;
/**
 * Compute the 32-byte signing hash for the specified cancellation.
 *
 * @param domain The EIP-712 domain separator to compute the hash for.
 * @param orderUid The unique identifier of the order to cancel.
 * @return Hex-encoded 32-byte order digest.
 */
function hashOrderCancellation(domain, orderUid) {
    return hashTypedData(domain, { OrderCancellation: exports.CANCELLATION_TYPE_FIELDS }, { orderUid: orderUid });
}
exports.hashOrderCancellation = hashOrderCancellation;
/**
 * The byte length of an order UID.
 */
exports.ORDER_UID_LENGTH = 56;
/**
 * Computes the order UID for an order and the given owner.
 */
function computeOrderUid(domain, order, owner) {
    return packOrderUidParams({
        orderDigest: hashOrder(domain, order),
        owner: owner,
        validTo: order.validTo,
    });
}
exports.computeOrderUid = computeOrderUid;
/**
 * Compute the unique identifier describing a user order in the settlement
 * contract.
 *
 * @param OrderUidParams The parameters used for computing the order's unique
 * identifier.
 * @returns A string that unequivocally identifies the order of the user.
 */
function packOrderUidParams(_a) {
    var orderDigest = _a.orderDigest, owner = _a.owner, validTo = _a.validTo;
    return ethers_1.ethers.utils.solidityPack(["bytes32", "address", "uint32"], [orderDigest, owner, timestamp(validTo)]);
}
exports.packOrderUidParams = packOrderUidParams;
/**
 * Extracts the order unique identifier parameters from the specified bytes.
 *
 * @param orderUid The order UID encoded as a hexadecimal string.
 * @returns The extracted order UID parameters.
 */
function extractOrderUidParams(orderUid) {
    var bytes = ethers_1.ethers.utils.arrayify(orderUid);
    if (bytes.length != exports.ORDER_UID_LENGTH) {
        throw new Error("invalid order UID length");
    }
    var view = new DataView(bytes.buffer);
    return {
        orderDigest: ethers_1.ethers.utils.hexlify(bytes.subarray(0, 32)),
        owner: ethers_1.ethers.utils.getAddress(ethers_1.ethers.utils.hexlify(bytes.subarray(32, 52))),
        validTo: view.getUint32(52),
    };
}
exports.extractOrderUidParams = extractOrderUidParams;
//# sourceMappingURL=order.js.map