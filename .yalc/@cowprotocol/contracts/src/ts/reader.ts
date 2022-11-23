import { BigNumber, BytesLike, Contract, ethers } from "ethers";

import { InteractionLike, normalizeInteractions } from "./interaction";
import { Order, OrderBalance } from "./order";
import { InteractionStage } from "./settlement";

/**
 * A generic method used to obfuscate the complexity of reading storage
 * of any StorageAccessible contract. That is, this method does the work of
 * 1. Encoding the function call on the reader
 * 2. Simulates delegatecall of storage read with encoded calldata
 * 3. Decodes the returned bytes from the storage read into expected return value.
 */
async function readStorage(
  base: Contract,
  reader: Contract,
  method: string,
  parameters: unknown[],
) {
  const encodedCall = reader.interface.encodeFunctionData(method, parameters);
  const resultBytes = await base.callStatic.simulateDelegatecall(
    reader.address,
    encodedCall,
  );
  return reader.interface.decodeFunctionResult(method, resultBytes)[0];
}

/**
 * A class for attaching the storage reader contract to a solver allow list for
 * providing additional storage reading methods.
 */
export class AllowListReader {
  constructor(
    public readonly allowList: Contract,
    public readonly reader: Contract,
  ) {}

  /**
   * Returns true if all the specified addresses are allowed solvers.
   */
  public areSolvers(solvers: BytesLike[]): Promise<string> {
    return readStorage(this.allowList, this.reader, "areSolvers", [solvers]);
  }
}

/**
 * A class for attaching the storage reader contract to the GPv2Settlement contract
 * for providing additional storage reading methods.
 */
export class SettlementReader {
  constructor(
    public readonly settlement: Contract,
    public readonly reader: Contract,
  ) {}

  /**
   * Read and return filled amounts for a list of orders
   */
  public filledAmountsForOrders(orderUids: BytesLike[]): Promise<BigNumber[]> {
    return readStorage(this.settlement, this.reader, "filledAmountsForOrders", [
      orderUids,
    ]);
  }
}

/**
 * A simulated trade.
 */
export type TradeSimulation = Pick<
  Order,
  | "sellToken"
  | "buyToken"
  | "receiver"
  | "sellAmount"
  | "buyAmount"
  | "sellTokenBalance"
  | "buyTokenBalance"
> & {
  /**
   * The address of the owner of the trade. For an actual settlement, this would
   * usually this would be determinied by recovering an order signature.
   */
  owner: string;
};

/**
 * Account balance changes in a trade simulation
 */
export interface TradeSimulationBalanceDelta {
  sellTokenDelta: BigNumber;
  buyTokenDelta: BigNumber;
}

/**
 * The result of a trade simulation.
 */
export interface TradeSimulationResult {
  gasUsed: BigNumber;
  executedBuyAmount: BigNumber;
  contractBalance: TradeSimulationBalanceDelta;
  ownerBalance: TradeSimulationBalanceDelta;
}

/**
 * Trade simulation storage reader contract allowing the simulation of trades.
 */
export class TradeSimulator {
  constructor(
    public readonly settlement: Contract,
    public readonly simulator: Contract,
  ) {}

  /**
   * Simulates the single order settlement for an executed trade and a set of
   * interactions.
   */
  public simulateTrade(
    trade: TradeSimulation,
    interactions: Partial<Record<InteractionStage, InteractionLike[]>>,
  ): Promise<TradeSimulationResult> {
    const normalizedTrade = {
      ...trade,
      receiver: trade.receiver ?? ethers.constants.AddressZero,
      sellTokenBalance: ethers.utils.id(
        trade.sellTokenBalance ?? OrderBalance.ERC20,
      ),
      buyTokenBalance: ethers.utils.id(
        trade.buyTokenBalance ?? OrderBalance.ERC20,
      ),
    };
    const normalizedInteractions = [
      normalizeInteractions(interactions[InteractionStage.PRE] ?? []),
      normalizeInteractions(interactions[InteractionStage.INTRA] ?? []),
      normalizeInteractions(interactions[InteractionStage.POST] ?? []),
    ];
    return readStorage(this.settlement, this.simulator, "simulateTrade", [
      normalizedTrade,
      normalizedInteractions,
    ]);
  }
}
