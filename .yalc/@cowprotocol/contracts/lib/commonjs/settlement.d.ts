import { BigNumberish, BytesLike, Signer } from "ethers";
import { Interaction, InteractionLike } from "./interaction";
import { NormalizedOrder, Order, OrderBalance, OrderFlags, OrderKind } from "./order";
import { EcdsaSigningScheme, Signature, SigningScheme } from "./sign";
import { TypedDataDomain } from "./types/ethers";
/**
 * The stage an interaction should be executed in.
 */
export declare enum InteractionStage {
    /**
     * A pre-settlement intraction.
     *
     * The interaction will be executed before any trading occurs. This can be
     * used, for example, to perform as EIP-2612 `permit` call for a user trading
     * in the current settlement.
     */
    PRE = 0,
    /**
     * An intra-settlement interaction.
     *
     * The interaction will be executed after all trade sell amounts are
     * transferred into the settlement contract, but before the buy amounts are
     * transferred out to the traders. This can be used, for example, to interact
     * with on-chain AMMs.
     */
    INTRA = 1,
    /**
     * A post-settlement interaction.
     *
     * The interaction will be executed after all trading has completed.
     */
    POST = 2
}
/**
 * Gnosis Protocol v2 trade flags.
 */
export interface TradeFlags extends OrderFlags {
    /**
     * The signing scheme used to encode the signature.
     */
    signingScheme: SigningScheme;
}
/**
 * Trade parameters used in a settlement.
 */
export declare type Trade = TradeExecution & Omit<NormalizedOrder, "sellToken" | "buyToken" | "kind" | "partiallyFillable" | "sellTokenBalance" | "buyTokenBalance"> & {
    /**
     * The index of the sell token in the settlement.
     */
    sellTokenIndex: BigNumberish;
    /**
     * The index of the buy token in the settlement.
     */
    buyTokenIndex: BigNumberish;
    /**
     * Encoded order flags.
     */
    flags: BigNumberish;
    /**
     * Signature data.
     */
    signature: BytesLike;
};
/**
 * Details representing how an order was executed.
 */
export interface TradeExecution {
    /**
     * The executed trade amount.
     *
     * How this amount is used by the settlement contract depends on the order
     * flags:
     * - Partially fillable sell orders: the amount of sell tokens to trade.
     * - Partially fillable buy orders: the amount of buy tokens to trade.
     * - Fill-or-kill orders: this value is ignored.
     */
    executedAmount: BigNumberish;
}
/**
 * Order refund data.
 *
 * Note: after the London hardfork (specifically the introduction of EIP-3529)
 * order refunds have become meaningless as the refunded amount is less than the
 * gas cost of triggering the refund. The logic surrounding this feature is kept
 * in order to keep full test coverage and in case the value of a refund will be
 * increased again in the future. However, order refunds should not be used in
 * an actual settlement.
 */
export interface OrderRefunds {
    /** Refund storage used for order filled amount */
    filledAmounts: BytesLike[];
    /** Refund storage used for order pre-signature */
    preSignatures: BytesLike[];
}
/**
 * Table mapping token addresses to their respective clearing prices.
 */
export declare type Prices = Record<string, BigNumberish | undefined>;
/**
 * Encoded settlement parameters.
 */
export declare type EncodedSettlement = [
    /** Tokens. */
    string[],
    /** Clearing prices. */
    BigNumberish[],
    /** Encoded trades. */
    Trade[],
    /** Encoded interactions. */
    [
        Interaction[],
        Interaction[],
        Interaction[]
    ]
];
/**
 * An object listing all flag options in order along with their bit offset.
 */
export declare const FLAG_MASKS: {
    readonly kind: {
        readonly offset: 0;
        readonly options: readonly [OrderKind.SELL, OrderKind.BUY];
    };
    readonly partiallyFillable: {
        readonly offset: 1;
        readonly options: readonly [false, true];
    };
    readonly sellTokenBalance: {
        readonly offset: 2;
        readonly options: readonly [OrderBalance.ERC20, undefined, OrderBalance.EXTERNAL, OrderBalance.INTERNAL];
    };
    readonly buyTokenBalance: {
        readonly offset: 4;
        readonly options: readonly [OrderBalance.ERC20, OrderBalance.INTERNAL];
    };
    readonly signingScheme: {
        readonly offset: 5;
        readonly options: readonly [SigningScheme.EIP712, SigningScheme.ETHSIGN, SigningScheme.EIP1271, SigningScheme.PRESIGN];
    };
};
export declare type FlagKey = keyof typeof FLAG_MASKS;
export declare type FlagOptions<K extends FlagKey> = typeof FLAG_MASKS[K]["options"];
export declare type FlagValue<K extends FlagKey> = Exclude<FlagOptions<K>[number], undefined>;
/**
 * Encodes signing scheme as a bitfield.
 *
 * @param scheme The signing scheme to encode.
 * @return The bitfield result.
 */
export declare function encodeSigningScheme(scheme: SigningScheme): number;
/**
 * Decodes signing scheme from a bitfield.
 *
 * @param flag The encoded order flag.
 * @return The decoded signing scheme.
 */
export declare function decodeSigningScheme(flags: BigNumberish): SigningScheme;
/**
 * Encodes order flags as a bitfield.
 *
 * @param flags The order flags to encode.
 * @return The bitfield result.
 */
export declare function encodeOrderFlags(flags: OrderFlags): number;
/**
 * Decode order flags from a bitfield.
 *
 * @param flags The order flags encoded as a bitfield.
 * @return The decoded order flags.
 */
export declare function decodeOrderFlags(flags: BigNumberish): OrderFlags;
/**
 * Encodes trade flags as a bitfield.
 *
 * @param flags The trade flags to encode.
 * @return The bitfield result.
 */
export declare function encodeTradeFlags(flags: TradeFlags): number;
/**
 * Decode trade flags from a bitfield.
 *
 * @param flags The trade flags encoded as a bitfield.
 * @return The bitfield result.
 */
export declare function decodeTradeFlags(flags: BigNumberish): TradeFlags;
export declare function encodeSignatureData(sig: Signature): string;
export declare function decodeSignatureOwner(domain: TypedDataDomain, order: Order, scheme: SigningScheme, sig: BytesLike): string;
/**
 * Encodes a trade to be used with the settlement contract.
 */
export declare function encodeTrade(tokens: TokenRegistry, order: Order, signature: Signature, { executedAmount }: TradeExecution): Trade;
/**
 * A class used for tracking tokens when encoding settlements.
 *
 * This is used as settlement trades reference tokens by index instead of
 * directly by address for multiple reasons:
 * - Reduce encoding size of orders to save on `calldata` gas.
 * - Direct access to a token's clearing price on settlement instead of
 *   requiring a search.
 */
export declare class TokenRegistry {
    private readonly _tokens;
    private readonly _tokenMap;
    /**
     * Gets the array of token addresses currently stored in the registry.
     */
    get addresses(): string[];
    /**
     * Retrieves the token index for the specified token address. If the token is
     * not in the registry, it will be added.
     *
     * @param token The token address to add to the registry.
     * @return The token index.
     */
    index(token: string): number;
}
/**
 * A class for building calldata for a settlement.
 *
 * The encoder ensures that token addresses are kept track of and performs
 * necessary computation in order to map each token addresses to IDs to
 * properly encode order parameters for trades.
 */
export declare class SettlementEncoder {
    readonly domain: TypedDataDomain;
    private readonly _tokens;
    private readonly _trades;
    private readonly _interactions;
    private readonly _orderRefunds;
    /**
     * Creates a new settlement encoder instance.
     * @param domain Domain used for signing orders. See {@link signOrder} for
     * more details.
     */
    constructor(domain: TypedDataDomain);
    /**
     * Gets the array of token addresses used by the currently encoded orders.
     */
    get tokens(): string[];
    /**
     * Gets the encoded trades.
     */
    get trades(): Trade[];
    /**
     * Gets all encoded interactions for all stages.
     *
     * Note that order refund interactions are included as post-interactions.
     */
    get interactions(): [Interaction[], Interaction[], Interaction[]];
    /**
     * Gets the order refunds encoded as interactions.
     */
    get encodedOrderRefunds(): Interaction[];
    /**
     * Returns a clearing price vector for the current settlement tokens from the
     * provided price map.
     *
     * @param prices The price map from token address to price.
     * @return The price vector.
     */
    clearingPrices(prices: Prices): BigNumberish[];
    /**
     * Encodes a trade from a signed order and executed amount, appending it to
     * the `calldata` bytes that are being built.
     *
     * Additionally, if the order references new tokens that the encoder has not
     * yet seen, they are added to the tokens array.
     *
     * @param order The order of the trade to encode.
     * @param signature The signature for the order data.
     * @param tradeExecution The execution details for the trade.
     */
    encodeTrade(order: Order, signature: Signature, { executedAmount }?: Partial<TradeExecution>): void;
    /**
     * Signs an order and encodes a trade with that order.
     *
     * @param order The order to sign for the trade.
     * @param owner The externally owned account that should sign the order.
     * @param scheme The signing scheme to use. See {@link SigningScheme} for more
     * details.
     * @param tradeExecution The execution details for the trade.
     */
    signEncodeTrade(order: Order, owner: Signer, scheme: EcdsaSigningScheme, tradeExecution?: Partial<TradeExecution>): Promise<void>;
    /**
     * Encodes the input interaction in the packed format accepted by the smart
     * contract and adds it to the interactions encoded so far.
     *
     * @param stage The stage the interaction should be executed.
     * @param interaction The interaction to encode.
     */
    encodeInteraction(interaction: InteractionLike, stage?: InteractionStage): void;
    /**
     * Encodes order UIDs for gas refunds.
     *
     * @param settlement The address of the settlement contract.
     * @param orderRefunds The order refunds to encode.
     */
    encodeOrderRefunds(orderRefunds: Partial<OrderRefunds>): void;
    /**
     * Returns the encoded settlement parameters.
     */
    encodedSettlement(prices: Prices): EncodedSettlement;
    /**
     * Returns an encoded settlement that exclusively performs setup interactions.
     * This method can be used, for example, to set the settlement contract's
     * allowances to other protocols it may interact with.
     *
     * @param interactions The list of setup interactions to encode.
     */
    static encodedSetup(...interactions: InteractionLike[]): EncodedSettlement;
}
/**
 * Decodes an order from a settlement trade.
 *
 * @param trade The trade to decode into an order.
 * @param tokens The list of token addresses as they appear in the settlement.
 * @returns The decoded order.
 */
export declare function decodeOrder(trade: Trade, tokens: string[]): Order;
