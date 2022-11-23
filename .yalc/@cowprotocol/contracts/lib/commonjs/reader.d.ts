import { BigNumber, BytesLike, Contract } from "ethers";
import { InteractionLike } from "./interaction";
import { Order } from "./order";
import { InteractionStage } from "./settlement";
/**
 * A class for attaching the storage reader contract to a solver allow list for
 * providing additional storage reading methods.
 */
export declare class AllowListReader {
    readonly allowList: Contract;
    readonly reader: Contract;
    constructor(allowList: Contract, reader: Contract);
    /**
     * Returns true if all the specified addresses are allowed solvers.
     */
    areSolvers(solvers: BytesLike[]): Promise<string>;
}
/**
 * A class for attaching the storage reader contract to the GPv2Settlement contract
 * for providing additional storage reading methods.
 */
export declare class SettlementReader {
    readonly settlement: Contract;
    readonly reader: Contract;
    constructor(settlement: Contract, reader: Contract);
    /**
     * Read and return filled amounts for a list of orders
     */
    filledAmountsForOrders(orderUids: BytesLike[]): Promise<BigNumber[]>;
}
/**
 * A simulated trade.
 */
export declare type TradeSimulation = Pick<Order, "sellToken" | "buyToken" | "receiver" | "sellAmount" | "buyAmount" | "sellTokenBalance" | "buyTokenBalance"> & {
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
export declare class TradeSimulator {
    readonly settlement: Contract;
    readonly simulator: Contract;
    constructor(settlement: Contract, simulator: Contract);
    /**
     * Simulates the single order settlement for an executed trade and a set of
     * interactions.
     */
    simulateTrade(trade: TradeSimulation, interactions: Partial<Record<InteractionStage, InteractionLike[]>>): Promise<TradeSimulationResult>;
}
