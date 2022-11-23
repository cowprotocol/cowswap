import { BigNumberish, BytesLike, Signer } from "ethers";

import { Order, OrderKind } from "./order";
import { TokenRegistry, Trade, encodeTrade } from "./settlement";
import { EcdsaSigningScheme, Signature, signOrder } from "./sign";
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
export type EncodedSwap = [
  /** Swap requests. */
  BatchSwapStep[],
  /** Tokens. */
  string[],
  /** Encoded trade. */
  Trade,
];

/**
 * Encodes a swap as a {@link BatchSwapStep} to be used with the settlement
 * contract.
 */
export function encodeSwapStep(
  tokens: TokenRegistry,
  swap: Swap,
): BatchSwapStep {
  return {
    poolId: swap.poolId,
    assetInIndex: tokens.index(swap.assetIn),
    assetOutIndex: tokens.index(swap.assetOut),
    amount: swap.amount,
    userData: swap.userData || "0x",
  };
}

/**
 * A class for building calldata for a swap.
 *
 * The encoder ensures that token addresses are kept track of and performs
 * necessary computation in order to map each token addresses to IDs to
 * properly encode swap requests and the trade.
 */
export class SwapEncoder {
  private readonly _tokens = new TokenRegistry();
  private readonly _swaps: BatchSwapStep[] = [];
  private _trade: Trade | undefined = undefined;

  /**
   * Creates a new settlement encoder instance.
   *
   * @param domain Domain used for signing orders. See {@link signOrder} for
   * more details.
   */
  public constructor(public readonly domain: TypedDataDomain) {}

  /**
   * Gets the array of token addresses used by the currently encoded swaps.
   */
  public get tokens(): string[] {
    // NOTE: Make sure to slice the original array, so it cannot be modified
    // outside of this class.
    return this._tokens.addresses;
  }

  /**
   * Gets the encoded swaps.
   */
  public get swaps(): BatchSwapStep[] {
    return this._swaps.slice();
  }

  /**
   * Gets the encoded trade.
   */
  public get trade(): Trade {
    if (this._trade === undefined) {
      throw new Error("trade not encoded");
    }
    return this._trade;
  }

  /**
   * Encodes the swap as a swap request and appends it to the swaps encoded so
   * far.
   *
   * @param swap The Balancer swap to encode.
   */
  public encodeSwapStep(...swaps: Swap[]): void {
    this._swaps.push(
      ...swaps.map((swap) => encodeSwapStep(this._tokens, swap)),
    );
  }

  /**
   * Encodes a trade from a signed order.
   *
   * Additionally, if the order references new tokens that the encoder has not
   * yet seen, they are added to the tokens array.
   *
   * @param order The order of the trade to encode.
   * @param signature The signature for the order data.
   */
  public encodeTrade(
    order: Order,
    signature: Signature,
    swapExecution?: Partial<SwapExecution>,
  ): void {
    const { limitAmount } = {
      limitAmount:
        order.kind == OrderKind.SELL ? order.buyAmount : order.sellAmount,
      ...swapExecution,
    };

    this._trade = encodeTrade(this._tokens, order, signature, {
      executedAmount: limitAmount,
    });
  }

  /**
   * Signs an order and encodes a trade with that order.
   *
   * @param order The order to sign for the trade.
   * @param owner The externally owned account that should sign the order.
   * @param scheme The signing scheme to use. See {@link SigningScheme} for more
   * details.
   */
  public async signEncodeTrade(
    order: Order,
    owner: Signer,
    scheme: EcdsaSigningScheme,
    swapExecution?: Partial<SwapExecution>,
  ): Promise<void> {
    const signature = await signOrder(this.domain, order, owner, scheme);
    this.encodeTrade(order, signature, swapExecution);
  }

  /**
   * Returns the encoded swap parameters for the current state of the encoder.
   *
   * This method with raise an exception if a trade has not been encoded.
   */
  public encodedSwap(): EncodedSwap {
    return [this.swaps, this.tokens, this.trade];
  }

  public static encodeSwap(
    swaps: Swap[],
    order: Order,
    signature: Signature,
  ): EncodedSwap;
  public static encodeSwap(
    swaps: Swap[],
    order: Order,
    signature: Signature,
    swapExecution: Partial<SwapExecution> | undefined,
  ): EncodedSwap;

  public static encodeSwap(
    domain: TypedDataDomain,
    swaps: Swap[],
    order: Order,
    owner: Signer,
    scheme: EcdsaSigningScheme,
  ): Promise<EncodedSwap>;
  public static encodeSwap(
    domain: TypedDataDomain,
    swaps: Swap[],
    order: Order,
    owner: Signer,
    scheme: EcdsaSigningScheme,
    swapExecution: Partial<SwapExecution> | undefined,
  ): Promise<EncodedSwap>;

  /**
   * Utility method for encoding a direct swap between an order and Balancer
   * pools.
   *
   * This method functions identically to using a {@link SwapEncoder} and is
   * provided as a short-cut.
   */
  public static encodeSwap(
    ...args:
      | [Swap[], Order, Signature]
      | [Swap[], Order, Signature, Partial<SwapExecution> | undefined]
      | [TypedDataDomain, Swap[], Order, Signer, EcdsaSigningScheme]
      | [
          TypedDataDomain,
          Swap[],
          Order,
          Signer,
          EcdsaSigningScheme,
          Partial<SwapExecution> | undefined,
        ]
  ): EncodedSwap | Promise<EncodedSwap> {
    if (args.length < 5) {
      const [swaps, order, signature, swapExecution] = args as unknown as [
        Swap[],
        Order,
        Signature,
        Partial<SwapExecution> | undefined,
      ];

      const encoder = new SwapEncoder({});
      encoder.encodeSwapStep(...swaps);
      encoder.encodeTrade(order, signature, swapExecution);
      return encoder.encodedSwap();
    } else {
      const [domain, swaps, order, owner, scheme, swapExecution] =
        args as unknown as [
          TypedDataDomain,
          Swap[],
          Order,
          Signer,
          EcdsaSigningScheme,
          Partial<SwapExecution> | undefined,
        ];

      const encoder = new SwapEncoder(domain);
      encoder.encodeSwapStep(...swaps);
      return encoder
        .signEncodeTrade(order, owner, scheme, swapExecution)
        .then(() => encoder.encodedSwap());
    }
  }
}
