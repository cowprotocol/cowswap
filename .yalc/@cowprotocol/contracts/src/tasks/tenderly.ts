import "hardhat-deploy";
import "@nomiclabs/hardhat-ethers";
import "@tenderly/hardhat-tenderly";

import { Deployment } from "hardhat-deploy/types";
import { task } from "hardhat/config";

function separateProxiedContracts(allDeployments: Record<string, Deployment>): {
  proxied: string[];
  unproxied: string[];
} {
  const proxied = Object.entries(allDeployments)
    .filter(([, deployment]) => deployment.implementation !== undefined)
    .map(([name]) => name);

  const proxyRelatedDeployments = proxied
    .map((name) => [name, name + "_Implementation", name + "_Proxy"])
    .flat();
  const unproxied = Object.keys(allDeployments).filter(
    (name) => !proxyRelatedDeployments.includes(name),
  );

  return { proxied, unproxied };
}

const setupTenderlyTask: () => void = () => {
  task("tenderly", "Verifies smart contract code on Tenderly.").setAction(
    async (_, { deployments, tenderly }) => {
      const allDeployments = await deployments.all();
      const { proxied, unproxied } = separateProxiedContracts(allDeployments);

      const verificationInput = [];
      verificationInput.push(
        ...unproxied.map((name) => ({
          name,
          address: allDeployments[name].address,
        })),
      );
      verificationInput.push(
        ...proxied.map((name) => ({
          name,
          address: allDeployments[name + "_Implementation"].address,
        })),
      );

      // Note: the source code of the actual proxy is not verified. Supporting
      // it would require handling:
      // - code that not compiled in the project
      // - custom Solc versions in tenderly-verify

      await tenderly.verify(...verificationInput);
    },
  );
};

export { setupTenderlyTask };
