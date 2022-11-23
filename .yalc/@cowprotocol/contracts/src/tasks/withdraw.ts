import "@nomiclabs/hardhat-ethers";

import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import axios from "axios";
import chalk from "chalk";
import { BigNumber, constants, Contract, utils } from "ethers";
import { task, types } from "hardhat/config";
import { HardhatRuntimeEnvironment } from "hardhat/types";

import { EncodedSettlement, SettlementEncoder } from "../ts";
import { Api, ApiError, CallError, Environment } from "../ts/api";

import {
  getDeployedContract,
  isSupportedNetwork,
  SupportedNetwork,
} from "./ts/deployment";
import { createGasEstimator, IGasEstimator } from "./ts/gas";
import {
  DisappearingLogFunctions,
  promiseAllWithRateLimit,
} from "./ts/rate_limits";
import { getSolvers } from "./ts/solver";
import { Align, displayTable } from "./ts/table";
import { Erc20Token, erc20Token } from "./ts/tokens";
import { prompt } from "./ts/tui";
import {
  formatTokenValue,
  formatUsdValue,
  REFERENCE_TOKEN,
  ReferenceToken,
  usdValue,
  usdValueOfEth,
} from "./ts/value";
import { getAllTradedTokens } from "./withdraw/traded_tokens";

interface Withdrawal {
  token: Erc20Token;
  amount: BigNumber;
  amountUsd: BigNumber;
  balance: BigNumber;
  balanceUsd: BigNumber;
  gas: BigNumber;
}

interface DisplayWithdrawal {
  symbol: string;
  balance: string;
  amount: string;
  value: string;
  address: string;
}

// https://api.1inch.exchange/swagger/ethereum/#/Tokens/TokensController_getTokens
type OneinchTokenList = Record<
  string,
  { symbol: string; decimals: number; address: string }
>;
const ONEINCH_TOKENS: Promise<OneinchTokenList> = axios
  .get("https://api.1inch.exchange/v3.0/1/tokens")
  .then((response) => response.data.tokens)
  .catch(() => {
    console.log("Warning: unable to recover token list from 1inch");
    return {};
  });

async function fastTokenDetails(
  address: string,
  hre: HardhatRuntimeEnvironment,
): Promise<Erc20Token | null> {
  const oneinchTokens = await ONEINCH_TOKENS;
  if (
    hre.network.name === "mainnet" &&
    oneinchTokens[address.toLowerCase()] !== undefined
  ) {
    const IERC20 = await hre.artifacts.readArtifact(
      "src/contracts/interfaces/IERC20.sol:IERC20",
    );
    const contract = new Contract(address, IERC20.abi, hre.ethers.provider);
    return { ...oneinchTokens[address.toLowerCase()], contract };
  }
  return erc20Token(address, hre);
}

interface ComputeSettlementInput {
  withdrawals: Omit<Withdrawal, "gas">[];
  receiver: string;
  solverForSimulation: string;
  settlement: Contract;
  hre: HardhatRuntimeEnvironment;
}
async function computeSettlement({
  withdrawals,
  receiver,
  solverForSimulation,
  settlement,
  hre,
}: ComputeSettlementInput) {
  const encoder = new SettlementEncoder({});
  withdrawals.forEach(({ token, amount }) =>
    encoder.encodeInteraction({
      target: token.address,
      callData: token.contract.interface.encodeFunctionData("transfer", [
        receiver,
        amount,
      ]),
    }),
  );

  const finalSettlement = encoder.encodedSettlement({});
  const gas = await settlement
    .connect(hre.ethers.provider)
    .estimateGas.settle(...finalSettlement, {
      from: solverForSimulation,
    });
  return {
    finalSettlement,
    gas,
  };
}

interface ComputeSettlementWithPriceInput extends ComputeSettlementInput {
  gasPrice: BigNumber;
  network: SupportedNetwork;
  usdReference: ReferenceToken;
  api: Api;
}
async function computeSettlementWithPrice({
  withdrawals,
  receiver,
  solverForSimulation,
  settlement,
  gasPrice,
  network,
  usdReference,
  api,
  hre,
}: ComputeSettlementWithPriceInput) {
  const { gas, finalSettlement } = await computeSettlement({
    withdrawals,
    receiver,
    solverForSimulation,
    settlement,
    hre,
  });

  const transactionEthCost = gas.mul(gasPrice);
  // The following ternary operator is used as a hack to avoid having to
  // set expectations for the gas value in the tests, since gas values
  // could easily change with any minor changes to the tests
  const transactionUsdCost =
    hre.network.name === "hardhat"
      ? constants.Zero
      : await usdValueOfEth(transactionEthCost, usdReference, network, api);
  const withdrawnValue = withdrawals.reduce(
    (sum, { amountUsd }) => sum.add(amountUsd),
    constants.Zero,
  );

  return {
    finalSettlement,
    transactionEthCost,
    transactionUsdCost,
    gas,
    withdrawnValue,
  };
}

function ignoredTokenMessage(
  amount: BigNumber,
  token: Erc20Token,
  usdReference: ReferenceToken,
  valueUsd: BigNumber,
  reason?: string,
) {
  const decimals = token.decimals ?? 18;
  return `Ignored ${utils.formatUnits(amount, decimals)} units of ${
    token.symbol ?? "unknown token"
  } (${token.address})${
    token.decimals === undefined
      ? ` (no decimals specified in the contract, assuming ${decimals})`
      : ""
  } with value ${formatUsdValue(valueUsd, usdReference)} USD${
    reason ? `, ${reason}` : ""
  }`;
}

interface GetWithdrawalsInput {
  tokens: string[];
  settlement: Contract;
  minValue: string;
  leftover: string;
  gasEmptySettlement: Promise<BigNumber>;
  hre: HardhatRuntimeEnvironment;
  usdReference: ReferenceToken;
  receiver: string;
  solverForSimulation: string;
  api: Api;
}
async function getWithdrawals({
  tokens,
  settlement,
  minValue,
  leftover,
  gasEmptySettlement,
  hre,
  usdReference,
  receiver,
  solverForSimulation,
  api,
}: GetWithdrawalsInput): Promise<Withdrawal[]> {
  const minValueWei = utils.parseUnits(minValue, usdReference.decimals);
  const leftoverWei = utils.parseUnits(leftover, usdReference.decimals);
  const computeWithdrawalInstructions = tokens.map(
    (tokenAddress) =>
      async ({ consoleLog }: DisappearingLogFunctions) => {
        const token = await fastTokenDetails(tokenAddress, hre);
        if (token === null) {
          throw new Error(
            `There is no valid ERC20 token at address ${tokenAddress}`,
          );
        }
        const balance = await token.contract.balanceOf(settlement.address);
        if (balance.eq(0)) {
          return null;
        }
        let balanceUsd;
        try {
          balanceUsd = await usdValue(
            token.address,
            balance,
            usdReference,
            api,
          );
        } catch (e) {
          if (!(e instanceof Error)) {
            throw e;
          }
          const errorData: ApiError = (e as CallError).apiError ?? {
            errorType: "script internal error",
            description: e?.message ?? "no details",
          };
          consoleLog(
            `Warning: price retrieval failed for token ${token.symbol} (${token.address}): ${errorData.errorType} (${errorData.description})`,
          );
          balanceUsd = constants.Zero;
        }
        // Note: if balanceUsd is zero, then setting either minValue or leftoverWei
        // to a nonzero value means that nothing should be withdrawn. If neither
        // flag is set, then whether to withdraw does not depend on the USD value.
        if (
          balanceUsd.lt(minValueWei.add(leftoverWei)) ||
          (balanceUsd.isZero() &&
            !(minValueWei.isZero() && leftoverWei.isZero()))
        ) {
          consoleLog(
            ignoredTokenMessage(
              balance,
              token,
              usdReference,
              balanceUsd,
              "does not satisfy conditions on min value and leftover",
            ),
          );
          return null;
        }
        let amount;
        let amountUsd;
        if (balanceUsd.isZero()) {
          // Note: minValueWei and leftoverWei are zero. Everything should be
          // withdrawn.
          amount = balance;
          amountUsd = balanceUsd;
        } else {
          amount = balance.mul(balanceUsd.sub(leftoverWei)).div(balanceUsd);
          amountUsd = balanceUsd.sub(leftoverWei);
        }

        const withdrawalWithoutGas = {
          token,
          amount,
          amountUsd,
          balance,
          balanceUsd,
        };
        let gas;
        try {
          ({ gas } = await computeSettlement({
            withdrawals: [withdrawalWithoutGas],
            receiver,
            solverForSimulation,
            settlement,
            hre,
          }));
        } catch (error) {
          if (!(error instanceof Error)) {
            throw error;
          }
          consoleLog(
            ignoredTokenMessage(
              balance,
              token,
              usdReference,
              balanceUsd,
              `cannot execute withdraw transaction (${error.message})`,
            ),
          );
          return null;
        }
        return {
          ...withdrawalWithoutGas,
          gas: gas.sub(await gasEmptySettlement),
        };
      },
  );
  const processedWithdrawals: (Withdrawal | null)[] =
    await promiseAllWithRateLimit(computeWithdrawalInstructions, {
      message: "computing withdrawals",
      rateLimit: 5,
    });
  return processedWithdrawals.filter(
    (withdrawal) => withdrawal !== null,
  ) as Withdrawal[];
}

function formatWithdrawal(
  withdrawal: Withdrawal,
  usdReference: ReferenceToken,
): DisplayWithdrawal {
  const formatDecimals = withdrawal.token.decimals ?? 18;
  return {
    address: withdrawal.token.address,
    value: formatUsdValue(withdrawal.balanceUsd, usdReference),
    balance: formatTokenValue(withdrawal.balance, formatDecimals, 18),
    amount: formatTokenValue(withdrawal.amount, formatDecimals, 18),
    symbol: withdrawal.token.symbol ?? "unknown token",
  };
}

function displayWithdrawals(
  withdrawals: Withdrawal[],
  usdReference: ReferenceToken,
) {
  const formattedWithdtrawals = withdrawals.map((w) =>
    formatWithdrawal(w, usdReference),
  );
  const order = ["address", "value", "balance", "amount", "symbol"] as const;
  const header = {
    address: "address",
    value: "balance (usd)",
    balance: "balance",
    amount: "withdrawn amount",
    symbol: "symbol",
  };
  console.log(chalk.bold("Amounts to withdraw:"));
  displayTable(header, formattedWithdtrawals, order, {
    value: { align: Align.Right },
    balance: { align: Align.Right, maxWidth: 30 },
    amount: { align: Align.Right, maxWidth: 30 },
    symbol: { maxWidth: 20 },
  });
  console.log();
}

function formatGasCost(
  amount: BigNumber,
  usdAmount: BigNumber,
  network: SupportedNetwork,
  usdReference: ReferenceToken,
): string {
  switch (network) {
    case "mainnet": {
      return `${utils.formatEther(amount)} ETH (${formatUsdValue(
        usdAmount,
        usdReference,
      )} USD)`;
    }
    case "xdai":
      return `${utils.formatEther(amount)} XDAI`;
    default:
      return `${utils.formatEther(amount)} ETH`;
  }
}

type SignerOrAddress =
  | SignerWithAddress
  | { address: string; _isSigner: false };

async function getSignerOrAddress(
  { ethers }: HardhatRuntimeEnvironment,
  origin?: string,
): Promise<SignerOrAddress> {
  const signers = await ethers.getSigners();
  const originAddress = ethers.utils.getAddress(origin ?? signers[0].address);
  return (
    signers.find(({ address }) => address === originAddress) ?? {
      address: originAddress,
      // Take advantage of the fact that all Ethers signers have `_isSigner` set
      // to `true`.
      _isSigner: false,
    }
  );
}

function isSigner(solver: SignerOrAddress): solver is SignerWithAddress {
  return solver._isSigner;
}

interface WithdrawInput {
  solver: SignerOrAddress;
  tokens: string[] | undefined;
  minValue: string;
  leftover: string;
  maxFeePercent: number;
  receiver: string;
  authenticator: Contract;
  settlement: Contract;
  settlementDeploymentBlock: number;
  network: SupportedNetwork;
  usdReference: ReferenceToken;
  hre: HardhatRuntimeEnvironment;
  api: Api;
  dryRun: boolean;
  gasEstimator: IGasEstimator;
  doNotPrompt?: boolean | undefined;
  requiredConfirmations?: number | undefined;
}

async function prepareWithdrawals({
  solver,
  tokens,
  minValue,
  leftover,
  maxFeePercent,
  receiver,
  authenticator,
  settlement,
  settlementDeploymentBlock,
  network,
  usdReference,
  hre,
  api,
  dryRun,
  gasEstimator,
}: WithdrawInput): Promise<{
  withdrawals: Withdrawal[];
  finalSettlement: EncodedSettlement | null;
}> {
  let solverForSimulation: string;
  if (await authenticator.isSolver(solver.address)) {
    solverForSimulation = solver.address;
  } else {
    const message =
      "Current account is not a solver. Only a solver can withdraw funds from the settlement contract.";
    if (!dryRun) {
      throw Error(message);
    } else {
      solverForSimulation = (await getSolvers(authenticator))[0];
      console.log(message);
      if (solverForSimulation === undefined) {
        throw new Error(
          `There are no valid solvers for network ${network}, withdrawing is not possible`,
        );
      }
    }
  }
  const gasEmptySettlement = computeSettlement({
    withdrawals: [],
    receiver,
    solverForSimulation,
    settlement,
    hre,
  }).then(({ gas }) => gas);

  if (tokens === undefined) {
    console.log("Recovering list of traded tokens...");
    ({ tokens } = await getAllTradedTokens(
      settlement,
      settlementDeploymentBlock,
      "latest",
      hre,
    ));
  }

  // TODO: add eth withdrawal
  // TODO: split large transaction in batches
  let withdrawals = await getWithdrawals({
    tokens,
    settlement,
    minValue,
    leftover,
    gasEmptySettlement,
    hre,
    usdReference,
    receiver,
    solverForSimulation,
    api,
  });
  withdrawals.sort((lhs, rhs) => {
    const diff = lhs.balanceUsd.sub(rhs.balanceUsd);
    return diff.isZero() ? 0 : diff.isNegative() ? -1 : 1;
  });

  const oneEth = utils.parseEther("1");
  const [oneEthUsdValue, gasPrice] = await Promise.all([
    usdValueOfEth(oneEth, usdReference, network, api),
    gasEstimator.gasPriceEstimate(),
  ]);
  withdrawals = withdrawals.filter(
    ({ token, balance, balanceUsd, amountUsd, gas }) => {
      const approxUsdValue = Number(amountUsd.toString());
      const approxGasCost = Number(
        gasPrice.mul(gas).mul(oneEthUsdValue).div(oneEth),
      );
      const feePercent = (100 * approxGasCost) / approxUsdValue;
      if (feePercent > maxFeePercent) {
        console.log(
          ignoredTokenMessage(
            balance,
            token,
            usdReference,
            balanceUsd,
            `the gas cost is too high (${feePercent.toFixed(
              2,
            )}% of the withdrawn amount)`,
          ),
        );
        return false;
      }

      return true;
    },
  );

  if (withdrawals.length === 0) {
    console.log("No tokens to withdraw.");
    return { withdrawals: [], finalSettlement: null };
  }
  displayWithdrawals(withdrawals, usdReference);

  const {
    finalSettlement,
    transactionEthCost,
    transactionUsdCost,
    withdrawnValue,
  } = await computeSettlementWithPrice({
    withdrawals,
    receiver,
    gasPrice,
    solverForSimulation,
    settlement,
    network,
    usdReference,
    api,
    hre,
  });

  console.log(
    `The transaction will cost approximately ${formatGasCost(
      transactionEthCost,
      transactionUsdCost,
      network,
      usdReference,
    )} and will withdraw the balance of ${
      withdrawals.length
    } tokens for an estimated total value of ${formatUsdValue(
      withdrawnValue,
      usdReference,
    )} USD. All withdrawn funds will be sent to ${receiver}.`,
  );

  return { withdrawals, finalSettlement };
}

async function submitWithdrawals(
  {
    dryRun,
    doNotPrompt,
    hre,
    settlement,
    solver,
    requiredConfirmations,
    gasEstimator,
  }: WithdrawInput,
  finalSettlement: EncodedSettlement,
) {
  if (!isSigner(solver)) {
    const settlementData = settlement.interface.encodeFunctionData(
      "settle",
      finalSettlement,
    );
    console.log("Settlement transaction:");
    console.log(`to:   ${settlement.address}`);
    console.log(`data: ${settlementData}`);
  } else if (!dryRun && (doNotPrompt || (await prompt(hre, "Submit?")))) {
    console.log("Executing the withdraw transaction on the blockchain...");
    const response = await settlement
      .connect(solver)
      .settle(...finalSettlement, await gasEstimator.txGasPrice());
    console.log(
      "Transaction submitted to the blockchain. Waiting for acceptance in a block...",
    );
    const receipt = await response.wait(requiredConfirmations);
    console.log(
      `Transaction successfully executed. Transaction hash: ${receipt.transactionHash}`,
    );
  }
}

export async function withdraw(input: WithdrawInput): Promise<string[] | null> {
  let withdrawals, finalSettlement;
  try {
    ({ withdrawals, finalSettlement } = await prepareWithdrawals(input));
  } catch (error) {
    console.log(
      "Script failed execution but no irreversible operations were performed",
    );
    console.log(error);
    return null;
  }

  if (finalSettlement === null) {
    return [];
  }

  await submitWithdrawals(input, finalSettlement);

  return withdrawals.map((w) => w.token.address);
}

const setupWithdrawTask: () => void = () =>
  task("withdraw", "Withdraw funds from the settlement contract")
    .addOptionalParam(
      "origin",
      "Address from which to withdraw. If not specified, it defaults to the first provided account",
    )
    .addOptionalParam(
      "minValue",
      "If specified, sets a minimum USD value required to withdraw the balance of a token.",
      "0",
      types.string,
    )
    .addOptionalParam(
      "leftover",
      "If specified, withdrawing leaves an amount of each token of USD value specified with this flag.",
      "0",
      types.string,
    )
    .addOptionalParam(
      "maxFeePercent",
      "If the extra gas needed to include a withdrawal is larger than this percent of the withdrawn amount, the token is not withdrawn.",
      5,
      types.float,
    )
    .addOptionalParam(
      "apiUrl",
      "If set, the script contacts the API using the given url. Otherwise, the default prod url for the current network is used",
    )
    .addParam("receiver", "The address receiving the withdrawn tokens.")
    .addFlag(
      "dryRun",
      "Just simulate the settlement instead of executing the transaction on the blockchain.",
    )
    .addFlag(
      "blocknativeGasPrice",
      "Use BlockNative gas price estimates for transactions.",
    )
    .addOptionalVariadicPositionalParam(
      "tokens",
      "An optional subset of tokens to consider for withdraw (otherwise all traded tokens will be queried).",
    )
    .setAction(
      async (
        {
          origin,
          minValue,
          leftover,
          maxFeePercent,
          receiver: inputReceiver,
          dryRun,
          tokens,
          apiUrl,
          blocknativeGasPrice,
        },
        hre: HardhatRuntimeEnvironment,
      ) => {
        const network = hre.network.name;
        if (!isSupportedNetwork(network)) {
          throw new Error(`Unsupported network ${network}`);
        }
        const gasEstimator = createGasEstimator(hre, {
          blockNative: blocknativeGasPrice,
        });
        const api = new Api(network, apiUrl ?? Environment.Prod);
        const receiver = utils.getAddress(inputReceiver);
        const [authenticator, settlementDeployment, solver] = await Promise.all(
          [
            getDeployedContract("GPv2AllowListAuthentication", hre),
            hre.deployments.get("GPv2Settlement"),
            getSignerOrAddress(hre, origin),
          ],
        );
        const settlement = new Contract(
          settlementDeployment.address,
          settlementDeployment.abi,
        ).connect(hre.ethers.provider);
        const settlementDeploymentBlock =
          settlementDeployment.receipt?.blockNumber ?? 0;
        console.log(`Using account ${solver.address}`);

        await withdraw({
          solver,
          tokens,
          minValue,
          leftover,
          receiver,
          maxFeePercent,
          authenticator,
          settlement,
          settlementDeploymentBlock,
          network,
          usdReference: REFERENCE_TOKEN[network],
          hre,
          api,
          dryRun,
          gasEstimator,
        });
      },
    );

export { setupWithdrawTask };
