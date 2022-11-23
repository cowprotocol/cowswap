import { ethers } from "ethers";
/**
 * Marker address to indicate that an order is buying Ether.
 *
 * Note that this address is only has special meaning in the `buyToken` and will
 * be treated as a ERC20 token address in the `sellToken` position, causing the
 * settlement to revert.
 */
export const BUY_ETH_ADDRESS = "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE";
/**
 * Order kind.
 */
export var OrderKind;
(function (OrderKind) {
    /**
     * A sell order.
     */
    OrderKind["SELL"] = "sell";
    /**
     * A buy order.
     */
    OrderKind["BUY"] = "buy";
})(OrderKind || (OrderKind = {}));
/**
 * Order balance configuration.
 */
export var OrderBalance;
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
})(OrderBalance || (OrderBalance = {}));
/**
 * The EIP-712 type fields definition for a Gnosis Protocol v2 order.
 */
export const ORDER_TYPE_FIELDS = [
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
export const CANCELLATION_TYPE_FIELDS = [{ name: "orderUid", type: "bytes" }];
/**
 * The EIP-712 type hash for a Gnosis Protocol v2 order.
 */
export const ORDER_TYPE_HASH = ethers.utils.id(`Order(${ORDER_TYPE_FIELDS.map(({ name, type }) => `${type} ${name}`).join(",")})`);
/**
 * Normalizes a timestamp value to a Unix timestamp.
 * @param time The timestamp value to normalize.
 * @return Unix timestamp or number of seconds since the Unix Epoch.
 */
export function timestamp(t) {
    return typeof t === "number" ? t : ~~(t.getTime() / 1000);
}
/**
 * Normalizes an app data value to a 32-byte hash.
 * @param hashLike A hash-like value to normalize.
 * @returns A 32-byte hash encoded as a hex-string.
 */
export function hashify(h) {
    return typeof h === "number"
        ? `0x${h.toString(16).padStart(64, "0")}`
        : ethers.utils.hexZeroPad(h, 32);
}
/**
 * Normalizes the balance configuration for a buy token. Specifically, this
 * function ensures that {@link OrderBalance.EXTERNAL} gets normalized to
 * {@link OrderBalance.ERC20}.
 *
 * @param balance The balance configuration.
 * @returns The normalized balance configuration.
 */
export function normalizeBuyTokenBalance(balance) {
    switch (balance) {
        case undefined:
        case OrderBalance.ERC20:
        case OrderBalance.EXTERNAL:
            return OrderBalance.ERC20;
        case OrderBalance.INTERNAL:
            return OrderBalance.INTERNAL;
        default:
            throw new Error(`invalid order balance ${balance}`);
    }
}
/**
 * Normalizes an order for hashing and signing, so that it can be used with
 * Ethers.js for EIP-712 operations.
 * @param hashLike A hash-like value to normalize.
 * @returns A 32-byte hash encoded as a hex-string.
 */
export function normalizeOrder(order) {
    var _a, _b;
    if (order.receiver === ethers.constants.AddressZero) {
        throw new Error("receiver cannot be address(0)");
    }
    const normalizedOrder = Object.assign(Object.assign({}, order), { sellTokenBalance: (_a = order.sellTokenBalance) !== null && _a !== void 0 ? _a : OrderBalance.ERC20, receiver: (_b = order.receiver) !== null && _b !== void 0 ? _b : ethers.constants.AddressZero, validTo: timestamp(order.validTo), appData: hashify(order.appData), buyTokenBalance: normalizeBuyTokenBalance(order.buyTokenBalance) });
    return normalizedOrder;
}
/**
 * Compute the 32-byte signing hash for the specified order.
 *
 * @param domain The EIP-712 domain separator to compute the hash for.
 * @param types The order to compute the digest for.
 * @return Hex-encoded 32-byte order digest.
 */
export function hashTypedData(domain, types, data) {
    return ethers.utils._TypedDataEncoder.hash(domain, types, data);
}
/**
 * Compute the 32-byte signing hash for the specified order.
 *
 * @param domain The EIP-712 domain separator to compute the hash for.
 * @param order The order to compute the digest for.
 * @return Hex-encoded 32-byte order digest.
 */
export function hashOrder(domain, order) {
    return hashTypedData(domain, { Order: ORDER_TYPE_FIELDS }, normalizeOrder(order));
}
/**
 * Compute the 32-byte signing hash for the specified cancellation.
 *
 * @param domain The EIP-712 domain separator to compute the hash for.
 * @param orderUid The unique identifier of the order to cancel.
 * @return Hex-encoded 32-byte order digest.
 */
export function hashOrderCancellation(domain, orderUid) {
    return hashTypedData(domain, { OrderCancellation: CANCELLATION_TYPE_FIELDS }, { orderUid });
}
/**
 * The byte length of an order UID.
 */
export const ORDER_UID_LENGTH = 56;
/**
 * Computes the order UID for an order and the given owner.
 */
export function computeOrderUid(domain, order, owner) {
    return packOrderUidParams({
        orderDigest: hashOrder(domain, order),
        owner,
        validTo: order.validTo,
    });
}
/**
 * Compute the unique identifier describing a user order in the settlement
 * contract.
 *
 * @param OrderUidParams The parameters used for computing the order's unique
 * identifier.
 * @returns A string that unequivocally identifies the order of the user.
 */
export function packOrderUidParams({ orderDigest, owner, validTo, }) {
    return ethers.utils.solidityPack(["bytes32", "address", "uint32"], [orderDigest, owner, timestamp(validTo)]);
}
/**
 * Extracts the order unique identifier parameters from the specified bytes.
 *
 * @param orderUid The order UID encoded as a hexadecimal string.
 * @returns The extracted order UID parameters.
 */
export function extractOrderUidParams(orderUid) {
    const bytes = ethers.utils.arrayify(orderUid);
    if (bytes.length != ORDER_UID_LENGTH) {
        throw new Error("invalid order UID length");
    }
    const view = new DataView(bytes.buffer);
    return {
        orderDigest: ethers.utils.hexlify(bytes.subarray(0, 32)),
        owner: ethers.utils.getAddress(ethers.utils.hexlify(bytes.subarray(32, 52))),
        validTo: view.getUint32(52),
    };
}
//# sourceMappingURL=order.js.map