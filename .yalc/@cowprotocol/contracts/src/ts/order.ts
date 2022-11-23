import { BigNumberish, BytesLike, ethers } from "ethers";

import { TypedDataDomain, TypedDataTypes } from "./types/ethers";

/**
 * Gnosis Protocol v2 order data.
 */
export interface Order {
  /**
   * Sell token address.
   */
  sellToken: string;
  /**
   * Buy token address.
   */
  buyToken: string;
  /**
   * An optional address to receive the proceeds of the trade instead of the
   * owner (i.e. the order signer).
   */
  receiver?: string;
  /**
   * The order sell amount.
   *
   * For fill or kill sell orders, this amount represents the exact sell amount
   * that will be executed in the trade. For fill or kill buy orders, this
   * amount represents the maximum sell amount that can be executed. For partial
   * fill orders, this represents a component of the limit price fraction.
   */
  sellAmount: BigNumberish;
  /**
   * The order buy amount.
   *
   * For fill or kill sell orders, this amount represents the minimum buy amount
   * that can be executed in the trade. For fill or kill buy orders, this amount
   * represents the exact buy amount that will be executed. For partial fill
   * orders, this represents a component of the limit price fraction.
   */
  buyAmount: BigNumberish;
  /**
   * The timestamp this order is valid until
   */
  validTo: Timestamp;
  /**
   * Arbitrary application specific data that can be added to an order. This can
   * also be used to ensure uniqueness between two orders with otherwise the
   * exact same parameters.
   */
  appData: HashLike;
  /**
   * Fee to give to the protocol.
   */
  feeAmount: BigNumberish;
  /**
   * The order kind.
   */
  kind: OrderKind;
  /**
   * Specifies whether or not the order is partially fillable.
   */
  partiallyFillable: boolean;
  /**
   * Specifies how the sell token balance will be withdrawn. It can either be
   * taken using ERC20 token allowances made directly to the Vault relayer
   * (default) or using Balancer Vault internal or external balances.
   */
  sellTokenBalance?: OrderBalance;
  /**
   * Specifies how the buy token balance will be paid. It can either be paid
   * directly in ERC20 tokens (default) in Balancer Vault internal balances.
   */
  buyTokenBalance?: OrderBalance;
}

/**
 * Gnosis Protocol v2 order cancellation data.
 */
export interface OrderCancellation {
  /**
   * The unique identifier of the order to be cancelled.
   */
  orderUid: BytesLike;
}

/**
 * Marker address to indicate that an order is buying Ether.
 *
 * Note that this address is only has special meaning in the `buyToken` and will
 * be treated as a ERC20 token address in the `sellToken` position, causing the
 * settlement to revert.
 */
export const BUY_ETH_ADDRESS = "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE";

/**
 * Gnosis Protocol v2 order flags.
 */
export type OrderFlags = Pick<
  Order,
  "kind" | "partiallyFillable" | "sellTokenBalance" | "buyTokenBalance"
>;

/**
 * A timestamp value.
 */
export type Timestamp = number | Date;

/**
 * A hash-like app data value.
 */
export type HashLike = BytesLike | number;

/**
 * Order kind.
 */
export enum OrderKind {
  /**
   * A sell order.
   */
  SELL = "sell",
  /**
   * A buy order.
   */
  BUY = "buy",
}

/**
 * Order balance configuration.
 */
export enum OrderBalance {
  /**
   * Use ERC20 token balances.
   */
  ERC20 = "erc20",
  /**
   * Use Balancer Vault external balances.
   *
   * This can only be specified specified for the sell balance and allows orders
   * to re-use Vault ERC20 allowances. When specified for the buy balance, it
   * will be treated as {@link OrderBalance.ERC20}.
   */
  EXTERNAL = "external",
  /**
   * Use Balancer Vault internal balances.
   */
  INTERNAL = "internal",
}

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
export const ORDER_TYPE_HASH = ethers.utils.id(
  `Order(${ORDER_TYPE_FIELDS.map(({ name, type }) => `${type} ${name}`).join(
    ",",
  )})`,
);

/**
 * Normalizes a timestamp value to a Unix timestamp.
 * @param time The timestamp value to normalize.
 * @return Unix timestamp or number of seconds since the Unix Epoch.
 */
export function timestamp(t: Timestamp): number {
  return typeof t === "number" ? t : ~~(t.getTime() / 1000);
}

/**
 * Normalizes an app data value to a 32-byte hash.
 * @param hashLike A hash-like value to normalize.
 * @returns A 32-byte hash encoded as a hex-string.
 */
export function hashify(h: HashLike): string {
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
export function normalizeBuyTokenBalance(
  balance: OrderBalance | undefined,
): OrderBalance.ERC20 | OrderBalance.INTERNAL {
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
 * Normalized representation of an {@link Order} for EIP-712 operations.
 */
export type NormalizedOrder = Omit<
  Order,
  "validTo" | "appData" | "kind" | "sellTokenBalance" | "buyTokenBalance"
> & {
  receiver: string;
  validTo: number;
  appData: string;
  kind: "sell" | "buy";
  sellTokenBalance: "erc20" | "external" | "internal";
  buyTokenBalance: "erc20" | "internal";
};

/**
 * Normalizes an order for hashing and signing, so that it can be used with
 * Ethers.js for EIP-712 operations.
 * @param hashLike A hash-like value to normalize.
 * @returns A 32-byte hash encoded as a hex-string.
 */
export function normalizeOrder(order: Order): NormalizedOrder {
  if (order.receiver === ethers.constants.AddressZero) {
    throw new Error("receiver cannot be address(0)");
  }

  const normalizedOrder = {
    ...order,
    sellTokenBalance: order.sellTokenBalance ?? OrderBalance.ERC20,
    receiver: order.receiver ?? ethers.constants.AddressZero,
    validTo: timestamp(order.validTo),
    appData: hashify(order.appData),
    buyTokenBalance: normalizeBuyTokenBalance(order.buyTokenBalance),
  };
  return normalizedOrder;
}

/**
 * Compute the 32-byte signing hash for the specified order.
 *
 * @param domain The EIP-712 domain separator to compute the hash for.
 * @param types The order to compute the digest for.
 * @return Hex-encoded 32-byte order digest.
 */
export function hashTypedData(
  domain: TypedDataDomain,
  types: TypedDataTypes,
  data: Record<string, unknown>,
): string {
  return ethers.utils._TypedDataEncoder.hash(domain, types, data);
}

/**
 * Compute the 32-byte signing hash for the specified order.
 *
 * @param domain The EIP-712 domain separator to compute the hash for.
 * @param order The order to compute the digest for.
 * @return Hex-encoded 32-byte order digest.
 */
export function hashOrder(domain: TypedDataDomain, order: Order): string {
  return hashTypedData(
    domain,
    { Order: ORDER_TYPE_FIELDS },
    normalizeOrder(order),
  );
}

/**
 * Compute the 32-byte signing hash for the specified cancellation.
 *
 * @param domain The EIP-712 domain separator to compute the hash for.
 * @param orderUid The unique identifier of the order to cancel.
 * @return Hex-encoded 32-byte order digest.
 */
export function hashOrderCancellation(
  domain: TypedDataDomain,
  orderUid: BytesLike,
): string {
  return hashTypedData(
    domain,
    { OrderCancellation: CANCELLATION_TYPE_FIELDS },
    { orderUid },
  );
}

/**
 * The byte length of an order UID.
 */
export const ORDER_UID_LENGTH = 56;

/**
 * Order unique identifier parameters.
 */
export interface OrderUidParams {
  /**
   * The EIP-712 order struct hash.
   */
  orderDigest: string;
  /**
   * The owner of the order.
   */
  owner: string;
  /**
   * The timestamp this order is valid until.
   */
  validTo: number | Date;
}

/**
 * Computes the order UID for an order and the given owner.
 */
export function computeOrderUid(
  domain: TypedDataDomain,
  order: Order,
  owner: string,
): string {
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
export function packOrderUidParams({
  orderDigest,
  owner,
  validTo,
}: OrderUidParams): string {
  return ethers.utils.solidityPack(
    ["bytes32", "address", "uint32"],
    [orderDigest, owner, timestamp(validTo)],
  );
}

/**
 * Extracts the order unique identifier parameters from the specified bytes.
 *
 * @param orderUid The order UID encoded as a hexadecimal string.
 * @returns The extracted order UID parameters.
 */
export function extractOrderUidParams(orderUid: string): OrderUidParams {
  const bytes = ethers.utils.arrayify(orderUid);
  if (bytes.length != ORDER_UID_LENGTH) {
    throw new Error("invalid order UID length");
  }

  const view = new DataView(bytes.buffer);
  return {
    orderDigest: ethers.utils.hexlify(bytes.subarray(0, 32)),
    owner: ethers.utils.getAddress(
      ethers.utils.hexlify(bytes.subarray(32, 52)),
    ),
    validTo: view.getUint32(52),
  };
}
