import { ethers, Contract } from "ethers";
/**
 * Balancer Vault partial ABI interface.
 *
 * This definition only contains the Vault methods that are used by GPv2 Vault
 * relayer. It is copied here to avoid relying on build artifacts.
 */
export declare const VAULT_INTERFACE: ethers.utils.Interface;
/**
 * Grants the required roles to the specified Vault relayer.
 *
 * This method is intended to be called by the Balancer Vault admin, and **not**
 * traders. It is included in the exported TypeScript library for completeness
 * and "documentation".
 *
 * @param authorizer The Vault authorizer contract that manages access.
 * @param vaultAddress The address to the Vault.
 * @param vaultRelayerAddress The address to the GPv2 Vault relayer contract.
 */
export declare function grantRequiredRoles(authorizer: Contract, vaultAddress: string, vaultRelayerAddress: string): Promise<void>;
