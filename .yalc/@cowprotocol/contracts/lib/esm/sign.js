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
import { ORDER_TYPE_FIELDS, CANCELLATION_TYPE_FIELDS, normalizeOrder, hashTypedData, } from "./order";
import { isTypedDataSigner, } from "./types/ethers";
/**
 * Value returned by a call to `isValidSignature` if the signature was verified
 * successfully. The value is defined in the EIP-1271 standard as:
 * bytes4(keccak256("isValidSignature(bytes32,bytes)"))
 */
export const EIP1271_MAGICVALUE = ethers.utils.hexDataSlice(ethers.utils.id("isValidSignature(bytes32,bytes)"), 0, 4);
/**
 * Marker value indicating a presignature is set.
 */
export const PRE_SIGNED = ethers.utils.id("GPv2Signing.Scheme.PreSign");
/**
 * The signing scheme used to sign the order.
 */
export var SigningScheme;
(function (SigningScheme) {
    /**
     * The EIP-712 typed data signing scheme. This is the preferred scheme as it
     * provides more infomation to wallets performing the signature on the data
     * being signed.
     *
     * <https://github.com/ethereum/EIPs/blob/master/EIPS/eip-712.md#definition-of-domainseparator>
     */
    SigningScheme[SigningScheme["EIP712"] = 0] = "EIP712";
    /**
     * Message signed using eth_sign RPC call.
     */
    SigningScheme[SigningScheme["ETHSIGN"] = 1] = "ETHSIGN";
    /**
     * Smart contract signatures as defined in EIP-1271.
     *
     * <https://eips.ethereum.org/EIPS/eip-1271>
     */
    SigningScheme[SigningScheme["EIP1271"] = 2] = "EIP1271";
    /**
     * Pre-signed order.
     */
    SigningScheme[SigningScheme["PRESIGN"] = 3] = "PRESIGN";
})(SigningScheme || (SigningScheme = {}));
function ecdsaSignTypedData(scheme, owner, domain, types, data) {
    return __awaiter(this, void 0, void 0, function* () {
        let signature = null;
        switch (scheme) {
            case SigningScheme.EIP712:
                if (!isTypedDataSigner(owner)) {
                    throw new Error("signer does not support signing typed data");
                }
                signature = yield owner._signTypedData(domain, types, data);
                break;
            case SigningScheme.ETHSIGN:
                signature = yield owner.signMessage(ethers.utils.arrayify(hashTypedData(domain, types, data)));
                break;
            default:
                throw new Error("invalid signing scheme");
        }
        // Passing the signature through split/join to normalize the `v` byte.
        // Some wallets do not pad it with `27`, which causes a signature failure
        // `splitSignature` pads it if needed, and `joinSignature` simply puts it back together
        return ethers.utils.joinSignature(ethers.utils.splitSignature(signature));
    });
}
/**
 * Returns the signature for the specified order with the signing scheme encoded
 * into the signature.
 *
 * @param domain The domain to sign the order for. This is used by the smart
 * contract to ensure orders can't be replayed across different applications,
 * but also different deployments (as the contract chain ID and address are
 * mixed into to the domain value).
 * @param order The order to sign.
 * @param owner The owner for the order used to sign.
 * @param scheme The signing scheme to use. See {@link SigningScheme} for more
 * details.
 * @return Encoded signature including signing scheme for the order.
 */
export function signOrder(domain, order, owner, scheme) {
    return __awaiter(this, void 0, void 0, function* () {
        return {
            scheme,
            data: yield ecdsaSignTypedData(scheme, owner, domain, { Order: ORDER_TYPE_FIELDS }, normalizeOrder(order)),
        };
    });
}
/**
 * Returns the signature for the Order Cancellation with the signing scheme encoded
 * into the signature.
 *
 * @param domain The domain to sign the cancellation.
 * @param orderUid The unique identifier of the order being cancelled.
 * @param owner The owner for the order used to sign.
 * @param scheme The signing scheme to use. See {@link SigningScheme} for more
 * details.
 * @return Encoded signature including signing scheme for the cancellation.
 */
export function signOrderCancellation(domain, orderUid, owner, scheme) {
    return __awaiter(this, void 0, void 0, function* () {
        return {
            scheme,
            data: yield ecdsaSignTypedData(scheme, owner, domain, { OrderCancellation: CANCELLATION_TYPE_FIELDS }, { orderUid }),
        };
    });
}
/**
 * Encodes the necessary data required for the Gnosis Protocol contracts to
 * verify an EIP-1271 signature.
 *
 * @param signature The EIP-1271 signature data to encode.
 */
export function encodeEip1271SignatureData({ verifier, signature, }) {
    return ethers.utils.solidityPack(["address", "bytes"], [verifier, signature]);
}
/**
 * Decodes a GPv2 EIP-1271-type signature into the actual EIP-1271 signature
 * and the verifier contract.
 *
 * @param signature The EIP-1271 signature data to decode.
 * @returns decodedSignature The decoded signature object, composed of an
 * EIP-1271 signature and a verifier.
 */
export function decodeEip1271SignatureData(signature) {
    const arrayifiedSignature = ethers.utils.arrayify(signature);
    const verifier = ethers.utils.getAddress(ethers.utils.hexlify(arrayifiedSignature.slice(0, 20)));
    return {
        verifier,
        signature: arrayifiedSignature.slice(20),
    };
}
//# sourceMappingURL=sign.js.map