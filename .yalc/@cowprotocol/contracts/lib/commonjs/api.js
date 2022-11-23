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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Api = exports.GetQuoteErrorType = exports.apiUrl = exports.Environment = void 0;
var ethers_1 = require("ethers");
var node_fetch_1 = __importDefault(require("node-fetch"));
var order_1 = require("./order");
var settlement_1 = require("./settlement");
var sign_1 = require("./sign");
var Environment;
(function (Environment) {
    Environment[Environment["Dev"] = 0] = "Dev";
    Environment[Environment["Prod"] = 1] = "Prod";
})(Environment = exports.Environment || (exports.Environment = {}));
function apiUrl(environment, network) {
    switch (environment) {
        case Environment.Dev:
            return "https://barn.api.cow.fi/".concat(network);
        case Environment.Prod:
            return "https://api.cow.fi/".concat(network);
        default:
            throw new Error("Invalid environment");
    }
}
exports.apiUrl = apiUrl;
var GetQuoteErrorType;
(function (GetQuoteErrorType) {
    GetQuoteErrorType["SellAmountDoesNotCoverFee"] = "SellAmountDoesNotCoverFee";
    GetQuoteErrorType["NoLiquidity"] = "NoLiquidity";
    // other errors are added when necessary
})(GetQuoteErrorType = exports.GetQuoteErrorType || (exports.GetQuoteErrorType = {}));
function apiKind(kind) {
    switch (kind) {
        case order_1.OrderKind.SELL:
            return "sell";
        case order_1.OrderKind.BUY:
            return "buy";
        default:
            throw new Error("Unsupported kind ".concat(kind));
    }
}
function apiSigningScheme(scheme) {
    switch (scheme) {
        case sign_1.SigningScheme.EIP712:
            return "eip712";
        case sign_1.SigningScheme.ETHSIGN:
            return "ethsign";
        case sign_1.SigningScheme.EIP1271:
            return "eip1271";
        case sign_1.SigningScheme.PRESIGN:
            return "presign";
        default:
            throw new Error("Unsupported signing scheme ".concat(scheme));
    }
}
function call(route, baseUrl, init) {
    return __awaiter(this, void 0, void 0, function () {
        var url, response, body, error;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    url = "".concat(baseUrl, "/api/v1/").concat(route);
                    return [4 /*yield*/, (0, node_fetch_1.default)(url, init)];
                case 1:
                    response = _a.sent();
                    return [4 /*yield*/, response.text()];
                case 2:
                    body = _a.sent();
                    if (!response.ok) {
                        error = new Error("Calling \"".concat(url, " ").concat(JSON.stringify(init), " failed with ").concat(response.status, ": ").concat(body));
                        try {
                            error.apiError = JSON.parse(body);
                        }
                        catch (_b) {
                            // no api error
                        }
                        throw error;
                    }
                    return [2 /*return*/, JSON.parse(body)];
            }
        });
    });
}
function estimateTradeAmount(_a) {
    var sellToken = _a.sellToken, buyToken = _a.buyToken, kind = _a.kind, amount = _a.amount, baseUrl = _a.baseUrl;
    return __awaiter(this, void 0, void 0, function () {
        var response;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0: return [4 /*yield*/, call("markets/".concat(sellToken, "-").concat(buyToken, "/").concat(apiKind(kind), "/").concat(ethers_1.BigNumber.from(amount).toString()), baseUrl)];
                case 1:
                    response = _b.sent();
                    // The services return the quote token used for the price. The quote token
                    // is checked to make sure that the returned price meets our expectations.
                    if (response.token.toLowerCase() !== buyToken.toLowerCase()) {
                        throw new Error("Price returned for sell token ".concat(sellToken, " uses an incorrect quote token (").concat(response.token.toLowerCase(), " instead of ").concat(buyToken.toLowerCase(), ")"));
                    }
                    return [2 /*return*/, ethers_1.BigNumber.from(response.amount)];
            }
        });
    });
}
function placeOrder(_a) {
    var order = _a.order, signature = _a.signature, baseUrl = _a.baseUrl;
    return __awaiter(this, void 0, void 0, function () {
        var normalizedOrder;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    normalizedOrder = (0, order_1.normalizeOrder)(order);
                    return [4 /*yield*/, call("orders", baseUrl, {
                            method: "post",
                            body: JSON.stringify({
                                sellToken: normalizedOrder.sellToken,
                                buyToken: normalizedOrder.buyToken,
                                sellAmount: ethers_1.BigNumber.from(normalizedOrder.sellAmount).toString(),
                                buyAmount: ethers_1.BigNumber.from(normalizedOrder.buyAmount).toString(),
                                validTo: normalizedOrder.validTo,
                                appData: normalizedOrder.appData,
                                feeAmount: ethers_1.BigNumber.from(normalizedOrder.feeAmount).toString(),
                                kind: apiKind(order.kind),
                                partiallyFillable: normalizedOrder.partiallyFillable,
                                signature: (0, settlement_1.encodeSignatureData)(signature),
                                signingScheme: apiSigningScheme(signature.scheme),
                                receiver: normalizedOrder.receiver,
                            }),
                            headers: { "Content-Type": "application/json" },
                        })];
                case 1: return [2 /*return*/, _b.sent()];
            }
        });
    });
}
function getExecutedSellAmount(_a) {
    var uid = _a.uid, baseUrl = _a.baseUrl;
    return __awaiter(this, void 0, void 0, function () {
        var response;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0: return [4 /*yield*/, call("orders/".concat(uid), baseUrl)];
                case 1:
                    response = _b.sent();
                    return [2 /*return*/, ethers_1.BigNumber.from(response.executedSellAmount)];
            }
        });
    });
}
function getQuote(_a, quote) {
    var baseUrl = _a.baseUrl;
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_b) {
            // Convert BigNumber into JSON strings (native serialisation is a hex object)
            if (quote.sellAmountBeforeFee) {
                quote.sellAmountBeforeFee = (quote).sellAmountBeforeFee.toString();
            }
            if (quote.sellAmountAfterFee) {
                quote.sellAmountAfterFee = (quote).sellAmountAfterFee.toString();
            }
            if (quote.buyAmountAfterFee) {
                quote.buyAmountAfterFee = (quote).buyAmountAfterFee.toString();
            }
            return [2 /*return*/, call("quote", baseUrl, {
                    method: "post",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(quote),
                })];
        });
    });
}
var Api = /** @class */ (function () {
    function Api(network, baseUrlOrEnv) {
        this.network = network;
        var baseUrl;
        if (typeof baseUrlOrEnv === "string") {
            baseUrl = baseUrlOrEnv;
        }
        else {
            baseUrl = apiUrl(baseUrlOrEnv, network);
        }
        this.baseUrl = baseUrl;
    }
    Api.prototype.apiCallParams = function () {
        return { network: this.network, baseUrl: this.baseUrl };
    };
    Api.prototype.estimateTradeAmount = function (query) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, estimateTradeAmount(__assign(__assign({}, this.apiCallParams()), query))];
            });
        });
    };
    Api.prototype.placeOrder = function (query) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, placeOrder(__assign(__assign({}, this.apiCallParams()), query))];
            });
        });
    };
    Api.prototype.getExecutedSellAmount = function (query) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, getExecutedSellAmount(__assign(__assign({}, this.apiCallParams()), query))];
            });
        });
    };
    Api.prototype.getQuote = function (query) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, getQuote(this.apiCallParams(), query)];
            });
        });
    };
    return Api;
}());
exports.Api = Api;
//# sourceMappingURL=api.js.map