import { BigNumber, BigNumberish } from "ethers";
import { Order, OrderKind, Timestamp, HashLike, OrderBalance } from "./order";
import { Signature } from "./sign";
export declare enum Environment {
    Dev = 0,
    Prod = 1
}
export declare function apiUrl(environment: Environment, network: string): string;
export interface ApiCall {
    baseUrl: string;
}
export interface EstimateTradeAmountQuery {
    sellToken: string;
    buyToken: string;
    kind: OrderKind;
    amount: BigNumberish;
}
export interface PlaceOrderQuery {
    order: Order;
    signature: Signature;
}
export interface GetExecutedSellAmountQuery {
    uid: string;
}
export declare type SellAmountBeforeFee = {
    kind: OrderKind.SELL;
    sellAmountBeforeFee: BigNumberish;
};
export declare type SellAmountAfterFee = {
    kind: OrderKind.SELL;
    sellAmountAfterFee: BigNumberish;
};
export declare type BuyAmountAfterFee = {
    kind: OrderKind.BUY;
    buyAmountAfterFee: BigNumberish;
};
export declare type QuoteQuery = CommonQuoteQuery & (SellAmountBeforeFee | SellAmountAfterFee | BuyAmountAfterFee);
export interface CommonQuoteQuery {
    sellToken: string;
    buyToken: string;
    receiver?: string;
    validTo: Timestamp;
    appData: HashLike;
    partiallyFillable: boolean;
    sellTokenBalance?: OrderBalance;
    buyTokenBalance?: OrderBalance;
    from: string;
}
export interface OrderDetailResponse {
    executedSellAmount: string;
}
export interface EstimateAmountResponse {
    amount: string;
    token: string;
}
export interface GetQuoteResponse {
    quote: Order;
    from: string;
    expirationDate: Timestamp;
}
export interface ApiError {
    errorType: string;
    description: string;
}
export interface CallError extends Error {
    apiError?: ApiError;
}
export declare enum GetQuoteErrorType {
    SellAmountDoesNotCoverFee = "SellAmountDoesNotCoverFee",
    NoLiquidity = "NoLiquidity"
}
export declare class Api {
    network: string;
    baseUrl: string;
    constructor(network: string, baseUrlOrEnv: string | Environment);
    private apiCallParams;
    estimateTradeAmount(query: EstimateTradeAmountQuery): Promise<BigNumber>;
    placeOrder(query: PlaceOrderQuery): Promise<string>;
    getExecutedSellAmount(query: GetExecutedSellAmountQuery): Promise<BigNumber>;
    getQuote(query: QuoteQuery): Promise<GetQuoteResponse>;
}
