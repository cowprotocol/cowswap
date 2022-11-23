import { utils } from "ethers";

/**
 * The salt used when deterministically deploying smart contracts.
 */
export const SALT = utils.formatBytes32String("Mattresses in Berlin!");

/**
 * The contract used to deploy contracts deterministically with CREATE2.
 * The address is chosen by the hardhat-deploy library.
 * It is the same in any EVM-based network.
 *
 * https://github.com/Arachnid/deterministic-deployment-proxy
 */
export const DEPLOYER_CONTRACT = "0x4e59b44847b379578588920ca78fbf26c0b4956c";

/**
 * Dictionary containing all deployed contract names.
 */
export const CONTRACT_NAMES = {
  authenticator: "GPv2AllowListAuthentication",
  settlement: "GPv2Settlement",
  tradeSimulator: "GPv2TradeSimulator",
} as const;

/**
 * The name of a deployed contract.
 */
export type ContractName = typeof CONTRACT_NAMES[keyof typeof CONTRACT_NAMES];

/**
 * The deployment args for a contract.
 */
export type DeploymentArguments<T> =
  T extends typeof CONTRACT_NAMES.authenticator
    ? never
    : T extends typeof CONTRACT_NAMES.settlement
    ? [string, string]
    : T extends typeof CONTRACT_NAMES.tradeSimulator
    ? []
    : unknown[];

/**
 * Allowed ABI definition types by Ethers.js.
 */
export type Abi = ConstructorParameters<typeof utils.Interface>[0];

/**
 * Artifact information important for computing deterministic deployments.
 */
export interface ArtifactDeployment {
  abi: Abi;
  bytecode: string;
}

/**
 * An artifact with a contract name matching one of the deterministically
 * deployed contracts.
 */
export interface NamedArtifactDeployment<C extends ContractName>
  extends ArtifactDeployment {
  contractName: C;
}

type MaybeNamedArtifactArtifactDeployment<C> = C extends ContractName
  ? NamedArtifactDeployment<C>
  : ArtifactDeployment;

/**
 * Computes the deterministic address at which the contract will be deployed.
 * This address does not depend on which network the contract is deployed to.
 *
 * @param contractName Name of the contract for which to find the address.
 * @param deploymentArguments Extra arguments that are necessary to deploy.
 * @returns The address that is expected to store the deployed code.
 */
export function deterministicDeploymentAddress<C>(
  { abi, bytecode }: MaybeNamedArtifactArtifactDeployment<C>,
  deploymentArguments: DeploymentArguments<C>,
): string {
  const contractInterface = new utils.Interface(abi);
  const deployData = utils.hexConcat([
    bytecode,
    contractInterface.encodeDeploy(deploymentArguments),
  ]);

  return utils.getCreate2Address(
    DEPLOYER_CONTRACT,
    SALT,
    utils.keccak256(deployData),
  );
}
