import { BytesLike, Signer } from "ethers";
import { Order } from "./order";
import { SignatureLike, TypedDataDomain } from "./types/ethers";
/**
 * Value returned by a call to `isValidSignature` if the signature was verified
 * successfully. The value is defined in the EIP-1271 standard as:
 * bytes4(keccak256("isValidSignature(bytes32,bytes)"))
 */
export declare const EIP1271_MAGICVALUE: string;
/**
 * Marker value indicating a presignature is set.
 */
export declare const PRE_SIGNED: string;
/**
 * The signing scheme used to sign the order.
 */
export declare enum SigningScheme {
    /**
     * The EIP-712 typed data signing scheme. This is the preferred scheme as it
     * provides more infomation to wallets performing the signature on the data
     * being signed.
     *
     * <https://github.com/ethereum/EIPs/blob/master/EIPS/eip-712.md#definition-of-domainseparator>
     */
    EIP712 = 0,
    /**
     * Message signed using eth_sign RPC call.
     */
    ETHSIGN = 1,
    /**
     * Smart contract signatures as defined in EIP-1271.
     *
     * <https://eips.ethereum.org/EIPS/eip-1271>
     */
    EIP1271 = 2,
    /**
     * Pre-signed order.
     */
    PRESIGN = 3
}
export declare type EcdsaSigningScheme = SigningScheme.EIP712 | SigningScheme.ETHSIGN;
/**
 * The signature of an order.
 */
export declare type Signature = EcdsaSignature | Eip1271Signature | PreSignSignature;
/**
 * ECDSA signature of an order.
 */
export interface EcdsaSignature {
    /**
     * The signing scheme used in the signature.
     */
    scheme: EcdsaSigningScheme;
    /**
     * The ECDSA signature.
     */
    data: SignatureLike;
}
/**
 * EIP-1271 signature data.
 */
export interface Eip1271SignatureData {
    /**
     * The verifying contract address.
     */
    verifier: string;
    /**
     * The arbitrary signature data used for verification.
     */
    signature: BytesLike;
}
/**
 * EIP-1271 signature of an order.
 */
export interface Eip1271Signature {
    /**
     * The signing scheme used in the signature.
     */
    scheme: SigningScheme.EIP1271;
    /**
     * The signature data.
     */
    data: Eip1271SignatureData;
}
/**
 * Signature data for a pre-signed order.
 */
export interface PreSignSignature {
    /**
     * The signing scheme used in the signature.
     */
    scheme: SigningScheme.PRESIGN;
    /**
     * The address of the signer.
     */
    data: string;
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
export declare function signOrder(domain: TypedDataDomain, order: Order, owner: Signer, scheme: EcdsaSigningScheme): Promise<EcdsaSignature>;
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
export declare function signOrderCancellation(domain: TypedDataDomain, orderUid: BytesLike, owner: Signer, scheme: EcdsaSigningScheme): Promise<EcdsaSignature>;
/**
 * Encodes the necessary data required for the Gnosis Protocol contracts to
 * verify an EIP-1271 signature.
 *
 * @param signature The EIP-1271 signature data to encode.
 */
export declare function encodeEip1271SignatureData({ verifier, signature, }: Eip1271SignatureData): string;
/**
 * Decodes a GPv2 EIP-1271-type signature into the actual EIP-1271 signature
 * and the verifier contract.
 *
 * @param signature The EIP-1271 signature data to decode.
 * @returns decodedSignature The decoded signature object, composed of an
 * EIP-1271 signature and a verifier.
 */
export declare function decodeEip1271SignatureData(signature: BytesLike): Eip1271SignatureData;
