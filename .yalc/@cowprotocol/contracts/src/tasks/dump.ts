import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import chalk from "chalk";
import {
  BigNumber,
  BigNumberish,
  constants,
  Contract,
  ContractTransaction,
  Signer,
  utils,
} from "ethers";
import { task, types } from "hardhat/config";
import { HardhatRuntimeEnvironment } from "hardhat/types";

import {
  BUY_ETH_ADDRESS,
  domain,
  Order,
  OrderKind,
  SigningScheme,
  signOrder,
  TypedDataDomain,
} from "../ts";
import { Api, CallError, Environment, GetQuoteErrorType } from "../ts/api";

import {
  getDeployedContract,
  isSupportedNetwork,
  SupportedNetwork,
} from "./ts/deployment";
import { IGasEstimator, createGasEstimator } from "./ts/gas";
import { promiseAllWithRateLimit } from "./ts/rate_limits";
import { Align, displayTable } from "./ts/table";
import {
  isNativeToken,
  nativeToken,
  NativeToken,
  erc20Token,
  Erc20Token,
  balanceOf,
  transfer,
  displayName,
  estimateTransferGas,
} from "./ts/tokens";
import { prompt } from "./ts/tui";
import { formatTokenValue, ethValue } from "./ts/value";

export const MAX_LATEST_BLOCK_DELAY_SECONDS = 2 * 60;
export const MAX_ORDER_VALIDITY_SECONDS = 24 * 3600;

const keccak = utils.id;
export const APP_DATA = keccak("GPv2 dump script");

interface DumpInstruction {
  token: Erc20Token;
  quote: Quote;
  balance: BigNumber;
  needsAllowance: boolean;
}

interface Quote {
  sellAmount: BigNumber;
  buyAmount: BigNumber;
  feeAmount: BigNumber;
}

interface DisplayDumpInstruction {
  fromSymbol: string;
  fromAddress: string;
  balance: string;
  needsAllowance: "yes" | "";
  receivedAmount: string;
  feePercent: string;
}

interface TransferToReceiver {
  token: Erc20Token | NativeToken;
  amount: BigNumber;
  feePercent: number;
}

interface DumpInstructions {
  instructions: DumpInstruction[];
  toToken: Erc20Token | NativeToken;
  // Amount of toToken that will be transfered to the receiver address with a
  // standard erc20 transfer. This is only set if there is a receiver and the
  // specified toToken is also a token to be dumped.
  transferToReceiver?: TransferToReceiver;
}

interface Receiver {
  address: string;
  isSameAsUser: boolean;
}

function ignoredTokenMessage(
  token: Erc20Token | NativeToken,
  amount: BigNumber,
  reason?: string,
) {
  const decimals = token.decimals ?? 18;
  return `Ignored ${utils.formatUnits(amount, decimals)} units of ${displayName(
    token,
  )}${
    token.decimals === undefined
      ? ` (no decimals specified in the contract, assuming ${decimals})`
      : ""
  }${reason ? `, ${reason}` : ""}`;
}

interface GetTransferToReceiverInput {
  toToken: Erc20Token | NativeToken;
  inputDumpedTokens: string[];
  user: string;
  receiver: Receiver;
  maxFeePercent: number;
  network: SupportedNetwork;
  api: Api;
  gasEstimator: IGasEstimator;
}
async function getTransferToReceiver({
  toToken,
  inputDumpedTokens,
  user,
  receiver,
  maxFeePercent,
  network,
  api,
  gasEstimator,
}: GetTransferToReceiverInput): Promise<TransferToReceiver | undefined> {
  if (
    receiver.isSameAsUser ||
    !inputDumpedTokens.includes(
      isNativeToken(toToken) ? BUY_ETH_ADDRESS : toToken.address,
    )
  ) {
    return undefined;
  }

  const amount = await balanceOf(toToken, user);
  if (amount.isZero()) {
    console.log(
      `Ignored token ${displayName(
        toToken,
      )}. No balance for that token is available.`,
    );
    return undefined;
  }

  const [gasPrice, gas, value] = await Promise.all([
    gasEstimator.gasPriceEstimate(),
    estimateTransferGas(toToken, user, receiver.address, amount),
    ethValue(toToken, amount, network, api),
  ]);
  const approxGasCost = Number(gas.mul(gasPrice));
  const approxValue = Number(value.toString());
  const feePercent = (100 * approxGasCost) / approxValue;
  if (feePercent > maxFeePercent) {
    console.log(
      ignoredTokenMessage(
        toToken,
        amount,
        `the transaction fee is too large compared to the balance (${feePercent.toFixed(
          2,
        )}%).`,
      ),
    );
    return undefined;
  }

  return {
    token: toToken,
    amount,
    feePercent,
  };
}

export interface GetDumpInstructionInput {
  dumpedTokens: string[];
  toTokenAddress: string | undefined; // undefined defaults to native token (e.g., ETH)
  user: string;
  vaultRelayer: string;
  maxFeePercent: number;
  slippageBps: number;
  validity: number;
  receiver: Receiver;
  hre: HardhatRuntimeEnvironment;
  network: SupportedNetwork;
  api: Api;
  gasEstimator: IGasEstimator;
}
/**
 * This function recovers all information needed to dump the input list of
 * tokens into toToken with GPv2. It returns structured information on all
 * operations to execute, sorted so that the last operation is the one
 * recovering the largest amount of toToken.
 *
 * Information on operations to perform include that needed for creating orders,
 * setting allowances and, if needed, transfering tokens.
 *
 * Note that this function is not supposed to execute any state-changing
 * operation (either onchain or in the backend).
 *
 * Care is taken in handling the following logic:
 * - handling the case where the receiver is not the signer address
 * - handling ETH buy addresses (especially with a custom receiver)
 * - rejecting dump requests for tokens for which the fee to pay is larger than
 *   a given threshold
 */
export async function getDumpInstructions({
  dumpedTokens: inputDumpedTokens,
  toTokenAddress,
  user,
  vaultRelayer: vaultRelayer,
  maxFeePercent,
  slippageBps,
  validity,
  receiver,
  hre,
  network,
  api,
  gasEstimator,
}: GetDumpInstructionInput): Promise<DumpInstructions> {
  // todo: support dumping ETH by wrapping them
  if (inputDumpedTokens.includes(BUY_ETH_ADDRESS)) {
    throw new Error(
      `Dumping the native token is not supported. Remove the ETH flag address ${BUY_ETH_ADDRESS} from the list of tokens to dump.`,
    );
  }

  let toToken: Erc20Token | NativeToken;
  if (toTokenAddress === undefined || toTokenAddress === BUY_ETH_ADDRESS) {
    toToken = nativeToken(hre);
  } else {
    const erc20 = await erc20Token(toTokenAddress, hre);
    if (erc20 === null) {
      throw new Error(
        `Input toToken at address ${toTokenAddress} is not a valid Erc20 token.`,
      );
    }
    toToken = erc20;
  }

  const transferToReceiver = getTransferToReceiver({
    toToken,
    inputDumpedTokens,
    user,
    receiver,
    maxFeePercent,
    network,
    api,
    gasEstimator,
  });

  const dumpedTokens = Array.from(new Set(inputDumpedTokens)).filter(
    (token) => token !== (toTokenAddress ?? BUY_ETH_ADDRESS),
  );

  const computedInstructions: (DumpInstruction | null)[] = (
    await promiseAllWithRateLimit(
      dumpedTokens.map((tokenAddress) => async ({ consoleLog }) => {
        const token = await erc20Token(tokenAddress, hre);
        if (token === null) {
          consoleLog(
            `Dump request skipped for invalid ERC-20 token at address ${tokenAddress}.`,
          );
          return null;
        }
        const [balance, approvedAmount]: [BigNumber, BigNumber] =
          await Promise.all([
            token.contract.balanceOf(user).then(BigNumber.from),
            token.contract.allowance(user, vaultRelayer).then(BigNumber.from),
          ]);
        const needsAllowance = approvedAmount.lt(balance);
        if (balance.isZero()) {
          consoleLog(
            `Ignored token ${displayName(
              token,
            )}. No balance for that token is available.`,
          );
          return null;
        }
        const quote = await getQuote({
          sellToken: token,
          buyToken: toToken,
          api,
          balance,
          maxFeePercent,
          slippageBps,
          validTo: validTo(validity),
          user,
        });
        if (quote === null) {
          return null;
        }

        return {
          token,
          balance,
          quote,
          needsAllowance,
        };
      }),
      { rateLimit: 5 },
    )
  ).filter((inst) => inst !== null);
  // note: null entries have already been filtered out
  const instructions = computedInstructions as DumpInstruction[];
  instructions.sort((lhs, rhs) =>
    lhs.quote.buyAmount.eq(rhs.quote.buyAmount)
      ? 0
      : lhs.quote.buyAmount.lt(rhs.quote.buyAmount)
      ? -1
      : 1,
  );

  return {
    instructions,
    toToken,
    transferToReceiver: await transferToReceiver,
  };
}
interface QuoteInput {
  sellToken: Erc20Token;
  buyToken: Erc20Token | NativeToken;
  balance: BigNumber;
  validTo: number;
  maxFeePercent: number;
  slippageBps: number;
  user: string;
  api: Api;
}

// Returns null if the fee is not satisfying balance or maxFeePercent. May throw if an unexpected error occurs
async function getQuote({
  sellToken,
  buyToken,
  balance,
  validTo,
  maxFeePercent,
  slippageBps,
  user,
  api,
}: QuoteInput): Promise<Quote | null> {
  let quote;
  try {
    const quotedOrder = await api.getQuote({
      sellToken: sellToken.address,
      buyToken: isNativeToken(buyToken) ? BUY_ETH_ADDRESS : buyToken.address,
      validTo,
      appData: APP_DATA,
      partiallyFillable: false,
      from: user,
      kind: OrderKind.SELL,
      sellAmountBeforeFee: balance,
    });
    quote = {
      sellAmount: BigNumber.from(quotedOrder.quote.sellAmount),
      buyAmount: buyAmountWithSlippage(
        quotedOrder.quote.buyAmount,
        slippageBps,
      ),
      feeAmount: BigNumber.from(quotedOrder.quote.feeAmount),
    };
  } catch (e) {
    if (
      (e as CallError)?.apiError?.errorType ===
      GetQuoteErrorType.SellAmountDoesNotCoverFee
    ) {
      console.log(
        ignoredTokenMessage(
          sellToken,
          balance,
          "the trading fee is larger than the dumped amount.",
        ),
      );
      return null;
    } else if (
      (e as CallError)?.apiError?.errorType === GetQuoteErrorType.NoLiquidity
    ) {
      console.log(
        ignoredTokenMessage(
          sellToken,
          balance,
          "not enough liquidity to dump tokens.",
        ),
      );
      return null;
    } else {
      throw e;
    }
  }
  const approxBalance = Number(balance.toString());
  const approxFee = Number(quote.feeAmount.toString());
  const feePercent = (100 * approxFee) / approxBalance;
  if (feePercent > maxFeePercent) {
    console.log(
      ignoredTokenMessage(
        sellToken,
        balance,
        `the trading fee is too large compared to the balance (${feePercent.toFixed(
          2,
        )}%).`,
      ),
    );
    return null;
  }
  return quote;
}

function buyAmountWithSlippage(
  buyAmountWithoutSlippage: BigNumberish,
  slippageBps: number,
): BigNumber {
  // reduce buy amount by slippage
  return BigNumber.from(buyAmountWithoutSlippage)
    .mul(10000 - slippageBps)
    .div(10000);
}

function validTo(validity: number) {
  const now = Math.floor(Date.now() / 1000);
  return now + validity;
}

function formatInstruction(
  {
    token: fromToken,
    quote,
    balance,
    needsAllowance: inputNeedsAllowance,
  }: DumpInstruction,
  toToken: Erc20Token | NativeToken,
): DisplayDumpInstruction {
  const fromSymbol = fromToken.symbol ?? "! unknown symbol !";
  const fromAddress = fromToken.address;
  const fromDecimals = fromToken.decimals ?? 0;
  const needsAllowance = inputNeedsAllowance ? "yes" : "";
  const feePercent = quote.feeAmount.mul(10000).div(balance).lt(1)
    ? "<0.01"
    : utils.formatUnits(quote.feeAmount.mul(10000).div(balance), 2);
  return {
    fromSymbol,
    fromAddress,
    needsAllowance,
    balance: formatTokenValue(balance, fromDecimals, 18),
    receivedAmount: formatTokenValue(
      quote.buyAmount,
      toToken.decimals ?? 0,
      18,
    ),
    feePercent,
  };
}

function displayOperations(
  instructions: DumpInstruction[],
  toToken: Erc20Token | NativeToken,
) {
  const formattedInstructions = instructions.map((inst) =>
    formatInstruction(inst, toToken),
  );
  const orderWithoutAllowances = [
    "fromAddress",
    "fromSymbol",
    "receivedAmount",
    "balance",
    "feePercent",
  ] as const;
  const order = instructions.some(({ needsAllowance }) => needsAllowance)
    ? ([
        ...orderWithoutAllowances.slice(0, 2),
        "needsAllowance",
        ...orderWithoutAllowances.slice(2),
      ] as const)
    : orderWithoutAllowances;
  const header = {
    fromAddress: "token address",
    fromSymbol: "symbol",
    balance: "dumped amount",
    feePercent: "fee %",
    receivedAmount: `received amount${
      toToken.symbol ? ` (${toToken.symbol})` : ""
    }`,
    needsAllowance: "needs allowance?",
  };
  console.log(chalk.bold("List of dumped tokens:"));
  displayTable(header, formattedInstructions, order, {
    balance: { align: Align.Right, maxWidth: 30 },
    receivedAmount: { align: Align.Right, maxWidth: 30 },
    fromSymbol: { maxWidth: 20 },
  });
  console.log();
}

interface CreateAllowancesOptions {
  gasEstimator: IGasEstimator;
  requiredConfirmations?: number | undefined;
}
async function createAllowances(
  allowances: Erc20Token[],
  signer: Signer,
  vaultRelayer: string,
  { gasEstimator, requiredConfirmations }: CreateAllowancesOptions,
) {
  let lastTransaction: ContractTransaction | undefined = undefined;
  let current_nonce = await signer.getTransactionCount();
  for (const token of allowances) {
    console.log(
      `Approving vault relayer to trade token ${displayName(token)}...`,
    );
    const fee = await gasEstimator.txGasPrice();
    lastTransaction = (await token.contract
      .connect(signer)
      .approve(vaultRelayer, constants.MaxUint256, {
        nonce: current_nonce,
        ...fee,
      })) as ContractTransaction;
    current_nonce++;
  }
  if (lastTransaction !== undefined) {
    // note: the last approval is (excluded reorgs) the last that is included
    // in a block, so awaiting it for confirmations means that also all others
    // have at least this number of confirmations.
    await lastTransaction.wait(requiredConfirmations);
  }
}

async function createOrders(
  instructions: DumpInstruction[],
  toToken: Erc20Token | NativeToken,
  signer: SignerWithAddress,
  receiver: Receiver,
  domainSeparator: TypedDataDomain,
  validity: number,
  maxFeePercent: number,
  slippageBps: number,
  api: Api,
) {
  for (const inst of instructions) {
    const sellToken = inst.token.address;
    const buyToken = isNativeToken(toToken) ? BUY_ETH_ADDRESS : toToken.address;
    try {
      // Re-quote for up-to-date fee (in case approval took long)
      const updatedQuote = await getQuote({
        sellToken: inst.token,
        buyToken: toToken,
        balance: inst.balance,
        validTo: validTo(validity),
        user: signer.address,
        api,
        maxFeePercent,
        slippageBps,
      });
      if (updatedQuote !== null) {
        inst.quote = updatedQuote;
      }
    } catch (error) {
      console.log(error, "Couldn't re-quote fee, hoping old fee is still good");
    }

    const order: Order = {
      sellToken,
      buyToken,
      sellAmount: inst.quote.sellAmount,
      buyAmount: inst.quote.buyAmount,
      feeAmount: inst.quote.feeAmount,
      kind: OrderKind.SELL,
      appData: APP_DATA,
      // todo: switch to true when partially fillable orders will be
      // supported by the services
      partiallyFillable: false,
      validTo: validTo(validity),
      receiver: receiver.isSameAsUser ? undefined : receiver.address,
    };
    const signature = await signOrder(
      domainSeparator,
      order,
      signer,
      SigningScheme.EIP712,
    );

    console.log(
      `Creating order selling ${inst.token.symbol ?? inst.token.address}...`,
    );
    try {
      const orderUid = await api.placeOrder({
        order,
        signature,
      });
      console.log(`Successfully created order with uid ${orderUid}`);
    } catch (error) {
      if (
        error instanceof Error &&
        (error as CallError)?.apiError !== undefined
      ) {
        // not null because of the condition in the if statement above
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        const { errorType, description } = (error as CallError).apiError!;
        console.error(
          `Failed submitting order selling ${
            inst.token.symbol ?? inst.token.address
          }, the server returns ${errorType} (${description})`,
        );
        console.error(`Order details: ${JSON.stringify(order)}`);
      } else {
        throw error;
      }
    }
  }
}
async function transferSameTokenToReceiver(
  transferToReceiver: TransferToReceiver,
  signer: Signer,
  receiver: Receiver,
) {
  console.log(
    `Transfering token ${transferToReceiver.token.symbol} to receiver...`,
  );
  const receipt = await transfer(
    transferToReceiver.token,
    signer,
    receiver.address,
    transferToReceiver.amount,
  );
  await receipt.wait();
}

export function assertNotBuyingNativeAsset(toToken: string | undefined) {
  // This function checks that toToken is not the native asset (e.g., ETH).
  // Technically, this script was built to support selling ETH. However, there
  // are two requirement from the backend for it to work:
  // 1. Sending native assets to smart contracts should be supported. At the
  //    time of writing, this returns an error when creating the order.
  // 2. Selling wrapped native assets for their unwrapped counterpart should be
  //    supported. It currently returns an error about the fact that the token
  //    is the same.
  if ([undefined, BUY_ETH_ADDRESS].includes(toToken)) {
    throw new Error("Receiving native asset is not supported yet.");
  }
}

interface DumpInput {
  validity: number;
  maxFeePercent: number;
  slippageBps: number;
  dumpedTokens: string[];
  toToken: string;
  settlement: Contract;
  signer: SignerWithAddress;
  receiver: string | undefined;
  network: SupportedNetwork;
  hre: HardhatRuntimeEnvironment;
  api: Api;
  dryRun: boolean;
  gasEstimator: IGasEstimator;
  doNotPrompt?: boolean | undefined;
  confirmationsAfterApproval?: number | undefined;
}
export async function dump({
  validity,
  maxFeePercent,
  slippageBps,
  dumpedTokens,
  toToken: toTokenAddress,
  settlement,
  signer,
  receiver: inputReceiver,
  network,
  hre,
  api,
  dryRun,
  gasEstimator,
  doNotPrompt,
  confirmationsAfterApproval,
}: DumpInput): Promise<void> {
  const { ethers } = hre;

  // TODO: remove once native asset orders are fully supported.
  assertNotBuyingNativeAsset(toTokenAddress);

  const [chainId, vaultRelayer] = await Promise.all([
    ethers.provider.getNetwork().then((n) => n.chainId),
    (await settlement.vaultRelayer()) as string,
  ]);
  const domainSeparator = domain(chainId, settlement.address);
  const receiverAddress = inputReceiver ?? signer.address;
  const receiver: Receiver = {
    address: receiverAddress,
    isSameAsUser: receiverAddress === signer.address,
  };

  const { instructions, toToken, transferToReceiver } =
    await getDumpInstructions({
      dumpedTokens,
      toTokenAddress,
      user: signer.address,
      vaultRelayer: vaultRelayer,
      maxFeePercent,
      slippageBps,
      validity,
      receiver,
      hre,
      network,
      api,
      gasEstimator,
    });
  const willTrade = instructions.length !== 0;
  const willTransfer = transferToReceiver !== undefined;
  if (willTrade) {
    displayOperations(instructions, toToken);
  }

  let sumReceived = instructions.reduce(
    (sum, inst) => sum.add(inst.quote.buyAmount),
    constants.Zero,
  );
  const needAllowances = instructions
    .filter(({ needsAllowance }) => needsAllowance)
    .map(({ token }) => token);
  if (needAllowances.length !== 0) {
    console.log(
      `Before creating the orders, a total of ${needAllowances.length} allowances will be granted to the vault relayer.`,
    );
  }
  const toTokenName = isNativeToken(toToken)
    ? toToken.symbol
    : toToken.symbol ?? `units of token ${toToken.address}`;
  if (willTransfer) {
    const { amount, token, feePercent } = transferToReceiver;
    console.log(
      `${
        willTrade ? "Moreover, a" : "A"
      } token transfer for ${utils.formatUnits(
        amount,
        token.decimals ?? 0,
      )} ${toTokenName} to the receiver address ${
        receiver.address
      } will be submitted onchain. The transfer network fee corresponds to about ${
        feePercent < 0.01 ? "< 0.01" : feePercent.toFixed(1)
      }% of the withdrawn amount.`,
    );
    sumReceived = sumReceived.add(amount);
  }
  if (willTrade || willTransfer) {
    console.log(
      `${
        receiver.isSameAsUser
          ? `Your address (${receiver.address})`
          : `The receiver address ${receiver.address}`
      } will receive at least ${utils.formatUnits(
        sumReceived,
        toToken.decimals ?? 0,
      )} ${toTokenName} from the tokens listed above.`,
    );
  } else {
    console.log("Nothing to do.");
    return;
  }
  if (!dryRun && (doNotPrompt || (await prompt(hre, "Submit?")))) {
    await createAllowances(needAllowances, signer, vaultRelayer, {
      gasEstimator,
      // If the services don't register the allowance before the order,
      // then creating a new order with the API returns an error.
      // Moreover, there is no distinction in the error between a missing
      // allowance and a failed order creation, which could occur for
      // valid reasons.
      requiredConfirmations: confirmationsAfterApproval,
    });

    await createOrders(
      instructions,
      toToken,
      signer,
      receiver,
      domainSeparator,
      validity,
      maxFeePercent,
      slippageBps,
      api,
    );

    if (willTransfer) {
      await transferSameTokenToReceiver(transferToReceiver, signer, receiver);
    }

    console.log(
      `Done! The orders will expire in the next ${validity / 60} minutes.`,
    );
  }
}

const setupDumpTask: () => void = () =>
  task("dump")
    .addOptionalParam(
      "origin",
      "Address from which to dump. If not specified, it defaults to the first provided account",
    )
    .addOptionalParam(
      "toToken",
      "All input tokens will be dumped to this token. If not specified, it defaults to the network's native token (e.g., ETH)",
    )
    .addOptionalParam(
      "receiver",
      "The address that will receive the funds obtained from dumping the token. Defaults to the origin address",
    )
    .addOptionalParam(
      "validity",
      `How long the sell orders will be valid after their creation in seconds. It cannot be larger than ${MAX_ORDER_VALIDITY_SECONDS}`,
      20 * 60,
      types.int,
    )
    .addOptionalParam(
      "maxFeePercent",
      "If, for any token, the amount of fee to be paid is larger than this percent of the traded amount, that token is not traded",
      5,
      types.float,
    )
    .addOptionalParam(
      "slippageBps",
      "The slippage in basis points for selling the dumped tokens",
      10,
      types.int,
    )
    .addOptionalParam(
      "apiUrl",
      "If set, the script contacts the API using the given url. Otherwise, the default prod url for the current network is used",
    )
    .addFlag(
      "dryRun",
      "Just simulate the result instead of executing the transaction on the blockchain.",
    )
    .addFlag(
      "blocknativeGasPrice",
      "Use BlockNative gas price estimates for transactions.",
    )
    .addVariadicPositionalParam(
      "dumpedTokens",
      "List of tokens that will be dumped in exchange for toToken. Multiple tokens are separated by spaces",
    )
    .setAction(
      async (
        {
          origin,
          toToken,
          dumpedTokens,
          maxFeePercent,
          slippageBps,
          dryRun,
          receiver,
          validity,
          apiUrl,
          blocknativeGasPrice,
        },
        hre,
      ) => {
        const network = hre.network.name;
        if (!isSupportedNetwork(network)) {
          throw new Error(`Unsupported network ${hre.network.name}`);
        }
        const gasEstimator = createGasEstimator(hre, {
          blockNative: blocknativeGasPrice,
        });
        const api = new Api(network, apiUrl ?? Environment.Prod);
        const [signers, settlement] = await Promise.all([
          hre.ethers.getSigners(),
          getDeployedContract("GPv2Settlement", hre),
        ]);
        const signer =
          origin === undefined
            ? signers[0]
            : signers.find((signer) => signer.address === origin);
        if (signer === undefined) {
          throw new Error(
            `No signer found${
              origin === undefined ? "" : ` for address ${origin}`
            }. Did you export a valid private key?`,
          );
        }
        console.log(`Using account ${signer.address}`);

        if (validity > MAX_ORDER_VALIDITY_SECONDS) {
          throw new Error("Order validity too large");
        }

        await dump({
          validity,
          maxFeePercent,
          slippageBps,
          dumpedTokens,
          toToken,
          settlement,
          signer,
          receiver,
          network,
          hre,
          api,
          dryRun,
          gasEstimator,
          confirmationsAfterApproval: 2,
        });
      },
    );

export { setupDumpTask };
