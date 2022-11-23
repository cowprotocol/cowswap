import { BigNumberish, BytesLike, Signer } from "ethers";
import { Order } from "./order";
import { TokenRegistry, Trade } from "./settlement";
import { EcdsaSigningScheme, Signature } from "./sign";
import { TypedDataDomain } from "./types/ethers";
/**
 * A Balancer swap used for settling a single order against Balancer pools.
 */
export interface Swap {
    /**
     * The ID of the pool for the swap.
     */
    poolId: BytesLike;
    /**
     * The swap input token address.
     */
    assetIn: string;
    /**
     * The swap output token address.
     */
    assetOut: string;
    /**
     * The amount to swap. This will ether be a fixed input amount when swapping
     * a sell order, or a fixed output amount when swapping a buy order.
     */
    amount: BigNumberish;
    /**
     * Optional additional pool user data required for the swap.
     *
     * This additional user data is pool implementation specific, and allows pools
     * to extend the Vault pool interface.
     */
    userData?: BytesLike;
}
/**
 * An encoded Balancer swap request that can be used as input to the settlement
 * contract.
 */
export interface BatchSwapStep {
    /**
     * The ID of the pool for the swap.
     */
    poolId: BytesLike;
    /**
     * The index of the input token.
     *
     * Settlement swap calls encode tokens as an array, this number represents an
     * index into that array.
     */
    assetInIndex: number;
    /**
     * The index of the output token.
     */
    assetOutIndex: number;
    /**
     * The amount to swap.
     */
    amount: BigNumberish;
    /**
     * Additional pool user data required for the swap.
     */
    userData: BytesLike;
}
/**
 * Swap execution parameters.
 */
export interface SwapExecution {
    /**
     * The limit amount for the swap.
     *
     * This allows settlement submission to define a tighter slippage than what
     * was specified by the order in order to reduce MEV opportunity.
     */
    limitAmount: BigNumberish;
}
/**
 * Encoded swap parameters.
 */
export declare type EncodedSwap = [
    /** Swap requests. */
    BatchSwapStep[],
    /** Tokens. */
    string[],
    /** Encoded trade. */
    Trade
];
/**
 * Encodes a swap as a {@link BatchSwapStep} to be used with the settlement
 * contract.
 */
export declare function encodeSwapStep(tokens: TokenRegistry, swap: Swap): BatchSwapStep;
/**
 * A class for building calldata for a swap.
 *
 * The encoder ensures that token addresses are kept track of and performs
 * necessary computation in order to map each token addresses to IDs to
 * properly encode swap requests and the trade.
 */
export declare class SwapEncoder {
    readonly domain: TypedDataDomain;
    private readonly _tokens;
    private readonly _swaps;
    private _trade;
    /**
     * Creates a new settlement encoder instance.
     *
     * @param domain Domain used for signing orders. See {@link signOrder} for
     * more details.
     */
    constructor(domain: TypedDataDomain);
    /**
     * Gets the array of token addresses used by the currently encoded swaps.
     */
    get tokens(): string[];
    /**
     * Gets the encoded swaps.
     */
    get swaps(): BatchSwapStep[];
    /**
     * Gets the encoded trade.
     */
    get trade(): Trade;
    /**
     * Encodes the swap as a swap request and appends it to the swaps encoded so
     * far.
     *
     * @param swap The Balancer swap to encode.
     */
    encodeSwapStep(...swaps: Swap[]): void;
    /**
     * Encodes a trade from a signed order.
     *
     * Additionally, if the order references new tokens that the encoder has not
     * yet seen, they are added to the tokens array.
     *
     * @param order The order of the trade to encode.
     * @param signature The signature for the order data.
     */
    encodeTrade(order: Order, signature: Signature, swapExecution?: Partial<SwapExecution>): void;
    /**
     * Signs an order and encodes a trade with that order.
     *
     * @param order The order to sign for the trade.
     * @param owner The externally owned account that should sign the order.
     * @param scheme The signing scheme to use. See {@link SigningScheme} for more
     * details.
     */
    signEncodeTrade(order: Order, owner: Signer, scheme: EcdsaSigningScheme, swapExecution?: Partial<SwapExecution>): Promise<void>;
    /**
     * Returns the encoded swap parameters for the current state of the encoder.
     *
     * This method with raise an exception if a trade has not been encoded.
     */
    encodedSwap(): EncodedSwap;
    static encodeSwap(swaps: Swap[], order: Order, signature: Signature): EncodedSwap;
    static encodeSwap(swaps: Swap[], order: Order, signature: Signature, swapExecution: Partial<SwapExecution> | undefined): EncodedSwap;
    static encodeSwap(domain: TypedDataDomain, swaps: Swap[], order: Order, owner: Signer, scheme: EcdsaSigningScheme): Promise<EncodedSwap>;
    static encodeSwap(domain: TypedDataDomain, swaps: Swap[], order: Order, owner: Signer, scheme: EcdsaSigningScheme, swapExecution: Partial<SwapExecution> | undefined): Promise<EncodedSwap>;
}
