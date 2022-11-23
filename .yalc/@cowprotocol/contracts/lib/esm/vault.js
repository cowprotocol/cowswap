var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { ethers } from "ethers";
/**
 * Balancer Vault partial ABI interface.
 *
 * This definition only contains the Vault methods that are used by GPv2 Vault
 * relayer. It is copied here to avoid relying on build artifacts.
 */
export const VAULT_INTERFACE = new ethers.utils.Interface([
    "function manageUserBalance((uint8, address, uint256, address, address)[])",
    "function batchSwap(uint8, (bytes32, uint256, uint256, uint256, bytes)[], address[], (address, bool, address, bool), int256[], uint256)",
]);
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
export function grantRequiredRoles(authorizer, vaultAddress, vaultRelayerAddress) {
    return __awaiter(this, void 0, void 0, function* () {
        for (const name in VAULT_INTERFACE.functions) {
            yield authorizer.grantRole(ethers.utils.solidityKeccak256(["uint256", "bytes4"], [vaultAddress, VAULT_INTERFACE.getSighash(name)]), vaultRelayerAddress);
        }
    });
}
//# sourceMappingURL=vault.js.map