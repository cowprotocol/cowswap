import { encodeFunctionData, decodeAbiParameters, bytesToHex, toHex } from 'viem'
import type { Address, WalletClient, PublicClient, Hex } from 'viem'

import type { AbiInput, AbiItem, EIP712TypedData, ProviderConnector } from '@1inch/permit-signed-approvals-utils'

export class PermitProviderConnector implements ProviderConnector {
  constructor(
    private publicClient: PublicClient,
    private walletClient: WalletClient,
  ) {}

  contractEncodeABI(abi: AbiItem[], address: string | null, methodName: string, methodParams: unknown[]): Hex {
    const normalizedParams = methodParams.map((param) => {
      if (!(param instanceof Uint8Array)) {
        return param
      }
      return bytesToHex(param)
    })

    return encodeFunctionData({ abi, functionName: methodName, args: normalizedParams })
  }

  signTypedData(walletAddress: Address, typedData: EIP712TypedData, _typedDataHash: string): Promise<Hex> {
    // Removes `EIP712Domain` as it's already part of EIP712 (see https://ethereum.stackexchange.com/a/151930/55204)
    // and EthersJS complains when a type is not needed (see https://github.com/ethers-io/ethers.js/discussions/4000)
    const types = Object.fromEntries(Object.entries(typedData.types).filter(([type]) => type !== 'EIP712Domain'))

    // Use the wallet client's account if available (LocalAccount signs in-memory),
    // otherwise fall back to the address string (triggers RPC signing via the wallet).
    const account = this.walletClient.account ?? walletAddress

    return this.walletClient.signTypedData({
      account,
      domain: typedData.domain,
      types,
      primaryType: typedData.primaryType,
      message: typedData.message,
    })
  }

  ethCall(contractAddress: Address, callData: Hex): Promise<string> {
    return this.publicClient
      .call({
        to: contractAddress,
        data: callData,
      })
      .then(({ data }) => data || '0x')
  }

  decodeABIParameter<T>(type: string, hex: Hex): T {
    const [decoded] = decodeAbiParameters([{ type }], hex)

    return decoded as T
  }

  decodeABIParameters<T>(types: AbiInput[], hex: Hex): T {
    const decoded = decodeAbiParameters(types, hex)

    // ethers' result was a hybrid array/object — callers in 1inch utils destructure
    // by parameter name (eg `const { owner, spender } = decodeABIParameters(...)`).
    // viem's `decodeAbiParameters returns a plain tuple, so
    // destructuring by name yields undefined. Reconstruct the hybrid shape by keying
    // values under both numeric index and the ABI parameter name.
    //
    // Also: 1inch utils don't understand bigint (ethers used BigNumber), so we coerce
    // bigint values to hex strings — preserving the original viem-migration behavior.
    const result: Record<string | number, unknown> = {}
    types.forEach((input, i) => {
      const raw = decoded[i]
      const value = typeof raw === 'bigint' ? toHex(raw) : raw
      result[i] = value
      if (input.name) {
        result[input.name] = value
      }
    })
    return result as T
  }
}
