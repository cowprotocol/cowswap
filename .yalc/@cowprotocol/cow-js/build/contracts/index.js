"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createTcrContract = exports.createWrapEtherContract = exports.createErc20Contract = exports.tcrAbi = exports.wethAbi = exports.erc20Abi = void 0;
const tslib_1 = require("tslib");
const Erc20_json_1 = tslib_1.__importDefault(require("./abi/Erc20.json"));
const Weth_json_1 = tslib_1.__importDefault(require("./abi/Weth.json"));
const Tcr_json_1 = tslib_1.__importDefault(require("./abi/Tcr.json"));
tslib_1.__exportStar(require("./types"), exports);
tslib_1.__exportStar(require("./Erc20Contract"), exports);
tslib_1.__exportStar(require("./WethContract"), exports);
tslib_1.__exportStar(require("./TcrContract"), exports);
exports.erc20Abi = Erc20_json_1.default;
exports.wethAbi = Weth_json_1.default;
exports.tcrAbi = Tcr_json_1.default;
function createErc20Contract(web3, address) {
    // FIXME: There's an issue with this conversion: https://github.com/gnosis/dex-telegram/issues/14
    const unknownContract = new web3.eth.Contract(exports.erc20Abi, address);
    return unknownContract;
}
exports.createErc20Contract = createErc20Contract;
function createWrapEtherContract(web3, address) {
    // FIXME: There's an issue with this conversion: https://github.com/gnosis/dex-telegram/issues/14
    const unknownContract = new web3.eth.Contract(exports.wethAbi, address);
    return unknownContract;
}
exports.createWrapEtherContract = createWrapEtherContract;
function createTcrContract(web3, address) {
    // FIXME: There's an issue with this conversion: https://github.com/gnosis/dex-telegram/issues/14
    const unknownContract = new web3.eth.Contract(exports.tcrAbi, address);
    return unknownContract;
}
exports.createTcrContract = createTcrContract;
//# sourceMappingURL=index.js.map