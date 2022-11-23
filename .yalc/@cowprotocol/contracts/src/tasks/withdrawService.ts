import "@nomiclabs/hardhat-ethers";

import { promises as fs, constants as fsConstants } from "fs";

import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { assert } from "chai";
import { utils, Contract } from "ethers";
import { task, types } from "hardhat/config";
import { HardhatRuntimeEnvironment } from "hardhat/types";

import { BUY_ETH_ADDRESS } from "../ts";
import { Api, Environment } from "../ts/api";

import {
  assertNotBuyingNativeAsset,
  dump,
  MAX_ORDER_VALIDITY_SECONDS,
} from "./dump";
import {
  getDeployedContract,
  isSupportedNetwork,
  SupportedNetwork,
} from "./ts/deployment";
import { createGasEstimator, IGasEstimator } from "./ts/gas";
import { promiseAllWithRateLimit } from "./ts/rate_limits";
import { balanceOf, erc20Token } from "./ts/tokens";
import { ReferenceToken, REFERENCE_TOKEN } from "./ts/value";
import { withdraw } from "./withdraw";
import {
  getAllTradedTokens,
  partialTradedTokensKey,
  TradedTokens,
  TradedTokensError,
} from "./withdraw/traded_tokens";

const MAX_ORDER_RETRIES_BEFORE_SKIPPING = 10;
const MAX_CHECKED_TOKENS_PER_RUN = 200;

export interface State {
  /**
   * Block number at which the current list of traded tokens was updated.
   */
  lastUpdateBlock: number;
  /**
   * All tokens ever traded on GPv2. Stored in the state to avoid stressing the
   * node by recovering the list every time.
   */
  tradedTokens: string[];
  /**
   * Index (in tradedTokens) following that of the last withdrawn token in the
   * previous run of this script.
   */
  nextTokenToTrade: number;
  /**
   * Tokens that have a pending order from a previous execution of the withdraw
   * service.
   */
  pendingTokens: PendingToken[];
  /**
   * Number of consecutive soft errors in a row. A soft error is an error that
   * has no irreversible consequences, for example a network timeout before
   * any transactions has been sent onchain.
   */
  softErrorCount?: number;
  /**
   * The chain id of the chain that was used to generate this state. The chain
   * id is determined on the first run and cannot change.
   */
  chainId?: number;
}

interface PendingToken {
  /**
   * The address of the token.
   */
  address: string;
  /**
   * How many consecutive times the script sold this token with no success.
   * Note that the script will not wait to check if the orders were successful,
   * which means that every order in a run will add a pending token with one
   * retry.
   */
  retries: number;
}

function isValidState(state: unknown): state is State {
  if (state === null || typeof state !== "object") {
    console.error("State json is not an object");
    return false;
  }
  const stateObject = state as State;
  if (typeof stateObject["lastUpdateBlock"] !== "number") {
    console.error("Invalid lastUpdateBlock");
    return false;
  }
  if (typeof stateObject["nextTokenToTrade"] !== "number") {
    console.error("Invalid nextTokenToTrade");
    return false;
  }
  if (
    !(
      stateObject["tradedTokens"] instanceof Array &&
      stateObject["tradedTokens"].every(
        (elt) => typeof elt === "string" && utils.isAddress(elt),
      )
    )
  ) {
    console.error("Invalid tradedTokens");
    return false;
  }
  if (
    !(
      stateObject["pendingTokens"] instanceof Array &&
      stateObject["pendingTokens"].every(
        (elt) =>
          elt !== null &&
          typeof elt === "object" &&
          typeof elt.address === "string" &&
          utils.isAddress(elt.address) &&
          typeof elt.retries === "number",
      )
    )
  ) {
    console.error("Invalid pendingTokens");
    return false;
  }
  return true;
}

function bumpErrorCount(state: State) {
  const softErrorCount = (state.softErrorCount ?? 0) + 1;
  // exponential alert backoff
  if (Number.isInteger(Math.log2(softErrorCount / 10))) {
    console.error(`Encountered ${softErrorCount} soft errors in a row`);
  }
  return {
    ...state,
    softErrorCount,
  };
}

async function updatePendingTokens(
  pendingTokens: PendingToken[],
  solver: string,
  hre: HardhatRuntimeEnvironment,
): Promise<PendingToken[]> {
  return (
    await promiseAllWithRateLimit(
      pendingTokens.map((pendingToken) => async ({ consoleError }) => {
        if (pendingToken.retries >= MAX_ORDER_RETRIES_BEFORE_SKIPPING) {
          // Note that this error might be triggered in legitimate cases, for
          // example if a token did not trade the first time and then the price
          // has become so low that it's not enough to pay for the fee.
          // TODO: revisit after getting an idea of the frequency at which this
          // alert is triggered.
          consoleError(
            `Tried ${pendingToken.retries} times to sell token ${pendingToken.address} without success. Skipping token until future run`,
          );
          return [];
        }

        // assumption: eth is not in the list (as it's not supported by the
        // withdraw script). This should not happen unless the pending token
        // list in the state was manually changed and ETH was added.
        assert(
          pendingToken.address.toLowerCase() !== BUY_ETH_ADDRESS.toLowerCase(),
          "Pending tokens should not contain ETH",
        );
        const token = await erc20Token(pendingToken.address, hre);
        if (token === null) {
          throw new Error(
            `Previously sold a token that is not a valid ERC20 token anymore (address ${pendingToken.address})`,
          );
        }
        return (await balanceOf(token, solver)).isZero() ? [] : [pendingToken];
      }),
    )
  ).flat();
}

function bumpAllPendingTokenRetries(
  pendingTokens: PendingToken[],
): PendingToken[] {
  return pendingTokens.map((pendingToken) => ({
    ...pendingToken,
    retries: pendingToken.retries + 1,
  }));
}

export interface WithdrawAndDumpInput {
  state: State;
  solver: SignerWithAddress;
  receiver: string;
  authenticator: Contract;
  settlement: Contract;
  settlementDeploymentBlock: number;
  minValue: string;
  leftover: string;
  validity: number;
  maxFeePercent: number;
  slippageBps: number;
  toToken: string;
  network: SupportedNetwork;
  usdReference: ReferenceToken;
  hre: HardhatRuntimeEnvironment;
  api: Api;
  dryRun: boolean;
  gasEstimator: IGasEstimator;
  confirmationsAfterWithdrawing?: number | undefined;
  pagination?: number | undefined;
}
/**
 * This function withdraws funds from the settlement contracts and puts the
 * withdrawn amount up for trade in GPv2 in exchange for a target token. The
 * proceeds are sent to a receiver address.
 *
 * This function is supposed to be called regularly and only a portion of the
 * possible withdraws are performed at a time. This is done in order not to
 * stress the infrastructure with too many simultaneous requests (node calls,
 * api queries, orders).
 * Because of this, the withdraw processing works based on a state containing
 * information on which tokens should be withdrawn next. The output of this
 * function is the updated state.
 *
 * The process comprises two steps:
 * 1. funds are withdrawn from the settlement contract to the solver
 * 2. orders are signed by the solver to sell these funds
 * This function inherit some of the parameters used in each intermediate step.
 */
export async function withdrawAndDump({
  state,
  solver,
  receiver,
  authenticator,
  settlement,
  settlementDeploymentBlock,
  minValue,
  leftover,
  validity,
  maxFeePercent,
  slippageBps,
  toToken,
  network,
  usdReference,
  hre,
  api,
  dryRun,
  gasEstimator,
  confirmationsAfterWithdrawing,
  pagination,
}: WithdrawAndDumpInput): Promise<State> {
  let chainId;
  try {
    ({ chainId } = await hre.ethers.provider.getNetwork());
  } catch (error) {
    console.log(
      "Soft error encountered when retrieving information from the node",
    );
    console.log(error);
    return bumpErrorCount(state);
  }

  if (state.chainId === undefined) {
    state.chainId = chainId;
  } else if (state.chainId !== chainId) {
    throw new Error(
      `Current state file was created on chain id ${state.chainId}, current chain id is ${chainId}.`,
    );
  }

  if (pagination === undefined) {
    pagination = MAX_CHECKED_TOKENS_PER_RUN;
  } else if (pagination > MAX_CHECKED_TOKENS_PER_RUN) {
    throw new Error(
      `Too many tokens checked per run (${pagination}, max ${MAX_CHECKED_TOKENS_PER_RUN})`,
    );
  }
  const stateUpdates: Partial<State> = {};

  // Update list of pending tokens to determine which token was traded
  let pendingTokens;
  try {
    pendingTokens = await updatePendingTokens(
      state.pendingTokens,
      solver.address,
      hre,
    );
  } catch (error) {
    console.log(`Encountered soft error when updating pending token list`);
    console.log(error);
    return bumpErrorCount({ ...state, ...stateUpdates });
  }
  stateUpdates.pendingTokens = pendingTokens;

  console.log("Recovering list of tokens traded since the previous run...");
  // Add extra blocks before the last update in case there was a reorg and new
  // transactions were included.
  const maxReorgDistance = 20;
  const fromBlock = Math.max(0, state.lastUpdateBlock - maxReorgDistance);
  let tradedTokensWithBlock: TradedTokens;
  let tokenRecoveryFailed = false;
  try {
    tradedTokensWithBlock = await getAllTradedTokens(
      settlement,
      fromBlock,
      "latest",
      hre,
    );
  } catch (error) {
    console.log(`Encountered soft error when retrieving traded tokens`);
    if (
      error instanceof Error &&
      Object.keys(error).includes(partialTradedTokensKey)
    ) {
      tokenRecoveryFailed = true;
      tradedTokensWithBlock = (error as TradedTokensError)[
        partialTradedTokensKey
      ];
      delete (error as Error & Record<string, unknown>)[partialTradedTokensKey];
      console.log(error);
    } else {
      console.log(error);
      return bumpErrorCount({ ...state, ...stateUpdates });
    }
  }

  const tradedTokens = state.tradedTokens.concat(
    tradedTokensWithBlock.tokens.filter(
      (token) =>
        !(state.tradedTokens.includes(token) || token === BUY_ETH_ADDRESS),
    ),
  );
  stateUpdates.tradedTokens = tradedTokens;
  stateUpdates.lastUpdateBlock = tradedTokensWithBlock.toBlock;

  if (tokenRecoveryFailed) {
    return bumpErrorCount({ ...state, ...stateUpdates });
  }

  const numCheckedTokens = Math.min(pagination, tradedTokens.length);
  // The index of the checked token wraps around after reaching the end of the
  // traded token list
  const checkedTokens = tradedTokens
    .concat(tradedTokens)
    .slice(state.nextTokenToTrade, state.nextTokenToTrade + numCheckedTokens);

  console.log("Starting withdraw step...");
  const withdrawnTokens = await withdraw({
    solver,
    tokens: checkedTokens,
    minValue,
    leftover,
    maxFeePercent,
    receiver: solver.address,
    authenticator,
    settlement,
    settlementDeploymentBlock,
    network,
    usdReference,
    hre,
    api,
    dryRun,
    gasEstimator,
    doNotPrompt: true,
    // Wait for node to pick up updated balances before running the dump
    // function
    requiredConfirmations: confirmationsAfterWithdrawing,
  });

  if (withdrawnTokens === null) {
    console.log(`Encountered soft error during withdraw step`);
    return bumpErrorCount({ ...state, ...stateUpdates });
  }

  stateUpdates.nextTokenToTrade =
    (state.nextTokenToTrade + numCheckedTokens) % tradedTokens.length;

  const tokensToDump = Array.from(
    new Set(pendingTokens.map((t) => t.address).concat(withdrawnTokens)),
  ).filter((addr) => addr !== BUY_ETH_ADDRESS);

  await dump({
    validity,
    maxFeePercent,
    slippageBps,
    dumpedTokens: tokensToDump,
    toToken,
    settlement,
    signer: solver,
    receiver,
    network,
    hre,
    api,
    dryRun,
    gasEstimator,
    doNotPrompt: true,
  });
  if (dryRun) {
    console.log(
      "Dry run: the amount withdrawn from the settlement contract are missing, only amounts that are already present at this address are shown.",
    );
  }

  const updatedPendingTokens = bumpAllPendingTokenRetries(
    stateUpdates.pendingTokens,
  );
  updatedPendingTokens.push(
    ...tokensToDump
      .filter(
        (address) =>
          !updatedPendingTokens
            .map((pendingToken) => pendingToken.address)
            .includes(address),
      )
      .map((address) => ({ address, retries: 1 })),
  );
  stateUpdates.pendingTokens = updatedPendingTokens;
  stateUpdates.softErrorCount = 0;

  // stateUpdates is now populated with everything needed to be a proper state.
  // The type system isn't able to see that however, the second best thing to
  // verify that everything is set is a runtime check and tests.
  if (!isValidState(stateUpdates)) {
    console.log("Generated state:", stateUpdates);
    throw new Error("Withdraw service did not generate a valid state");
  }
  return stateUpdates;
}

async function fileExists(path: string): Promise<boolean> {
  try {
    await fs.access(path, fsConstants.F_OK);
    return true;
  } catch (e) {
    return false;
  }
}

async function getState(stateFilePath: string): Promise<State> {
  let state: State;
  if (!(await fileExists(stateFilePath))) {
    console.debug("No state found, using empty state");
    state = {
      lastUpdateBlock: 0,
      tradedTokens: [],
      nextTokenToTrade: 0,
      pendingTokens: [],
    };
  } else {
    console.debug(`Loading state from ${stateFilePath}...`);
    state = JSON.parse((await fs.readFile(stateFilePath)).toString());
  }
  if (!isValidState(state)) {
    console.error(`Bad initial state: ${JSON.stringify(state)}`);
    throw new Error("Invalid state detect");
  }
  return state;
}

async function updateStateOnDisk(
  updatedState: State,
  stateFilePath: string,
  dryRun: boolean,
) {
  console.debug(`Updated state: ${JSON.stringify(updatedState)}`);
  if (!dryRun) {
    await fs.writeFile(
      stateFilePath,
      JSON.stringify(updatedState, undefined, 2),
    );
  }
}

const setupWithdrawServiceTask: () => void = () =>
  task("withdrawService", "Withdraw funds from the settlement contract")
    .addOptionalParam(
      "minValue",
      "If specified, sets a minimum USD value required to withdraw the balance of a token",
      "100",
      types.string,
    )
    .addOptionalParam(
      "leftover",
      "If specified, withdrawing leaves an amount of each token of USD value specified with this flag",
      "100",
      types.string,
    )
    .addOptionalParam(
      "toToken",
      "All input tokens will be dumped to this token. If not specified, it defaults to the network's native token (e.g., ETH)",
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
      "stateFilePath",
      "The path to the file where the state of the script is stored. This file will be updated after a run",
      "./state.json",
      types.string,
    )
    .addOptionalParam(
      "tokensPerRun",
      `The maximum number of tokens to process in a single withdraw run. Must be smaller than ${MAX_CHECKED_TOKENS_PER_RUN}`,
    )
    .addOptionalParam(
      "apiUrl",
      "If set, the script contacts the API using the given url. Otherwise, the default prod url for the current network is used",
    )
    .addParam("receiver", "The address receiving the withdrawn tokens")
    .addFlag(
      "dryRun",
      "Just simulate the settlement instead of executing the transaction on the blockchain",
    )
    .addFlag(
      "blocknativeGasPrice",
      "Use BlockNative gas price estimates for transactions.",
    )
    .setAction(
      async (
        {
          minValue,
          leftover,
          toToken,
          validity,
          maxFeePercent,
          slippageBps,
          stateFilePath,
          receiver: inputReceiver,
          dryRun,
          tokensPerRun,
          apiUrl,
          blocknativeGasPrice,
        },
        hre: HardhatRuntimeEnvironment,
      ) => {
        // TODO: remove once native asset orders are fully supported.
        assertNotBuyingNativeAsset(toToken);

        const state = await getState(stateFilePath);
        console.debug(`Initial state: ${JSON.stringify(state)}`);
        const network = hre.network.name;
        if (!isSupportedNetwork(network)) {
          throw new Error(`Unsupported network ${network}`);
        }
        const gasEstimator = createGasEstimator(hre, {
          blockNative: blocknativeGasPrice,
        });
        const usdReference = REFERENCE_TOKEN[network];
        const api = new Api(network, apiUrl ?? Environment.Prod);
        const receiver = utils.getAddress(inputReceiver);
        let authenticator, settlementDeployment, solver;
        try {
          [authenticator, settlementDeployment, [solver]] = await Promise.all([
            getDeployedContract("GPv2AllowListAuthentication", hre),
            hre.deployments.get("GPv2Settlement"),
            hre.ethers.getSigners(),
          ]);
        } catch (error) {
          console.log(
            "Soft error encountered when retrieving information from the node",
          );
          console.log(error);
          const updatedState = {
            ...state,
            softErrorCount: (state.softErrorCount ?? 0) + 1,
          };
          await updateStateOnDisk(updatedState, stateFilePath, dryRun);
          return;
        }
        const settlement = new Contract(
          settlementDeployment.address,
          settlementDeployment.abi,
        ).connect(hre.ethers.provider);
        const settlementDeploymentBlock =
          settlementDeployment.receipt?.blockNumber ?? 0;
        console.log(`Using account ${solver.address}`);

        const updatedState = await withdrawAndDump({
          state,
          solver,
          receiver,
          authenticator,
          settlement,
          settlementDeploymentBlock,
          minValue,
          leftover,
          validity,
          maxFeePercent,
          slippageBps,
          toToken,
          network,
          usdReference,
          hre,
          api,
          dryRun,
          gasEstimator,
          confirmationsAfterWithdrawing: 2,
          pagination: tokensPerRun,
        });

        await updateStateOnDisk(updatedState, stateFilePath, dryRun);
      },
    );

export { setupWithdrawServiceTask };
