import { promises as fs } from "fs";
import path from "path";

import { DeployFunction } from "hardhat-deploy/types";
import { HardhatRuntimeEnvironment } from "hardhat/types";

const NETWORKS_PATH = path.join(__dirname, "../../networks.json");
const INDENT = "  ";

type Networks = Record<string, Network>;
type Network = Record<number, DeploymentRecord>;

interface DeploymentRecord {
  address: string;
  transactionHash?: string;
}

const updateNetworks: DeployFunction = async function ({
  deployments,
  getChainId,
  ethers,
  network,
}: HardhatRuntimeEnvironment) {
  if (network.name === "hardhat" || network.name === "localhost") {
    return;
  }

  console.log("updating 'networks.json'...");

  const chainId = parseInt(await getChainId());
  const networks: Networks = JSON.parse(
    await fs.readFile(NETWORKS_PATH, "utf-8"),
  );

  const updateRecord = (
    contractName: string,
    { address, transactionHash }: DeploymentRecord,
  ) => {
    networks[contractName] = networks[contractName] || {};
    const record = (networks[contractName][chainId] = {
      ...networks[contractName][chainId],
      address,
    });

    // NOTE: Preserve transaction hash in case there is no new deployment
    // because the contract bytecode did not change.
    record.transactionHash = transactionHash || record.transactionHash;
  };

  for (const [name, deployment] of Object.entries(await deployments.all())) {
    updateRecord(name, deployment);
  }

  const settlementRecord = networks["GPv2Settlement"][chainId];
  const settlement = await ethers.getContractAt(
    "GPv2Settlement",
    settlementRecord.address,
  );
  updateRecord("GPv2VaultRelayer", {
    address: await settlement.vaultRelayer(),
    transactionHash: settlementRecord.transactionHash,
  });

  await fs.writeFile(NETWORKS_PATH, JSON.stringify(networks, null, INDENT));
};

export default updateNetworks;
