import WETH from "canonical-weth/build/contracts/WETH9.json";
import { DeployFunction } from "hardhat-deploy/types";
import { HardhatRuntimeEnvironment } from "hardhat/types";

import Authorizer from "../../balancer/Authorizer.json";
import Vault from "../../balancer/Vault.json";
import BALANCER_NETWORKS from "../../balancer/networks.json";
import { CONTRACT_NAMES, SALT } from "../ts/deploy";

const deploySettlement: DeployFunction = async function ({
  deployments,
  ethers,
  getNamedAccounts,
  network,
}: HardhatRuntimeEnvironment) {
  const { deployer, manager } = await getNamedAccounts();
  const { deploy, get } = deployments;

  const { authenticator, settlement } = CONTRACT_NAMES;
  const { address: authenticatorAddress } = await get(authenticator);

  let vaultAddress: string;
  if (network.name === "hardhat" || network.name === "localhost") {
    const { address: authorizerAddress } = await deploy("VaultAuthorizer", {
      from: deployer,
      contract: Authorizer,
      gasLimit: 3e6,
      args: [manager],
    });
    const { address: wethAddress } = await deploy("WETH", {
      from: deployer,
      contract: WETH,
      gasLimit: 3e6,
    });
    ({ address: vaultAddress } = await deploy("Vault", {
      from: deployer,
      contract: Vault,
      gasLimit: 8e6,
      args: [authorizerAddress, wethAddress, 0, 0],
    }));
  } else {
    const { chainId } = await ethers.provider.getNetwork();
    const vaultNetworks = BALANCER_NETWORKS["Vault"] as Record<
      number,
      { address: string } | undefined
    >;
    const vaultDeployment = vaultNetworks[chainId];
    if (vaultDeployment === undefined) {
      throw new Error(`Vault not deployed on chain ${chainId}`);
    }

    vaultAddress = vaultDeployment.address;
  }

  await deploy(settlement, {
    from: deployer,
    gasLimit: 5e6,
    args: [authenticatorAddress, vaultAddress],
    deterministicDeployment: SALT,
    log: true,
  });
};

export default deploySettlement;
