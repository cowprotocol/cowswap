import "hardhat-deploy";
import "@nomiclabs/hardhat-ethers";

import { task } from "hardhat/config";
import { HardhatRuntimeEnvironment } from "hardhat/types";

import { proxyInterface } from "../ts";

import { getDeployedContract } from "./ts/deployment";
import { getNamedSigner } from "./ts/signers";
import { prompt, transactionUrl } from "./ts/tui";

interface Args {
  newOwner: string;
  resetManager: boolean;
  dryRun: boolean;
}

async function transferOwnership(
  { newOwner, resetManager, dryRun }: Args,
  hre: HardhatRuntimeEnvironment,
) {
  const owner = await getNamedSigner(hre, "owner");
  const authenticator = await getDeployedContract(
    "GPv2AllowListAuthentication",
    hre,
  );
  const proxy = proxyInterface(authenticator);

  console.log(`Using account ${owner.address}`);
  const currentOwner = await proxy.owner();
  if (owner.address !== currentOwner) {
    console.warn(`Account does NOT match current owner ${currentOwner}`);
    return;
  }

  if (resetManager) {
    console.log(
      `Setting new solver manager from ${await authenticator.manager()} to ${newOwner}`,
    );
  }
  console.log(`Transfering ownership from ${currentOwner} to ${newOwner}`);

  if (dryRun) {
    if (resetManager) {
      await authenticator.connect(owner).callStatic.setManager(newOwner);
    }
    await proxy.connect(owner).callStatic.transferOwnership(newOwner);
    console.log("Successfully simulated ownership transfer.");
  } else if (await prompt(hre, "Execute?")) {
    // Make sure to reset the manager BEFORE transferring ownership, or else
    // we will not be able to do it once we lose permissions.
    if (resetManager) {
      const setManager = await authenticator
        .connect(owner)
        .setManager(newOwner);
      console.log(transactionUrl(hre, setManager));
      await setManager.wait();
      console.log("Set new solver manager account.");
    }

    const setOwner = await proxy.connect(owner).transferOwnership(newOwner);
    console.log(transactionUrl(hre, setOwner));
    await setOwner.wait();
    console.log("Set new proxy owner account.");
  } else {
    console.log("Operation aborted.");
  }
}

const setupTransferOwnershipTask: () => void = () => {
  task(
    "transfer-ownership",
    "Transfer ownership of the GPv2 authenticator contract",
  )
    .addPositionalParam<string>(
      "newOwner",
      `The account to transfer ownership of the GPv2 authenticator to`,
    )
    .addFlag(
      "resetManager",
      "Additionally reset the manager account to the new owner.",
    )
    .addFlag(
      "dryRun",
      "Just simulate the transaction instead of executing on the blockchain.",
    )
    .setAction(transferOwnership);
};

export { setupTransferOwnershipTask };
