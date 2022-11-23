import { BigNumberish } from "@ethersproject/bignumber";
import { utils } from "ethers";
import { task } from "hardhat/config";
import { HardhatRuntimeEnvironment } from "hardhat/types";

import { domain, OrderKind, SigningScheme, signOrder } from "../ts";
import {
  Api,
  Environment,
  SellAmountAfterFee,
  SellAmountBeforeFee,
  BuyAmountAfterFee,
} from "../ts/api";

import { getDeployedContract } from "./ts/deployment";
import { prompt } from "./ts/tui";

type OrderType = "sellBeforeFee" | "sellAfterFee" | "buyAfterFee";

const keccak = utils.id;
const APP_DATA = keccak("GPv2 place order script");
const ORDER_VALIDITY = 60 * 30;

interface Args {
  orderType: OrderType;
  from: string;
  to: string;
  amountAtoms: BigNumberish;
  apiUrl: string | null;
}

async function placeOrder(
  { orderType, from, to, amountAtoms, apiUrl }: Args,
  hre: HardhatRuntimeEnvironment,
) {
  let amount: SellAmountBeforeFee | SellAmountAfterFee | BuyAmountAfterFee;
  switch (orderType) {
    case "sellBeforeFee":
      amount = {
        kind: OrderKind.SELL,
        sellAmountBeforeFee: amountAtoms,
      };
      break;
    case "sellAfterFee":
      amount = {
        kind: OrderKind.SELL,
        sellAmountAfterFee: amountAtoms,
      };
      break;
    case "buyAfterFee":
      amount = {
        kind: OrderKind.BUY,
        buyAmountAfterFee: amountAtoms,
      };
      break;
    default:
      throw new Error(`Unhandled order type ${orderType}`);
  }

  const [[signer], settlement, chainId] = await Promise.all([
    hre.ethers.getSigners(),
    getDeployedContract("GPv2Settlement", hre),
    hre.getChainId(),
  ]);

  const api = new Api(hre.network.name, apiUrl || Environment.Prod);
  const quote = await api.getQuote({
    sellToken: from,
    buyToken: to,
    validTo: Math.floor(Date.now() / 1000) + ORDER_VALIDITY,
    appData: APP_DATA,
    partiallyFillable: false,
    from: signer.address,
    ...amount,
  });

  console.log("Received quote:", quote);

  if (await prompt(hre, "Would you like to place this order?")) {
    const domainSeparator = domain(parseInt(chainId), settlement.address);
    const signature = await signOrder(
      domainSeparator,
      quote.quote,
      signer,
      SigningScheme.EIP712,
    );

    const uid = await api.placeOrder({
      order: quote.quote,
      signature,
    });
    console.log(`Placed order with uid ${uid}`);
  }
}

const setupPlaceOrderTask: () => void = () => {
  task(
    "place-order",
    "Places a limit order on GPv2 according to the price estimation endpoint with 30 minute validity and 0 slippage",
  )
    .addPositionalParam<OrderType>(
      "orderType",
      `They type of order you are placing. *sellBeforeFee* will deduct the fee from the net sell amount (leading to that exact amount leaving your wallet). *sellAfterFee* will lead to the amount + fee leaving your wallet, *buyAfterFee* leads to buying the exact amount`,
    )
    .addParam("from", "Address of the token you are selling")
    .addParam("to", "Address of the token you are buying")
    .addParam(
      "amountAtoms",
      "Amount of token you are willing to buy/sell (depending on order type)",
    )
    .addOptionalParam(
      "apiUrl",
      "If set, the script contacts the API using the given url. Otherwise, the default prod url for the current network is used",
    )
    .setAction(placeOrder);
};

export { setupPlaceOrderTask };
