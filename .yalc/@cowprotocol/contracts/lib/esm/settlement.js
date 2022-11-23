var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { ethers, BigNumber } from "ethers";
import { normalizeInteraction, } from "./interaction";
import { ORDER_TYPE_FIELDS, ORDER_UID_LENGTH, OrderBalance, OrderKind, hashTypedData, normalizeBuyTokenBalance, normalizeOrder, } from "./order";
import { SigningScheme, encodeEip1271SignatureData, signOrder, decodeEip1271SignatureData, } from "./sign";
/**
 * The stage an interaction should be executed in.
 */
export var InteractionStage;
(function (InteractionStage) {
    /**
     * A pre-settlement intraction.
     *
     * The interaction will be executed before any trading occurs. This can be
     * used, for example, to perform as EIP-2612 `permit` call for a user trading
     * in the current settlement.
     */
    InteractionStage[InteractionStage["PRE"] = 0] = "PRE";
    /**
     * An intra-settlement interaction.
     *
     * The interaction will be executed after all trade sell amounts are
     * transferred into the settlement contract, but before the buy amounts are
     * transferred out to the traders. This can be used, for example, to interact
     * with on-chain AMMs.
     */
    InteractionStage[InteractionStage["INTRA"] = 1] = "INTRA";
    /**
     * A post-settlement interaction.
     *
     * The interaction will be executed after all trading has completed.
     */
    InteractionStage[InteractionStage["POST"] = 2] = "POST";
})(InteractionStage || (InteractionStage = {}));
/**
 * An object listing all flag options in order along with their bit offset.
 */
export const FLAG_MASKS = {
    kind: {
        offset: 0,
        options: [OrderKind.SELL, OrderKind.BUY],
    },
    partiallyFillable: {
        offset: 1,
        options: [false, true],
    },
    sellTokenBalance: {
        offset: 2,
        options: [
            OrderBalance.ERC20,
            undefined,
            OrderBalance.EXTERNAL,
            OrderBalance.INTERNAL,
        ],
    },
    buyTokenBalance: {
        offset: 4,
        options: [OrderBalance.ERC20, OrderBalance.INTERNAL],
    },
    signingScheme: {
        offset: 5,
        options: [
            SigningScheme.EIP712,
            SigningScheme.ETHSIGN,
            SigningScheme.EIP1271,
            SigningScheme.PRESIGN,
        ],
    },
};
function encodeFlag(key, flag) {
    const index = FLAG_MASKS[key].options.findIndex((search) => search === flag);
    if (index === undefined) {
        throw new Error(`Bad key/value pair to encode: ${key}/${flag}`);
    }
    return index << FLAG_MASKS[key].offset;
}
// Counts the smallest mask needed to store the input options in the masked
// bitfield.
function mask(options) {
    const num = options.length;
    const bitCount = 32 - Math.clz32(num - 1);
    return (1 << bitCount) - 1;
}
function decodeFlag(key, flag) {
    const { offset, options } = FLAG_MASKS[key];
    const numberFlags = BigNumber.from(flag).toNumber();
    const index = (numberFlags >> offset) & mask(options);
    // This type casting should not be needed
    const decoded = options[index];
    if (decoded === undefined || index < 0) {
        throw new Error(`Invalid input flag for ${key}: 0b${numberFlags.toString(2)}`);
    }
    return decoded;
}
/**
 * Encodes signing scheme as a bitfield.
 *
 * @param scheme The signing scheme to encode.
 * @return The bitfield result.
 */
export function encodeSigningScheme(scheme) {
    return encodeFlag("signingScheme", scheme);
}
/**
 * Decodes signing scheme from a bitfield.
 *
 * @param flag The encoded order flag.
 * @return The decoded signing scheme.
 */
export function decodeSigningScheme(flags) {
    return decodeFlag("signingScheme", flags);
}
/**
 * Encodes order flags as a bitfield.
 *
 * @param flags The order flags to encode.
 * @return The bitfield result.
 */
export function encodeOrderFlags(flags) {
    var _a;
    return (encodeFlag("kind", flags.kind) |
        encodeFlag("partiallyFillable", flags.partiallyFillable) |
        encodeFlag("sellTokenBalance", (_a = flags.sellTokenBalance) !== null && _a !== void 0 ? _a : OrderBalance.ERC20) |
        encodeFlag("buyTokenBalance", normalizeBuyTokenBalance(flags.buyTokenBalance)));
}
/**
 * Decode order flags from a bitfield.
 *
 * @param flags The order flags encoded as a bitfield.
 * @return The decoded order flags.
 */
export function decodeOrderFlags(flags) {
    return {
        kind: decodeFlag("kind", flags),
        partiallyFillable: decodeFlag("partiallyFillable", flags),
        sellTokenBalance: decodeFlag("sellTokenBalance", flags),
        buyTokenBalance: decodeFlag("buyTokenBalance", flags),
    };
}
/**
 * Encodes trade flags as a bitfield.
 *
 * @param flags The trade flags to encode.
 * @return The bitfield result.
 */
export function encodeTradeFlags(flags) {
    return encodeOrderFlags(flags) | encodeSigningScheme(flags.signingScheme);
}
/**
 * Decode trade flags from a bitfield.
 *
 * @param flags The trade flags encoded as a bitfield.
 * @return The bitfield result.
 */
export function decodeTradeFlags(flags) {
    return Object.assign(Object.assign({}, decodeOrderFlags(flags)), { signingScheme: decodeSigningScheme(flags) });
}
export function encodeSignatureData(sig) {
    switch (sig.scheme) {
        case SigningScheme.EIP712:
        case SigningScheme.ETHSIGN:
            return ethers.utils.joinSignature(sig.data);
        case SigningScheme.EIP1271:
            return encodeEip1271SignatureData(sig.data);
        case SigningScheme.PRESIGN:
            return ethers.utils.getAddress(sig.data);
        default:
            throw new Error("unsupported signing scheme");
    }
}
export function decodeSignatureOwner(domain, order, scheme, sig) {
    switch (scheme) {
        case SigningScheme.EIP712:
            return ethers.utils.verifyTypedData(domain, { Order: ORDER_TYPE_FIELDS }, normalizeOrder(order), sig);
        case SigningScheme.ETHSIGN:
            return ethers.utils.verifyMessage(ethers.utils.arrayify(hashTypedData(domain, { Order: ORDER_TYPE_FIELDS }, normalizeOrder(order))), sig);
        case SigningScheme.EIP1271:
            return decodeEip1271SignatureData(sig).verifier;
        case SigningScheme.PRESIGN:
            return ethers.utils.getAddress(ethers.utils.hexlify(sig));
        default:
            throw new Error("unsupported signing scheme");
    }
}
/**
 * Encodes a trade to be used with the settlement contract.
 */
export function encodeTrade(tokens, order, signature, { executedAmount }) {
    const tradeFlags = Object.assign(Object.assign({}, order), { signingScheme: signature.scheme });
    const o = normalizeOrder(order);
    return {
        sellTokenIndex: tokens.index(o.sellToken),
        buyTokenIndex: tokens.index(o.buyToken),
        receiver: o.receiver,
        sellAmount: o.sellAmount,
        buyAmount: o.buyAmount,
        validTo: o.validTo,
        appData: o.appData,
        feeAmount: o.feeAmount,
        flags: encodeTradeFlags(tradeFlags),
        executedAmount,
        signature: encodeSignatureData(signature),
    };
}
/**
 * A class used for tracking tokens when encoding settlements.
 *
 * This is used as settlement trades reference tokens by index instead of
 * directly by address for multiple reasons:
 * - Reduce encoding size of orders to save on `calldata` gas.
 * - Direct access to a token's clearing price on settlement instead of
 *   requiring a search.
 */
export class TokenRegistry {
    constructor() {
        this._tokens = [];
        this._tokenMap = {};
    }
    /**
     * Gets the array of token addresses currently stored in the registry.
     */
    get addresses() {
        // NOTE: Make sure to slice the original array, so it cannot be modified
        // outside of this class.
        return this._tokens.slice();
    }
    /**
     * Retrieves the token index for the specified token address. If the token is
     * not in the registry, it will be added.
     *
     * @param token The token address to add to the registry.
     * @return The token index.
     */
    index(token) {
        // NOTE: Verify and normalize the address into a case-checksummed address.
        // Not only does this ensure validity of the addresses early on, it also
        // makes it so `0xff...f` and `0xFF..F` map to the same ID.
        const tokenAddress = ethers.utils.getAddress(token);
        let tokenIndex = this._tokenMap[tokenAddress];
        if (tokenIndex === undefined) {
            tokenIndex = this._tokens.length;
            this._tokens.push(tokenAddress);
            this._tokenMap[tokenAddress] = tokenIndex;
        }
        return tokenIndex;
    }
}
/**
 * A class for building calldata for a settlement.
 *
 * The encoder ensures that token addresses are kept track of and performs
 * necessary computation in order to map each token addresses to IDs to
 * properly encode order parameters for trades.
 */
export class SettlementEncoder {
    /**
     * Creates a new settlement encoder instance.
     * @param domain Domain used for signing orders. See {@link signOrder} for
     * more details.
     */
    constructor(domain) {
        this.domain = domain;
        this._tokens = new TokenRegistry();
        this._trades = [];
        this._interactions = {
            [InteractionStage.PRE]: [],
            [InteractionStage.INTRA]: [],
            [InteractionStage.POST]: [],
        };
        this._orderRefunds = {
            filledAmounts: [],
            preSignatures: [],
        };
    }
    /**
     * Gets the array of token addresses used by the currently encoded orders.
     */
    get tokens() {
        // NOTE: Make sure to slice the original array, so it cannot be modified
        // outside of this class.
        return this._tokens.addresses;
    }
    /**
     * Gets the encoded trades.
     */
    get trades() {
        return this._trades.slice();
    }
    /**
     * Gets all encoded interactions for all stages.
     *
     * Note that order refund interactions are included as post-interactions.
     */
    get interactions() {
        return [
            this._interactions[InteractionStage.PRE].slice(),
            this._interactions[InteractionStage.INTRA].slice(),
            [
                ...this._interactions[InteractionStage.POST],
                ...this.encodedOrderRefunds,
            ],
        ];
    }
    /**
     * Gets the order refunds encoded as interactions.
     */
    get encodedOrderRefunds() {
        const { filledAmounts, preSignatures } = this._orderRefunds;
        if (filledAmounts.length + preSignatures.length === 0) {
            return [];
        }
        const settlement = this.domain.verifyingContract;
        if (settlement === undefined) {
            throw new Error("domain missing settlement contract address");
        }
        // NOTE: Avoid importing the full GPv2Settlement contract artifact just for
        // a tiny snippet of the ABI. Unit and integration tests will catch any
        // issues that may arise from this definition becoming out of date.
        const iface = new ethers.utils.Interface([
            "function freeFilledAmountStorage(bytes[] orderUids)",
            "function freePreSignatureStorage(bytes[] orderUids)",
        ]);
        const interactions = [];
        for (const [functionName, orderUids] of [
            ["freeFilledAmountStorage", filledAmounts],
            ["freePreSignatureStorage", preSignatures],
        ].filter(([, orderUids]) => orderUids.length > 0)) {
            interactions.push(normalizeInteraction({
                target: settlement,
                callData: iface.encodeFunctionData(functionName, [orderUids]),
            }));
        }
        return interactions;
    }
    /**
     * Returns a clearing price vector for the current settlement tokens from the
     * provided price map.
     *
     * @param prices The price map from token address to price.
     * @return The price vector.
     */
    clearingPrices(prices) {
        return this.tokens.map((token) => {
            const price = prices[token];
            if (price === undefined) {
                throw new Error(`missing price for token ${token}`);
            }
            return price;
        });
    }
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
    encodeTrade(order, signature, { executedAmount } = {}) {
        if (order.partiallyFillable && executedAmount === undefined) {
            throw new Error("missing executed amount for partially fillable trade");
        }
        this._trades.push(encodeTrade(this._tokens, order, signature, {
            executedAmount: executedAmount !== null && executedAmount !== void 0 ? executedAmount : 0,
        }));
    }
    /**
     * Signs an order and encodes a trade with that order.
     *
     * @param order The order to sign for the trade.
     * @param owner The externally owned account that should sign the order.
     * @param scheme The signing scheme to use. See {@link SigningScheme} for more
     * details.
     * @param tradeExecution The execution details for the trade.
     */
    signEncodeTrade(order, owner, scheme, tradeExecution) {
        return __awaiter(this, void 0, void 0, function* () {
            const signature = yield signOrder(this.domain, order, owner, scheme);
            this.encodeTrade(order, signature, tradeExecution);
        });
    }
    /**
     * Encodes the input interaction in the packed format accepted by the smart
     * contract and adds it to the interactions encoded so far.
     *
     * @param stage The stage the interaction should be executed.
     * @param interaction The interaction to encode.
     */
    encodeInteraction(interaction, stage = InteractionStage.INTRA) {
        this._interactions[stage].push(normalizeInteraction(interaction));
    }
    /**
     * Encodes order UIDs for gas refunds.
     *
     * @param settlement The address of the settlement contract.
     * @param orderRefunds The order refunds to encode.
     */
    encodeOrderRefunds(orderRefunds) {
        var _a, _b;
        if (this.domain.verifyingContract === undefined) {
            throw new Error("domain missing settlement contract address");
        }
        const filledAmounts = (_a = orderRefunds.filledAmounts) !== null && _a !== void 0 ? _a : [];
        const preSignatures = (_b = orderRefunds.preSignatures) !== null && _b !== void 0 ? _b : [];
        if (![...filledAmounts, ...preSignatures].every((orderUid) => ethers.utils.isHexString(orderUid, ORDER_UID_LENGTH))) {
            throw new Error("one or more invalid order UIDs");
        }
        this._orderRefunds.filledAmounts.push(...filledAmounts);
        this._orderRefunds.preSignatures.push(...preSignatures);
    }
    /**
     * Returns the encoded settlement parameters.
     */
    encodedSettlement(prices) {
        return [
            this.tokens,
            this.clearingPrices(prices),
            this.trades,
            this.interactions,
        ];
    }
    /**
     * Returns an encoded settlement that exclusively performs setup interactions.
     * This method can be used, for example, to set the settlement contract's
     * allowances to other protocols it may interact with.
     *
     * @param interactions The list of setup interactions to encode.
     */
    static encodedSetup(...interactions) {
        const encoder = new SettlementEncoder({ name: "unused" });
        for (const interaction of interactions) {
            encoder.encodeInteraction(interaction);
        }
        return encoder.encodedSettlement({});
    }
}
/**
 * Decodes an order from a settlement trade.
 *
 * @param trade The trade to decode into an order.
 * @param tokens The list of token addresses as they appear in the settlement.
 * @returns The decoded order.
 */
export function decodeOrder(trade, tokens) {
    const sellTokenIndex = BigNumber.from(trade.sellTokenIndex).toNumber();
    const buyTokenIndex = BigNumber.from(trade.buyTokenIndex).toNumber();
    if (Math.max(sellTokenIndex, buyTokenIndex) >= tokens.length) {
        throw new Error("Invalid trade");
    }
    return Object.assign({ sellToken: tokens[sellTokenIndex], buyToken: tokens[buyTokenIndex], receiver: trade.receiver, sellAmount: trade.sellAmount, buyAmount: trade.buyAmount, validTo: BigNumber.from(trade.validTo).toNumber(), appData: trade.appData, feeAmount: trade.feeAmount }, decodeOrderFlags(trade.flags));
}
//# sourceMappingURL=settlement.js.map