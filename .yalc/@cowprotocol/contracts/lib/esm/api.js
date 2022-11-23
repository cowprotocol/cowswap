var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { BigNumber } from "ethers";
import fetch from "node-fetch";
import { normalizeOrder, OrderKind, } from "./order";
import { encodeSignatureData } from "./settlement";
import { SigningScheme } from "./sign";
export var Environment;
(function (Environment) {
    Environment[Environment["Dev"] = 0] = "Dev";
    Environment[Environment["Prod"] = 1] = "Prod";
})(Environment || (Environment = {}));
export function apiUrl(environment, network) {
    switch (environment) {
        case Environment.Dev:
            return `https://barn.api.cow.fi/${network}`;
        case Environment.Prod:
            return `https://api.cow.fi/${network}`;
        default:
            throw new Error("Invalid environment");
    }
}
export var GetQuoteErrorType;
(function (GetQuoteErrorType) {
    GetQuoteErrorType["SellAmountDoesNotCoverFee"] = "SellAmountDoesNotCoverFee";
    GetQuoteErrorType["NoLiquidity"] = "NoLiquidity";
    // other errors are added when necessary
})(GetQuoteErrorType || (GetQuoteErrorType = {}));
function apiKind(kind) {
    switch (kind) {
        case OrderKind.SELL:
            return "sell";
        case OrderKind.BUY:
            return "buy";
        default:
            throw new Error(`Unsupported kind ${kind}`);
    }
}
function apiSigningScheme(scheme) {
    switch (scheme) {
        case SigningScheme.EIP712:
            return "eip712";
        case SigningScheme.ETHSIGN:
            return "ethsign";
        case SigningScheme.EIP1271:
            return "eip1271";
        case SigningScheme.PRESIGN:
            return "presign";
        default:
            throw new Error(`Unsupported signing scheme ${scheme}`);
    }
}
function call(route, baseUrl, init) {
    return __awaiter(this, void 0, void 0, function* () {
        const url = `${baseUrl}/api/v1/${route}`;
        const response = yield fetch(url, init);
        const body = yield response.text();
        if (!response.ok) {
            const error = new Error(`Calling "${url} ${JSON.stringify(init)} failed with ${response.status}: ${body}`);
            try {
                error.apiError = JSON.parse(body);
            }
            catch (_a) {
                // no api error
            }
            throw error;
        }
        return JSON.parse(body);
    });
}
function estimateTradeAmount({ sellToken, buyToken, kind, amount, baseUrl, }) {
    return __awaiter(this, void 0, void 0, function* () {
        const response = yield call(`markets/${sellToken}-${buyToken}/${apiKind(kind)}/${BigNumber.from(amount).toString()}`, baseUrl);
        // The services return the quote token used for the price. The quote token
        // is checked to make sure that the returned price meets our expectations.
        if (response.token.toLowerCase() !== buyToken.toLowerCase()) {
            throw new Error(`Price returned for sell token ${sellToken} uses an incorrect quote token (${response.token.toLowerCase()} instead of ${buyToken.toLowerCase()})`);
        }
        return BigNumber.from(response.amount);
    });
}
function placeOrder({ order, signature, baseUrl, }) {
    return __awaiter(this, void 0, void 0, function* () {
        const normalizedOrder = normalizeOrder(order);
        return yield call("orders", baseUrl, {
            method: "post",
            body: JSON.stringify({
                sellToken: normalizedOrder.sellToken,
                buyToken: normalizedOrder.buyToken,
                sellAmount: BigNumber.from(normalizedOrder.sellAmount).toString(),
                buyAmount: BigNumber.from(normalizedOrder.buyAmount).toString(),
                validTo: normalizedOrder.validTo,
                appData: normalizedOrder.appData,
                feeAmount: BigNumber.from(normalizedOrder.feeAmount).toString(),
                kind: apiKind(order.kind),
                partiallyFillable: normalizedOrder.partiallyFillable,
                signature: encodeSignatureData(signature),
                signingScheme: apiSigningScheme(signature.scheme),
                receiver: normalizedOrder.receiver,
            }),
            headers: { "Content-Type": "application/json" },
        });
    });
}
function getExecutedSellAmount({ uid, baseUrl, }) {
    return __awaiter(this, void 0, void 0, function* () {
        const response = yield call(`orders/${uid}`, baseUrl);
        return BigNumber.from(response.executedSellAmount);
    });
}
function getQuote({ baseUrl }, quote) {
    return __awaiter(this, void 0, void 0, function* () {
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
        return call("quote", baseUrl, {
            method: "post",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(quote),
        });
    });
}
export class Api {
    constructor(network, baseUrlOrEnv) {
        this.network = network;
        let baseUrl;
        if (typeof baseUrlOrEnv === "string") {
            baseUrl = baseUrlOrEnv;
        }
        else {
            baseUrl = apiUrl(baseUrlOrEnv, network);
        }
        this.baseUrl = baseUrl;
    }
    apiCallParams() {
        return { network: this.network, baseUrl: this.baseUrl };
    }
    estimateTradeAmount(query) {
        return __awaiter(this, void 0, void 0, function* () {
            return estimateTradeAmount(Object.assign(Object.assign({}, this.apiCallParams()), query));
        });
    }
    placeOrder(query) {
        return __awaiter(this, void 0, void 0, function* () {
            return placeOrder(Object.assign(Object.assign({}, this.apiCallParams()), query));
        });
    }
    getExecutedSellAmount(query) {
        return __awaiter(this, void 0, void 0, function* () {
            return getExecutedSellAmount(Object.assign(Object.assign({}, this.apiCallParams()), query));
        });
    }
    getQuote(query) {
        return __awaiter(this, void 0, void 0, function* () {
            return getQuote(this.apiCallParams(), query);
        });
    }
}
//# sourceMappingURL=api.js.map