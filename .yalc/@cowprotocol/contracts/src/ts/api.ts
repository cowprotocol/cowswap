import { BigNumber, BigNumberish } from "ethers";
import fetch, { RequestInit } from "node-fetch";

import {
  normalizeOrder,
  Order,
  OrderKind,
  Timestamp,
  HashLike,
  OrderBalance,
} from "./order";
import { encodeSignatureData } from "./settlement";
import { Signature, SigningScheme } from "./sign";

export enum Environment {
  Dev,
  Prod,
}

export function apiUrl(environment: Environment, network: string): string {
  switch (environment) {
    case Environment.Dev:
      return `https://barn.api.cow.fi/${network}`;
    case Environment.Prod:
      return `https://api.cow.fi/${network}`;
    default:
      throw new Error("Invalid environment");
  }
}

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

export type SellAmountBeforeFee = {
  kind: OrderKind.SELL;
  sellAmountBeforeFee: BigNumberish;
};

export type SellAmountAfterFee = {
  kind: OrderKind.SELL;
  sellAmountAfterFee: BigNumberish;
};

export type BuyAmountAfterFee = {
  kind: OrderKind.BUY;
  buyAmountAfterFee: BigNumberish;
};

export type QuoteQuery = CommonQuoteQuery &
  (SellAmountBeforeFee | SellAmountAfterFee | BuyAmountAfterFee);

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
  // Other fields are omitted until needed
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

export enum GetQuoteErrorType {
  SellAmountDoesNotCoverFee = "SellAmountDoesNotCoverFee",
  NoLiquidity = "NoLiquidity",
  // other errors are added when necessary
}

function apiKind(kind: OrderKind): string {
  switch (kind) {
    case OrderKind.SELL:
      return "sell";
    case OrderKind.BUY:
      return "buy";
    default:
      throw new Error(`Unsupported kind ${kind}`);
  }
}

function apiSigningScheme(scheme: SigningScheme): string {
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

async function call<T>(
  route: string,
  baseUrl: string,
  init?: RequestInit,
): Promise<T> {
  const url = `${baseUrl}/api/v1/${route}`;
  const response = await fetch(url, init);
  const body = await response.text();
  if (!response.ok) {
    const error: CallError = new Error(
      `Calling "${url} ${JSON.stringify(init)} failed with ${
        response.status
      }: ${body}`,
    );
    try {
      error.apiError = JSON.parse(body);
    } catch {
      // no api error
    }
    throw error;
  }
  return JSON.parse(body);
}

async function estimateTradeAmount({
  sellToken,
  buyToken,
  kind,
  amount,
  baseUrl,
}: EstimateTradeAmountQuery & ApiCall): Promise<BigNumber> {
  const response: EstimateAmountResponse = await call(
    `markets/${sellToken}-${buyToken}/${apiKind(kind)}/${BigNumber.from(
      amount,
    ).toString()}`,
    baseUrl,
  );
  // The services return the quote token used for the price. The quote token
  // is checked to make sure that the returned price meets our expectations.
  if (response.token.toLowerCase() !== buyToken.toLowerCase()) {
    throw new Error(
      `Price returned for sell token ${sellToken} uses an incorrect quote token (${response.token.toLowerCase()} instead of ${buyToken.toLowerCase()})`,
    );
  }
  return BigNumber.from(response.amount);
}

async function placeOrder({
  order,
  signature,
  baseUrl,
}: PlaceOrderQuery & ApiCall): Promise<string> {
  const normalizedOrder = normalizeOrder(order);
  return await call("orders", baseUrl, {
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
}

async function getExecutedSellAmount({
  uid,
  baseUrl,
}: GetExecutedSellAmountQuery & ApiCall): Promise<BigNumber> {
  const response: OrderDetailResponse = await call(`orders/${uid}`, baseUrl);
  return BigNumber.from(response.executedSellAmount);
}

async function getQuote(
  { baseUrl }: ApiCall,
  quote: QuoteQuery,
): Promise<GetQuoteResponse> {
  // Convert BigNumber into JSON strings (native serialisation is a hex object)
  if ((<SellAmountBeforeFee>quote).sellAmountBeforeFee) {
    (<SellAmountBeforeFee>quote).sellAmountBeforeFee = (<SellAmountBeforeFee>(
      quote
    )).sellAmountBeforeFee.toString();
  }
  if ((<SellAmountAfterFee>quote).sellAmountAfterFee) {
    (<SellAmountAfterFee>quote).sellAmountAfterFee = (<SellAmountAfterFee>(
      quote
    )).sellAmountAfterFee.toString();
  }
  if ((<BuyAmountAfterFee>quote).buyAmountAfterFee) {
    (<BuyAmountAfterFee>quote).buyAmountAfterFee = (<BuyAmountAfterFee>(
      quote
    )).buyAmountAfterFee.toString();
  }
  return call("quote", baseUrl, {
    method: "post",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(quote),
  });
}

export class Api {
  network: string;
  baseUrl: string;

  constructor(network: string, baseUrlOrEnv: string | Environment) {
    this.network = network;
    let baseUrl;
    if (typeof baseUrlOrEnv === "string") {
      baseUrl = baseUrlOrEnv;
    } else {
      baseUrl = apiUrl(baseUrlOrEnv, network);
    }
    this.baseUrl = baseUrl;
  }

  private apiCallParams() {
    return { network: this.network, baseUrl: this.baseUrl };
  }

  async estimateTradeAmount(
    query: EstimateTradeAmountQuery,
  ): Promise<BigNumber> {
    return estimateTradeAmount({ ...this.apiCallParams(), ...query });
  }
  async placeOrder(query: PlaceOrderQuery): Promise<string> {
    return placeOrder({ ...this.apiCallParams(), ...query });
  }
  async getExecutedSellAmount(
    query: GetExecutedSellAmountQuery,
  ): Promise<BigNumber> {
    return getExecutedSellAmount({ ...this.apiCallParams(), ...query });
  }
  async getQuote(query: QuoteQuery): Promise<GetQuoteResponse> {
    return getQuote(this.apiCallParams(), query);
  }
}
