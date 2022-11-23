import { Contract } from "ethers";
import { HardhatRuntimeEnvironment } from "hardhat/types";

import { ContractName } from "../../ts";

const supportedNetworks = ["rinkeby", "xdai", "mainnet"] as const;
export type SupportedNetwork = typeof supportedNetworks[number];
export function isSupportedNetwork(
  network: string,
): network is SupportedNetwork {
  return (supportedNetworks as readonly string[]).includes(network);
}

export async function getDeployedContract(
  name: ContractName,
  { ethers, deployments }: HardhatRuntimeEnvironment,
): Promise<Contract> {
  const deployment = await deployments.get(name);

  return new Contract(deployment.address, deployment.abi).connect(
    ethers.provider,
  );
}
