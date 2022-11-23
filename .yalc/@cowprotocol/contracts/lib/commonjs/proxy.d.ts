import { Contract, ethers } from "ethers";
/**
 * Returns the address of the implementation of an EIP-1967-compatible proxy
 * from its address.
 *
 * @param proxy Address of the proxy contract.
 * @returns The address of the contract storing the proxy implementation.
 */
export declare function implementationAddress(provider: ethers.providers.Provider, proxy: string): Promise<string>;
/**
 * Returns the address of the implementation of an EIP-1967-compatible proxy
 * from its address.
 *
 * @param proxy Address of the proxy contract.
 * @returns The address of the administrator of the proxy.
 */
export declare function ownerAddress(provider: ethers.providers.Provider, proxy: string): Promise<string>;
/**
 * EIP-173 proxy ABI in "human-readable ABI" format. The proxy used by the
 * deployment plugin implements this interface, and copying it here avoids
 * pulling in `hardhat` as a dependency for just this ABI.
 *
 * <https://eips.ethereum.org/EIPS/eip-173#specification>
 */
export declare const EIP173_PROXY_ABI: string[];
/**
 * Returns the proxy interface for the specified address.
 *
 * @param contract The proxy contract to return a proxy interface for.
 * @returns A Ethers.js contract instance for interacting with the proxy.
 */
export declare function proxyInterface(contract: Contract): Contract;
