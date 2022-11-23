import "hardhat-deploy";
import "@nomiclabs/hardhat-ethers";

import readline from "readline";

import chalk from "chalk";
import { BigNumber, BigNumberish, utils, constants } from "ethers";
import { Deployment } from "hardhat-deploy/types";
import { task } from "hardhat/config";
import { HardhatRuntimeEnvironment } from "hardhat/types";

import {
  decodeTradeFlags,
  EncodedSettlement,
  Trade,
  BUY_ETH_ADDRESS,
  Interaction,
  SigningScheme,
  decodeSignatureOwner,
  TypedDataDomain,
  domain,
  computeOrderUid,
  decodeOrder,
} from "../ts";

import {
  decode as decodeInteraction,
  DecodedInteraction,
} from "./decode/interaction";
import { Align, displayTable } from "./ts/table";
import { Erc20Token, erc20Token } from "./ts/tokens";

const WIDTH = 120;
const INVALID_TOKEN = " ! Invalid token ! ";
const INVALID_OWNER = " ! Invalid owner ! ";
const NATIVE_TOKEN = " native token ";

interface Token extends Partial<Erc20Token> {
  address: string;
  nativeFlag: boolean;
  price: BigNumber | undefined;
  index: number;
}

export interface DetailedInteraction extends Interaction {
  decoded: DecodedInteraction;
}

type MaybeToken =
  | Token
  | {
      index: number;
      decimals?: undefined;
      symbol?: undefined;
      nativeFlag?: undefined;
    };

type FormatToken = {
  address: string;
  index: string;
  symbol: string;
  price: string;
};

function formatToken(token: Token): FormatToken {
  return {
    address: token.address,
    index: token.index.toString(),
    symbol: token.nativeFlag ? NATIVE_TOKEN : token.symbol ?? INVALID_TOKEN,
    price: (token.price ?? "no price").toString(),
  };
}

const mainLabel = (s: string) => chalk.bold(chalk.yellow(s + ":"));
const label = (s: string) => chalk.cyan(s + ":");

function displayTokens(tokens: Token[]) {
  const formattedTokens = tokens.map(formatToken);
  const order = ["address", "index", "symbol", "price"];
  const header = {
    address: "address",
    index: "index",
    symbol: "symbol",
    price: "price",
  };
  console.log(chalk.bold("=== Tokens ==="));
  displayTable(header, formattedTokens, order, {
    index: { align: Align.Right },
    symbol: { maxWidth: 20 },
    price: { align: Align.Right },
  });
  console.log();
}

function displayTrades(
  trades: Trade[],
  tokens: Token[],
  domainSeparator: TypedDataDomain | null,
) {
  console.log(chalk.bold("=== Trades ==="));
  console.log(chalk.gray("-".repeat(WIDTH)));
  for (const trade of trades) {
    displayTrade(trade, tokens, domainSeparator);
    console.log();
  }
}

function formatSignature(sig: SigningScheme): string {
  switch (sig) {
    case SigningScheme.EIP712:
      return "eip-712";
    case SigningScheme.ETHSIGN:
      return "ethsign";
    case SigningScheme.EIP1271:
      return "eip-1271";
    case SigningScheme.PRESIGN:
      return "presign";
    default:
      return `invalid (${sig})`;
  }
}

function displayTrade(
  trade: Trade,
  tokens: Token[],
  domainSeparator: TypedDataDomain | null,
) {
  const prettyToken = (token: MaybeToken, checkNative?: boolean) =>
    `${
      checkNative && token.nativeFlag
        ? NATIVE_TOKEN
        : token.symbol ?? INVALID_TOKEN
    } (${token.index})`;
  const prettyAmount = (
    amount: BigNumberish,
    token: MaybeToken,
    checkNative?: boolean,
  ) =>
    `${utils.formatUnits(amount, token.decimals ?? undefined)} ${prettyToken(
      token,
      checkNative,
    )}`;
  const {
    executedAmount,
    validTo,
    appData,
    receiver,
    sellAmount,
    buyAmount,
    feeAmount,
    sellTokenIndex,
    buyTokenIndex,
    flags,
    signature,
  } = trade;
  const { kind, partiallyFillable, signingScheme } = decodeTradeFlags(flags);
  let owner = null;
  let orderUid = null;
  if (domainSeparator !== null) {
    try {
      const order = decodeOrder(
        trade,
        tokens.map((token) => token.address),
      );
      owner = decodeSignatureOwner(
        domainSeparator,
        order,
        signingScheme,
        signature,
      );
      orderUid = computeOrderUid(domainSeparator, order, owner);
    } catch {
      // Nothing to do, `null` variables mark a decoding error.
    }
  }
  const sellToken = tokens[BigNumber.from(sellTokenIndex).toNumber()] ?? {
    index: sellTokenIndex,
  };
  const buyToken = tokens[BigNumber.from(buyTokenIndex).toNumber()] ?? {
    index: buyTokenIndex,
  };
  console.log(
    mainLabel("Order"),
    `${kind.toString().toUpperCase()} ${
      partiallyFillable ? "partially fillable " : ""
    }order, valid until ${new Date(
      BigNumber.from(validTo).toNumber() * 1000,
    ).toISOString()} (${validTo.toString()})`,
  );
  console.log(label(`Trade`), `sell ${prettyAmount(sellAmount, sellToken)}`);
  console.log("      ", ` buy ${prettyAmount(buyAmount, buyToken, true)}`);
  console.log("      ", ` fee ${prettyAmount(feeAmount, sellToken)}`);
  if (partiallyFillable) {
    console.log(
      label(`Executed amount`),
      `${prettyAmount(executedAmount, sellToken)}`,
    );
  }
  if (domainSeparator !== null) {
    console.log(label("Owner"), owner === null ? INVALID_OWNER : owner);
  }
  if (receiver !== constants.AddressZero) {
    console.log(label(`Receiver`), receiver);
  }
  if (appData !== constants.HashZero) {
    console.log(label(`AppData`), appData);
  }
  console.log(
    label(`Signature (${formatSignature(signingScheme)})`),
    signature,
  );
  if (orderUid !== null) {
    console.log(label("OrderUid"), orderUid);
  }
}

function displayInteractions(
  interactions: [
    DetailedInteraction[],
    DetailedInteraction[],
    DetailedInteraction[],
  ],
) {
  console.log(chalk.bold("=== Interactions ==="));
  console.log(chalk.gray("-".repeat(WIDTH)));
  displayInteractionGroup("Pre-interactions", interactions[0]);
  console.log();
  displayInteractionGroup("Intra-interactions", interactions[1]);
  console.log();
  displayInteractionGroup("Post-interactions", interactions[2]);
  console.log();
}

function displayInteractionGroup(
  name: string,
  interactions: DetailedInteraction[],
) {
  const nonEmpty = interactions.length !== 0;
  console.log(` ${nonEmpty ? "┌" : " "}--- ${name} ---`);
  for (const interaction of interactions.slice(undefined, -1)) {
    displayInteraction(interaction, false);
  }
  if (nonEmpty) {
    displayInteraction(interactions[interactions.length - 1], true);
  }
}

function displayInteraction(interaction: DetailedInteraction, isLast: boolean) {
  let newInteraction = true;
  const branch = () => {
    if (newInteraction) {
      newInteraction = false;
      return isLast ? " └─── " : " ├─── ";
    } else {
      return isLast ? "      " : " │    ";
    }
  };
  const branchedLog = (...args: unknown[]) => console.log(branch(), ...args);
  const { target, value, callData, decoded } = interaction;
  branchedLog(
    mainLabel("Interaction"),
    `target address ${target}` +
      ((decoded?.targetName ?? null) !== null
        ? ` (${decoded.targetName})`
        : ""),
  );
  if (!BigNumber.from(value).isZero()) {
    branchedLog(label("Value"), utils.formatEther(value));
  }
  if ((decoded?.call ?? null) !== null) {
    // `decoded?.call` is defined and not null by the if check
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const { functionName, args } = decoded.call!;
    if (args === null) {
      branchedLog(
        label("function"),
        functionName,
        chalk.red("(input decoding failed)"),
      );
    } else {
      branchedLog(label("function"), functionName);
      for (const [name, value] of args) {
        branchedLog(label(` - ${name}`), value);
      }
    }
  }
  branchedLog(label("calldata"), callData);
}

async function calldataFromUserInput(
  txhash: string,
  deploymentPromise: Promise<Deployment | null>,
  hre: HardhatRuntimeEnvironment,
): Promise<string> {
  const { ethers, network } = hre;
  let calldata = null;
  if (txhash !== undefined) {
    const tx = await ethers.provider.getTransaction(txhash.trim());
    const deployment = await deploymentPromise;
    if (tx === null) {
      throw new Error(`Transaction not found on network ${network.name}`);
    }
    calldata = tx.data;
    if (deployment === null || tx.to !== deployment.address) {
      console.log(
        `Warning: the input transaction hash does not point to an interaction with the current deployment of GPv2 settlement contract on ${network.name}.`,
      );
      console.log(`Deployment: ${deployment?.address}`);
      console.log(`Target:     ${tx.to}`);
    }
  } else {
    let output = undefined;
    if (process.stdin.isTTY) {
      console.log("Paste in the calldata to decode");
      // This line mitigates an issue where the terminal truncates pasted input
      // calldata to 4096 character. It implicitly enables raw mode for stdin
      // while keeping most terminal features enabled.
      output = process.stdout;
    }
    const rl = readline.createInterface({
      input: process.stdin,
      output,
    });
    for await (const line of rl) {
      const trimmed = line.trim();
      if (trimmed.length !== 0) {
        calldata = trimmed;
        break;
      }
    }
    if (calldata === null) {
      throw new Error("No input calldata provided");
    }
  }
  if (!/^0x[0-9a-f]*/.exec(calldata)) {
    throw new Error("Invalid calldata");
  }
  return calldata;
}

const setupDecodeTask: () => void = () => {
  task("decode", "Decodes GPv2 settlement calldata.")
    .addOptionalParam(
      "txhash",
      "The transaction hash of the transaction to decode. If this flag is set, stdin is ignored.",
    )
    .setAction(async ({ txhash }, hre) => {
      const { artifacts, ethers, deployments } = hre;
      const deploymentPromise = deployments
        .get("GPv2Settlement")
        .catch(() => null);
      const calldata = await calldataFromUserInput(
        txhash,
        deploymentPromise,
        hre,
      );
      const { chainId } = await ethers.provider.getNetwork();
      const deployment = await deploymentPromise;
      const domainSeparator =
        deployment === null ? null : domain(chainId, deployment.address);

      const GPv2Settlement = await artifacts.readArtifact("GPv2Settlement");
      const settlementInterface = new utils.Interface(GPv2Settlement.abi);

      const [tokenAddresses, clearingPrices, trades, interactions] =
        settlementInterface.decodeFunctionData(
          "settle",
          calldata,
        ) as EncodedSettlement;

      const tokens = await Promise.all(
        tokenAddresses.map(async (address: string, index: number) => {
          const erc20 = await erc20Token(address, hre);
          return {
            ...(erc20 ?? {}),
            address,
            index,
            nativeFlag: BUY_ETH_ADDRESS === address,
            price: clearingPrices[index] as BigNumber | undefined,
          };
        }),
      );

      displayTokens(tokens);

      if (clearingPrices.length > tokens.length) {
        console.log(
          `Warning: settlement has ${
            clearingPrices.length - tokens.length
          } more prices than tokens.`,
        );
        console.log(`Extra prices from index ${tokens.length}:`);
        console.log(
          clearingPrices.slice(tokens.length).map((price) => price.toString()),
        );
      }

      displayTrades(trades, tokens, domainSeparator);

      const tokenRegistry: Record<string, Erc20Token> = {};
      tokens
        .filter(
          (token) => token.contract !== undefined && token.contract !== null,
        )
        .forEach((token) => {
          tokenRegistry[token.address] = {
            address: token.address,
            // Contract is defined because of the previous filter
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            contract: token.contract!,
            symbol: token.symbol,
            decimals: token.decimals,
          };
        });
      const detailedInteractions = (await Promise.all(
        interactions.map(
          async (interactionGroup) =>
            await Promise.all(
              interactionGroup.map(async (i) => ({
                ...i,
                decoded: await decodeInteraction(i, hre, {
                  tokenRegistry,
                  settlementContractAddress: deployment?.address,
                }),
              })),
            ),
        ),
      )) as [
        DetailedInteraction[],
        DetailedInteraction[],
        DetailedInteraction[],
      ];
      displayInteractions(detailedInteractions);
    });
};

export { setupDecodeTask };
