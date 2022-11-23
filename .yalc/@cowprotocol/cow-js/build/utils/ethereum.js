"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getNetworkFromId = exports.toBnOrNull = void 0;
const tslib_1 = require("tslib");
const bn_js_1 = tslib_1.__importDefault(require("bn.js"));
var web3_utils_1 = require("web3-utils");
Object.defineProperty(exports, "fromWei", { enumerable: true, get: function () { return web3_utils_1.fromWei; } });
Object.defineProperty(exports, "toWei", { enumerable: true, get: function () { return web3_utils_1.toWei; } });
Object.defineProperty(exports, "isBN", { enumerable: true, get: function () { return web3_utils_1.isBN; } });
Object.defineProperty(exports, "toBN", { enumerable: true, get: function () { return web3_utils_1.toBN; } });
function toBnOrNull(value) {
    if (value === undefined || value === null || value === '') {
        return null;
    }
    try {
        return new bn_js_1.default(value);
    }
    catch (error) {
        return null;
    }
}
exports.toBnOrNull = toBnOrNull;
const id2Network = {
    1: 'Mainnet',
    3: 'Ropsten',
    4: 'Rinkeby',
    5: 'Goerli',
    42: 'Kovan',
    100: 'xDai',
};
exports.getNetworkFromId = (networkId) => id2Network[networkId] || 'Unknown Network';
//# sourceMappingURL=ethereum.js.map