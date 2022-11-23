"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TradeSimulator = exports.SettlementReader = exports.AllowListReader = void 0;
var ethers_1 = require("ethers");
var interaction_1 = require("./interaction");
var order_1 = require("./order");
var settlement_1 = require("./settlement");
/**
 * A generic method used to obfuscate the complexity of reading storage
 * of any StorageAccessible contract. That is, this method does the work of
 * 1. Encoding the function call on the reader
 * 2. Simulates delegatecall of storage read with encoded calldata
 * 3. Decodes the returned bytes from the storage read into expected return value.
 */
function readStorage(base, reader, method, parameters) {
    return __awaiter(this, void 0, void 0, function () {
        var encodedCall, resultBytes;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    encodedCall = reader.interface.encodeFunctionData(method, parameters);
                    return [4 /*yield*/, base.callStatic.simulateDelegatecall(reader.address, encodedCall)];
                case 1:
                    resultBytes = _a.sent();
                    return [2 /*return*/, reader.interface.decodeFunctionResult(method, resultBytes)[0]];
            }
        });
    });
}
/**
 * A class for attaching the storage reader contract to a solver allow list for
 * providing additional storage reading methods.
 */
var AllowListReader = /** @class */ (function () {
    function AllowListReader(allowList, reader) {
        this.allowList = allowList;
        this.reader = reader;
    }
    /**
     * Returns true if all the specified addresses are allowed solvers.
     */
    AllowListReader.prototype.areSolvers = function (solvers) {
        return readStorage(this.allowList, this.reader, "areSolvers", [solvers]);
    };
    return AllowListReader;
}());
exports.AllowListReader = AllowListReader;
/**
 * A class for attaching the storage reader contract to the GPv2Settlement contract
 * for providing additional storage reading methods.
 */
var SettlementReader = /** @class */ (function () {
    function SettlementReader(settlement, reader) {
        this.settlement = settlement;
        this.reader = reader;
    }
    /**
     * Read and return filled amounts for a list of orders
     */
    SettlementReader.prototype.filledAmountsForOrders = function (orderUids) {
        return readStorage(this.settlement, this.reader, "filledAmountsForOrders", [
            orderUids,
        ]);
    };
    return SettlementReader;
}());
exports.SettlementReader = SettlementReader;
/**
 * Trade simulation storage reader contract allowing the simulation of trades.
 */
var TradeSimulator = /** @class */ (function () {
    function TradeSimulator(settlement, simulator) {
        this.settlement = settlement;
        this.simulator = simulator;
    }
    /**
     * Simulates the single order settlement for an executed trade and a set of
     * interactions.
     */
    TradeSimulator.prototype.simulateTrade = function (trade, interactions) {
        var _a, _b, _c, _d, _e, _f;
        var normalizedTrade = __assign(__assign({}, trade), { receiver: (_a = trade.receiver) !== null && _a !== void 0 ? _a : ethers_1.ethers.constants.AddressZero, sellTokenBalance: ethers_1.ethers.utils.id((_b = trade.sellTokenBalance) !== null && _b !== void 0 ? _b : order_1.OrderBalance.ERC20), buyTokenBalance: ethers_1.ethers.utils.id((_c = trade.buyTokenBalance) !== null && _c !== void 0 ? _c : order_1.OrderBalance.ERC20) });
        var normalizedInteractions = [
            (0, interaction_1.normalizeInteractions)((_d = interactions[settlement_1.InteractionStage.PRE]) !== null && _d !== void 0 ? _d : []),
            (0, interaction_1.normalizeInteractions)((_e = interactions[settlement_1.InteractionStage.INTRA]) !== null && _e !== void 0 ? _e : []),
            (0, interaction_1.normalizeInteractions)((_f = interactions[settlement_1.InteractionStage.POST]) !== null && _f !== void 0 ? _f : []),
        ];
        return readStorage(this.settlement, this.simulator, "simulateTrade", [
            normalizedTrade,
            normalizedInteractions,
        ]);
    };
    return TradeSimulator;
}());
exports.TradeSimulator = TradeSimulator;
//# sourceMappingURL=reader.js.map