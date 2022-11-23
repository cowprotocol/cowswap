import { DeployFunction } from "hardhat-deploy/types";
import { HardhatRuntimeEnvironment } from "hardhat/types";

import { CONTRACT_NAMES, SALT } from "../ts/deploy";

const deploySettlement: DeployFunction = async function ({
  deployments,
  getNamedAccounts,
}: HardhatRuntimeEnvironment) {
  const { deployer } = await getNamedAccounts();
  const { deploy } = deployments;

  const { tradeSimulator } = CONTRACT_NAMES;

  await deploy(tradeSimulator, {
    from: deployer,
    gasLimit: 2e6,
    deterministicDeployment: SALT,
    log: true,
  });
};

export default deploySettlement;
