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
Object.defineProperty(exports, "__esModule", { value: true });
exports.SwapEncoder = exports.encodeSwapStep = void 0;
var order_1 = require("./order");
var settlement_1 = require("./settlement");
var sign_1 = require("./sign");
/**
 * Encodes a swap as a {@link BatchSwapStep} to be used with the settlement
 * contract.
 */
function encodeSwapStep(tokens, swap) {
    return {
        poolId: swap.poolId,
        assetInIndex: tokens.index(swap.assetIn),
        assetOutIndex: tokens.index(swap.assetOut),
        amount: swap.amount,
        userData: swap.userData || "0x",
    };
}
exports.encodeSwapStep = encodeSwapStep;
/**
 * A class for building calldata for a swap.
 *
 * The encoder ensures that token addresses are kept track of and performs
 * necessary computation in order to map each token addresses to IDs to
 * properly encode swap requests and the trade.
 */
var SwapEncoder = /** @class */ (function () {
    /**
     * Creates a new settlement encoder instance.
     *
     * @param domain Domain used for signing orders. See {@link signOrder} for
     * more details.
     */
    function SwapEncoder(domain) {
        this.domain = domain;
        this._tokens = new settlement_1.TokenRegistry();
        this._swaps = [];
        this._trade = undefined;
    }
    Object.defineProperty(SwapEncoder.prototype, "tokens", {
        /**
         * Gets the array of token addresses used by the currently encoded swaps.
         */
        get: function () {
            // NOTE: Make sure to slice the original array, so it cannot be modified
            // outside of this class.
            return this._tokens.addresses;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(SwapEncoder.prototype, "swaps", {
        /**
         * Gets the encoded swaps.
         */
        get: function () {
            return this._swaps.slice();
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(SwapEncoder.prototype, "trade", {
        /**
         * Gets the encoded trade.
         */
        get: function () {
            if (this._trade === undefined) {
                throw new Error("trade not encoded");
            }
            return this._trade;
        },
        enumerable: false,
        configurable: true
    });
    /**
     * Encodes the swap as a swap request and appends it to the swaps encoded so
     * far.
     *
     * @param swap The Balancer swap to encode.
     */
    SwapEncoder.prototype.encodeSwapStep = function () {
        var _a;
        var _this = this;
        var swaps = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            swaps[_i] = arguments[_i];
        }
        (_a = this._swaps).push.apply(_a, swaps.map(function (swap) { return encodeSwapStep(_this._tokens, swap); }));
    };
    /**
     * Encodes a trade from a signed order.
     *
     * Additionally, if the order references new tokens that the encoder has not
     * yet seen, they are added to the tokens array.
     *
     * @param order The order of the trade to encode.
     * @param signature The signature for the order data.
     */
    SwapEncoder.prototype.encodeTrade = function (order, signature, swapExecution) {
        var limitAmount = __assign({ limitAmount: order.kind == order_1.OrderKind.SELL ? order.buyAmount : order.sellAmount }, swapExecution).limitAmount;
        this._trade = (0, settlement_1.encodeTrade)(this._tokens, order, signature, {
            executedAmount: limitAmount,
        });
    };
    /**
     * Signs an order and encodes a trade with that order.
     *
     * @param order The order to sign for the trade.
     * @param owner The externally owned account that should sign the order.
     * @param scheme The signing scheme to use. See {@link SigningScheme} for more
     * details.
     */
    SwapEncoder.prototype.signEncodeTrade = function (order, owner, scheme, swapExecution) {
        return __awaiter(this, void 0, void 0, function () {
            var signature;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, (0, sign_1.signOrder)(this.domain, order, owner, scheme)];
                    case 1:
                        signature = _a.sent();
                        this.encodeTrade(order, signature, swapExecution);
                        return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Returns the encoded swap parameters for the current state of the encoder.
     *
     * This method with raise an exception if a trade has not been encoded.
     */
    SwapEncoder.prototype.encodedSwap = function () {
        return [this.swaps, this.tokens, this.trade];
    };
    /**
     * Utility method for encoding a direct swap between an order and Balancer
     * pools.
     *
     * This method functions identically to using a {@link SwapEncoder} and is
     * provided as a short-cut.
     */
    SwapEncoder.encodeSwap = function () {
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i] = arguments[_i];
        }
        if (args.length < 5) {
            var _a = args, swaps = _a[0], order = _a[1], signature = _a[2], swapExecution = _a[3];
            var encoder = new SwapEncoder({});
            encoder.encodeSwapStep.apply(encoder, swaps);
            encoder.encodeTrade(order, signature, swapExecution);
            return encoder.encodedSwap();
        }
        else {
            var _b = args, domain = _b[0], swaps = _b[1], order = _b[2], owner = _b[3], scheme = _b[4], swapExecution = _b[5];
            var encoder_1 = new SwapEncoder(domain);
            encoder_1.encodeSwapStep.apply(encoder_1, swaps);
            return encoder_1
                .signEncodeTrade(order, owner, scheme, swapExecution)
                .then(function () { return encoder_1.encodedSwap(); });
        }
    };
    return SwapEncoder;
}());
exports.SwapEncoder = SwapEncoder;
//# sourceMappingURL=swap.js.map