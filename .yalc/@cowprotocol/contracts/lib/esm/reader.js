var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { ethers } from "ethers";
import { normalizeInteractions } from "./interaction";
import { OrderBalance } from "./order";
import { InteractionStage } from "./settlement";
/**
 * A generic method used to obfuscate the complexity of reading storage
 * of any StorageAccessible contract. That is, this method does the work of
 * 1. Encoding the function call on the reader
 * 2. Simulates delegatecall of storage read with encoded calldata
 * 3. Decodes the returned bytes from the storage read into expected return value.
 */
function readStorage(base, reader, method, parameters) {
    return __awaiter(this, void 0, void 0, function* () {
        const encodedCall = reader.interface.encodeFunctionData(method, parameters);
        const resultBytes = yield base.callStatic.simulateDelegatecall(reader.address, encodedCall);
        return reader.interface.decodeFunctionResult(method, resultBytes)[0];
    });
}
/**
 * A class for attaching the storage reader contract to a solver allow list for
 * providing additional storage reading methods.
 */
export class AllowListReader {
    constructor(allowList, reader) {
        this.allowList = allowList;
        this.reader = reader;
    }
    /**
     * Returns true if all the specified addresses are allowed solvers.
     */
    areSolvers(solvers) {
        return readStorage(this.allowList, this.reader, "areSolvers", [solvers]);
    }
}
/**
 * A class for attaching the storage reader contract to the GPv2Settlement contract
 * for providing additional storage reading methods.
 */
export class SettlementReader {
    constructor(settlement, reader) {
        this.settlement = settlement;
        this.reader = reader;
    }
    /**
     * Read and return filled amounts for a list of orders
     */
    filledAmountsForOrders(orderUids) {
        return readStorage(this.settlement, this.reader, "filledAmountsForOrders", [
            orderUids,
        ]);
    }
}
/**
 * Trade simulation storage reader contract allowing the simulation of trades.
 */
export class TradeSimulator {
    constructor(settlement, simulator) {
        this.settlement = settlement;
        this.simulator = simulator;
    }
    /**
     * Simulates the single order settlement for an executed trade and a set of
     * interactions.
     */
    simulateTrade(trade, interactions) {
        var _a, _b, _c, _d, _e, _f;
        const normalizedTrade = Object.assign(Object.assign({}, trade), { receiver: (_a = trade.receiver) !== null && _a !== void 0 ? _a : ethers.constants.AddressZero, sellTokenBalance: ethers.utils.id((_b = trade.sellTokenBalance) !== null && _b !== void 0 ? _b : OrderBalance.ERC20), buyTokenBalance: ethers.utils.id((_c = trade.buyTokenBalance) !== null && _c !== void 0 ? _c : OrderBalance.ERC20) });
        const normalizedInteractions = [
            normalizeInteractions((_d = interactions[InteractionStage.PRE]) !== null && _d !== void 0 ? _d : []),
            normalizeInteractions((_e = interactions[InteractionStage.INTRA]) !== null && _e !== void 0 ? _e : []),
            normalizeInteractions((_f = interactions[InteractionStage.POST]) !== null && _f !== void 0 ? _f : []),
        ];
        return readStorage(this.settlement, this.simulator, "simulateTrade", [
            normalizedTrade,
            normalizedInteractions,
        ]);
    }
}
//# sourceMappingURL=reader.js.map