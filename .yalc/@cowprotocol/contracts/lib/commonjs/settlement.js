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
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.decodeOrder = exports.SettlementEncoder = exports.TokenRegistry = exports.encodeTrade = exports.decodeSignatureOwner = exports.encodeSignatureData = exports.decodeTradeFlags = exports.encodeTradeFlags = exports.decodeOrderFlags = exports.encodeOrderFlags = exports.decodeSigningScheme = exports.encodeSigningScheme = exports.FLAG_MASKS = exports.InteractionStage = void 0;
var ethers_1 = require("ethers");
var interaction_1 = require("./interaction");
var order_1 = require("./order");
var sign_1 = require("./sign");
/**
 * The stage an interaction should be executed in.
 */
var InteractionStage;
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
})(InteractionStage = exports.InteractionStage || (exports.InteractionStage = {}));
/**
 * An object listing all flag options in order along with their bit offset.
 */
exports.FLAG_MASKS = {
    kind: {
        offset: 0,
        options: [order_1.OrderKind.SELL, order_1.OrderKind.BUY],
    },
    partiallyFillable: {
        offset: 1,
        options: [false, true],
    },
    sellTokenBalance: {
        offset: 2,
        options: [
            order_1.OrderBalance.ERC20,
            undefined,
            order_1.OrderBalance.EXTERNAL,
            order_1.OrderBalance.INTERNAL,
        ],
    },
    buyTokenBalance: {
        offset: 4,
        options: [order_1.OrderBalance.ERC20, order_1.OrderBalance.INTERNAL],
    },
    signingScheme: {
        offset: 5,
        options: [
            sign_1.SigningScheme.EIP712,
            sign_1.SigningScheme.ETHSIGN,
            sign_1.SigningScheme.EIP1271,
            sign_1.SigningScheme.PRESIGN,
        ],
    },
};
function encodeFlag(key, flag) {
    var index = exports.FLAG_MASKS[key].options.findIndex(function (search) { return search === flag; });
    if (index === undefined) {
        throw new Error("Bad key/value pair to encode: ".concat(key, "/").concat(flag));
    }
    return index << exports.FLAG_MASKS[key].offset;
}
// Counts the smallest mask needed to store the input options in the masked
// bitfield.
function mask(options) {
    var num = options.length;
    var bitCount = 32 - Math.clz32(num - 1);
    return (1 << bitCount) - 1;
}
function decodeFlag(key, flag) {
    var _a = exports.FLAG_MASKS[key], offset = _a.offset, options = _a.options;
    var numberFlags = ethers_1.BigNumber.from(flag).toNumber();
    var index = (numberFlags >> offset) & mask(options);
    // This type casting should not be needed
    var decoded = options[index];
    if (decoded === undefined || index < 0) {
        throw new Error("Invalid input flag for ".concat(key, ": 0b").concat(numberFlags.toString(2)));
    }
    return decoded;
}
/**
 * Encodes signing scheme as a bitfield.
 *
 * @param scheme The signing scheme to encode.
 * @return The bitfield result.
 */
function encodeSigningScheme(scheme) {
    return encodeFlag("signingScheme", scheme);
}
exports.encodeSigningScheme = encodeSigningScheme;
/**
 * Decodes signing scheme from a bitfield.
 *
 * @param flag The encoded order flag.
 * @return The decoded signing scheme.
 */
function decodeSigningScheme(flags) {
    return decodeFlag("signingScheme", flags);
}
exports.decodeSigningScheme = decodeSigningScheme;
/**
 * Encodes order flags as a bitfield.
 *
 * @param flags The order flags to encode.
 * @return The bitfield result.
 */
function encodeOrderFlags(flags) {
    var _a;
    return (encodeFlag("kind", flags.kind) |
        encodeFlag("partiallyFillable", flags.partiallyFillable) |
        encodeFlag("sellTokenBalance", (_a = flags.sellTokenBalance) !== null && _a !== void 0 ? _a : order_1.OrderBalance.ERC20) |
        encodeFlag("buyTokenBalance", (0, order_1.normalizeBuyTokenBalance)(flags.buyTokenBalance)));
}
exports.encodeOrderFlags = encodeOrderFlags;
/**
 * Decode order flags from a bitfield.
 *
 * @param flags The order flags encoded as a bitfield.
 * @return The decoded order flags.
 */
function decodeOrderFlags(flags) {
    return {
        kind: decodeFlag("kind", flags),
        partiallyFillable: decodeFlag("partiallyFillable", flags),
        sellTokenBalance: decodeFlag("sellTokenBalance", flags),
        buyTokenBalance: decodeFlag("buyTokenBalance", flags),
    };
}
exports.decodeOrderFlags = decodeOrderFlags;
/**
 * Encodes trade flags as a bitfield.
 *
 * @param flags The trade flags to encode.
 * @return The bitfield result.
 */
function encodeTradeFlags(flags) {
    return encodeOrderFlags(flags) | encodeSigningScheme(flags.signingScheme);
}
exports.encodeTradeFlags = encodeTradeFlags;
/**
 * Decode trade flags from a bitfield.
 *
 * @param flags The trade flags encoded as a bitfield.
 * @return The bitfield result.
 */
function decodeTradeFlags(flags) {
    return __assign(__assign({}, decodeOrderFlags(flags)), { signingScheme: decodeSigningScheme(flags) });
}
exports.decodeTradeFlags = decodeTradeFlags;
function encodeSignatureData(sig) {
    switch (sig.scheme) {
        case sign_1.SigningScheme.EIP712:
        case sign_1.SigningScheme.ETHSIGN:
            return ethers_1.ethers.utils.joinSignature(sig.data);
        case sign_1.SigningScheme.EIP1271:
            return (0, sign_1.encodeEip1271SignatureData)(sig.data);
        case sign_1.SigningScheme.PRESIGN:
            return ethers_1.ethers.utils.getAddress(sig.data);
        default:
            throw new Error("unsupported signing scheme");
    }
}
exports.encodeSignatureData = encodeSignatureData;
function decodeSignatureOwner(domain, order, scheme, sig) {
    switch (scheme) {
        case sign_1.SigningScheme.EIP712:
            return ethers_1.ethers.utils.verifyTypedData(domain, { Order: order_1.ORDER_TYPE_FIELDS }, (0, order_1.normalizeOrder)(order), sig);
        case sign_1.SigningScheme.ETHSIGN:
            return ethers_1.ethers.utils.verifyMessage(ethers_1.ethers.utils.arrayify((0, order_1.hashTypedData)(domain, { Order: order_1.ORDER_TYPE_FIELDS }, (0, order_1.normalizeOrder)(order))), sig);
        case sign_1.SigningScheme.EIP1271:
            return (0, sign_1.decodeEip1271SignatureData)(sig).verifier;
        case sign_1.SigningScheme.PRESIGN:
            return ethers_1.ethers.utils.getAddress(ethers_1.ethers.utils.hexlify(sig));
        default:
            throw new Error("unsupported signing scheme");
    }
}
exports.decodeSignatureOwner = decodeSignatureOwner;
/**
 * Encodes a trade to be used with the settlement contract.
 */
function encodeTrade(tokens, order, signature, _a) {
    var executedAmount = _a.executedAmount;
    var tradeFlags = __assign(__assign({}, order), { signingScheme: signature.scheme });
    var o = (0, order_1.normalizeOrder)(order);
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
        executedAmount: executedAmount,
        signature: encodeSignatureData(signature),
    };
}
exports.encodeTrade = encodeTrade;
/**
 * A class used for tracking tokens when encoding settlements.
 *
 * This is used as settlement trades reference tokens by index instead of
 * directly by address for multiple reasons:
 * - Reduce encoding size of orders to save on `calldata` gas.
 * - Direct access to a token's clearing price on settlement instead of
 *   requiring a search.
 */
var TokenRegistry = /** @class */ (function () {
    function TokenRegistry() {
        this._tokens = [];
        this._tokenMap = {};
    }
    Object.defineProperty(TokenRegistry.prototype, "addresses", {
        /**
         * Gets the array of token addresses currently stored in the registry.
         */
        get: function () {
            // NOTE: Make sure to slice the original array, so it cannot be modified
            // outside of this class.
            return this._tokens.slice();
        },
        enumerable: false,
        configurable: true
    });
    /**
     * Retrieves the token index for the specified token address. If the token is
     * not in the registry, it will be added.
     *
     * @param token The token address to add to the registry.
     * @return The token index.
     */
    TokenRegistry.prototype.index = function (token) {
        // NOTE: Verify and normalize the address into a case-checksummed address.
        // Not only does this ensure validity of the addresses early on, it also
        // makes it so `0xff...f` and `0xFF..F` map to the same ID.
        var tokenAddress = ethers_1.ethers.utils.getAddress(token);
        var tokenIndex = this._tokenMap[tokenAddress];
        if (tokenIndex === undefined) {
            tokenIndex = this._tokens.length;
            this._tokens.push(tokenAddress);
            this._tokenMap[tokenAddress] = tokenIndex;
        }
        return tokenIndex;
    };
    return TokenRegistry;
}());
exports.TokenRegistry = TokenRegistry;
/**
 * A class for building calldata for a settlement.
 *
 * The encoder ensures that token addresses are kept track of and performs
 * necessary computation in order to map each token addresses to IDs to
 * properly encode order parameters for trades.
 */
var SettlementEncoder = /** @class */ (function () {
    /**
     * Creates a new settlement encoder instance.
     * @param domain Domain used for signing orders. See {@link signOrder} for
     * more details.
     */
    function SettlementEncoder(domain) {
        var _a;
        this.domain = domain;
        this._tokens = new TokenRegistry();
        this._trades = [];
        this._interactions = (_a = {},
            _a[InteractionStage.PRE] = [],
            _a[InteractionStage.INTRA] = [],
            _a[InteractionStage.POST] = [],
            _a);
        this._orderRefunds = {
            filledAmounts: [],
            preSignatures: [],
        };
    }
    Object.defineProperty(SettlementEncoder.prototype, "tokens", {
        /**
         * Gets the array of token addresses used by the currently encoded orders.
         */
        get: function () {
            // NOTE: Make sure to slice the original array, so it cannot be modified
            // outside of this class.
            return this._tokens.addresses;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(SettlementEncoder.prototype, "trades", {
        /**
         * Gets the encoded trades.
         */
        get: function () {
            return this._trades.slice();
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(SettlementEncoder.prototype, "interactions", {
        /**
         * Gets all encoded interactions for all stages.
         *
         * Note that order refund interactions are included as post-interactions.
         */
        get: function () {
            return [
                this._interactions[InteractionStage.PRE].slice(),
                this._interactions[InteractionStage.INTRA].slice(),
                __spreadArray(__spreadArray([], this._interactions[InteractionStage.POST], true), this.encodedOrderRefunds, true),
            ];
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(SettlementEncoder.prototype, "encodedOrderRefunds", {
        /**
         * Gets the order refunds encoded as interactions.
         */
        get: function () {
            var _a = this._orderRefunds, filledAmounts = _a.filledAmounts, preSignatures = _a.preSignatures;
            if (filledAmounts.length + preSignatures.length === 0) {
                return [];
            }
            var settlement = this.domain.verifyingContract;
            if (settlement === undefined) {
                throw new Error("domain missing settlement contract address");
            }
            // NOTE: Avoid importing the full GPv2Settlement contract artifact just for
            // a tiny snippet of the ABI. Unit and integration tests will catch any
            // issues that may arise from this definition becoming out of date.
            var iface = new ethers_1.ethers.utils.Interface([
                "function freeFilledAmountStorage(bytes[] orderUids)",
                "function freePreSignatureStorage(bytes[] orderUids)",
            ]);
            var interactions = [];
            for (var _i = 0, _b = [
                ["freeFilledAmountStorage", filledAmounts],
                ["freePreSignatureStorage", preSignatures],
            ].filter(function (_a) {
                var orderUids = _a[1];
                return orderUids.length > 0;
            }); _i < _b.length; _i++) {
                var _c = _b[_i], functionName = _c[0], orderUids = _c[1];
                interactions.push((0, interaction_1.normalizeInteraction)({
                    target: settlement,
                    callData: iface.encodeFunctionData(functionName, [orderUids]),
                }));
            }
            return interactions;
        },
        enumerable: false,
        configurable: true
    });
    /**
     * Returns a clearing price vector for the current settlement tokens from the
     * provided price map.
     *
     * @param prices The price map from token address to price.
     * @return The price vector.
     */
    SettlementEncoder.prototype.clearingPrices = function (prices) {
        return this.tokens.map(function (token) {
            var price = prices[token];
            if (price === undefined) {
                throw new Error("missing price for token ".concat(token));
            }
            return price;
        });
    };
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
    SettlementEncoder.prototype.encodeTrade = function (order, signature, _a) {
        var _b = _a === void 0 ? {} : _a, executedAmount = _b.executedAmount;
        if (order.partiallyFillable && executedAmount === undefined) {
            throw new Error("missing executed amount for partially fillable trade");
        }
        this._trades.push(encodeTrade(this._tokens, order, signature, {
            executedAmount: executedAmount !== null && executedAmount !== void 0 ? executedAmount : 0,
        }));
    };
    /**
     * Signs an order and encodes a trade with that order.
     *
     * @param order The order to sign for the trade.
     * @param owner The externally owned account that should sign the order.
     * @param scheme The signing scheme to use. See {@link SigningScheme} for more
     * details.
     * @param tradeExecution The execution details for the trade.
     */
    SettlementEncoder.prototype.signEncodeTrade = function (order, owner, scheme, tradeExecution) {
        return __awaiter(this, void 0, void 0, function () {
            var signature;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, (0, sign_1.signOrder)(this.domain, order, owner, scheme)];
                    case 1:
                        signature = _a.sent();
                        this.encodeTrade(order, signature, tradeExecution);
                        return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Encodes the input interaction in the packed format accepted by the smart
     * contract and adds it to the interactions encoded so far.
     *
     * @param stage The stage the interaction should be executed.
     * @param interaction The interaction to encode.
     */
    SettlementEncoder.prototype.encodeInteraction = function (interaction, stage) {
        if (stage === void 0) { stage = InteractionStage.INTRA; }
        this._interactions[stage].push((0, interaction_1.normalizeInteraction)(interaction));
    };
    /**
     * Encodes order UIDs for gas refunds.
     *
     * @param settlement The address of the settlement contract.
     * @param orderRefunds The order refunds to encode.
     */
    SettlementEncoder.prototype.encodeOrderRefunds = function (orderRefunds) {
        var _a, _b;
        var _c, _d;
        if (this.domain.verifyingContract === undefined) {
            throw new Error("domain missing settlement contract address");
        }
        var filledAmounts = (_c = orderRefunds.filledAmounts) !== null && _c !== void 0 ? _c : [];
        var preSignatures = (_d = orderRefunds.preSignatures) !== null && _d !== void 0 ? _d : [];
        if (!__spreadArray(__spreadArray([], filledAmounts, true), preSignatures, true).every(function (orderUid) {
            return ethers_1.ethers.utils.isHexString(orderUid, order_1.ORDER_UID_LENGTH);
        })) {
            throw new Error("one or more invalid order UIDs");
        }
        (_a = this._orderRefunds.filledAmounts).push.apply(_a, filledAmounts);
        (_b = this._orderRefunds.preSignatures).push.apply(_b, preSignatures);
    };
    /**
     * Returns the encoded settlement parameters.
     */
    SettlementEncoder.prototype.encodedSettlement = function (prices) {
        return [
            this.tokens,
            this.clearingPrices(prices),
            this.trades,
            this.interactions,
        ];
    };
    /**
     * Returns an encoded settlement that exclusively performs setup interactions.
     * This method can be used, for example, to set the settlement contract's
     * allowances to other protocols it may interact with.
     *
     * @param interactions The list of setup interactions to encode.
     */
    SettlementEncoder.encodedSetup = function () {
        var interactions = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            interactions[_i] = arguments[_i];
        }
        var encoder = new SettlementEncoder({ name: "unused" });
        for (var _a = 0, interactions_1 = interactions; _a < interactions_1.length; _a++) {
            var interaction = interactions_1[_a];
            encoder.encodeInteraction(interaction);
        }
        return encoder.encodedSettlement({});
    };
    return SettlementEncoder;
}());
exports.SettlementEncoder = SettlementEncoder;
/**
 * Decodes an order from a settlement trade.
 *
 * @param trade The trade to decode into an order.
 * @param tokens The list of token addresses as they appear in the settlement.
 * @returns The decoded order.
 */
function decodeOrder(trade, tokens) {
    var sellTokenIndex = ethers_1.BigNumber.from(trade.sellTokenIndex).toNumber();
    var buyTokenIndex = ethers_1.BigNumber.from(trade.buyTokenIndex).toNumber();
    if (Math.max(sellTokenIndex, buyTokenIndex) >= tokens.length) {
        throw new Error("Invalid trade");
    }
    return __assign({ sellToken: tokens[sellTokenIndex], buyToken: tokens[buyTokenIndex], receiver: trade.receiver, sellAmount: trade.sellAmount, buyAmount: trade.buyAmount, validTo: ethers_1.BigNumber.from(trade.validTo).toNumber(), appData: trade.appData, feeAmount: trade.feeAmount }, decodeOrderFlags(trade.flags));
}
exports.decodeOrder = decodeOrder;
//# sourceMappingURL=settlement.js.map