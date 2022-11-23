var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { OrderKind } from "./order";
import { TokenRegistry, encodeTrade } from "./settlement";
import { signOrder } from "./sign";
/**
 * Encodes a swap as a {@link BatchSwapStep} to be used with the settlement
 * contract.
 */
export function encodeSwapStep(tokens, swap) {
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
    /**
     * Creates a new settlement encoder instance.
     *
     * @param domain Domain used for signing orders. See {@link signOrder} for
     * more details.
     */
    constructor(domain) {
        this.domain = domain;
        this._tokens = new TokenRegistry();
        this._swaps = [];
        this._trade = undefined;
    }
    /**
     * Gets the array of token addresses used by the currently encoded swaps.
     */
    get tokens() {
        // NOTE: Make sure to slice the original array, so it cannot be modified
        // outside of this class.
        return this._tokens.addresses;
    }
    /**
     * Gets the encoded swaps.
     */
    get swaps() {
        return this._swaps.slice();
    }
    /**
     * Gets the encoded trade.
     */
    get trade() {
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
    encodeSwapStep(...swaps) {
        this._swaps.push(...swaps.map((swap) => encodeSwapStep(this._tokens, swap)));
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
    encodeTrade(order, signature, swapExecution) {
        const { limitAmount } = Object.assign({ limitAmount: order.kind == OrderKind.SELL ? order.buyAmount : order.sellAmount }, swapExecution);
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
    signEncodeTrade(order, owner, scheme, swapExecution) {
        return __awaiter(this, void 0, void 0, function* () {
            const signature = yield signOrder(this.domain, order, owner, scheme);
            this.encodeTrade(order, signature, swapExecution);
        });
    }
    /**
     * Returns the encoded swap parameters for the current state of the encoder.
     *
     * This method with raise an exception if a trade has not been encoded.
     */
    encodedSwap() {
        return [this.swaps, this.tokens, this.trade];
    }
    /**
     * Utility method for encoding a direct swap between an order and Balancer
     * pools.
     *
     * This method functions identically to using a {@link SwapEncoder} and is
     * provided as a short-cut.
     */
    static encodeSwap(...args) {
        if (args.length < 5) {
            const [swaps, order, signature, swapExecution] = args;
            const encoder = new SwapEncoder({});
            encoder.encodeSwapStep(...swaps);
            encoder.encodeTrade(order, signature, swapExecution);
            return encoder.encodedSwap();
        }
        else {
            const [domain, swaps, order, owner, scheme, swapExecution] = args;
            const encoder = new SwapEncoder(domain);
            encoder.encodeSwapStep(...swaps);
            return encoder
                .signEncodeTrade(order, owner, scheme, swapExecution)
                .then(() => encoder.encodedSwap());
        }
    }
}
//# sourceMappingURL=swap.js.map