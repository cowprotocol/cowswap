"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deterministicDeploymentAddress = exports.CONTRACT_NAMES = exports.DEPLOYER_CONTRACT = exports.SALT = void 0;
var ethers_1 = require("ethers");
/**
 * The salt used when deterministically deploying smart contracts.
 */
exports.SALT = ethers_1.utils.formatBytes32String("Mattresses in Berlin!");
/**
 * The contract used to deploy contracts deterministically with CREATE2.
 * The address is chosen by the hardhat-deploy library.
 * It is the same in any EVM-based network.
 *
 * https://github.com/Arachnid/deterministic-deployment-proxy
 */
exports.DEPLOYER_CONTRACT = "0x4e59b44847b379578588920ca78fbf26c0b4956c";
/**
 * Dictionary containing all deployed contract names.
 */
exports.CONTRACT_NAMES = {
    authenticator: "GPv2AllowListAuthentication",
    settlement: "GPv2Settlement",
    tradeSimulator: "GPv2TradeSimulator",
};
/**
 * Computes the deterministic address at which the contract will be deployed.
 * This address does not depend on which network the contract is deployed to.
 *
 * @param contractName Name of the contract for which to find the address.
 * @param deploymentArguments Extra arguments that are necessary to deploy.
 * @returns The address that is expected to store the deployed code.
 */
function deterministicDeploymentAddress(_a, deploymentArguments) {
    var abi = _a.abi, bytecode = _a.bytecode;
    var contractInterface = new ethers_1.utils.Interface(abi);
    var deployData = ethers_1.utils.hexConcat([
        bytecode,
        contractInterface.encodeDeploy(deploymentArguments),
    ]);
    return ethers_1.utils.getCreate2Address(exports.DEPLOYER_CONTRACT, exports.SALT, ethers_1.utils.keccak256(deployData));
}
exports.deterministicDeploymentAddress = deterministicDeploymentAddress;
//# sourceMappingURL=deploy.js.map