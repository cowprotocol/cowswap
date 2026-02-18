import { encodeFunctionData, decodeAbiParameters, bytesToHex } from 'viem'

import type { AbiInput, AbiItem, EIP712TypedData, ProviderConnector } from '@1inch/permit-signed-approvals-utils'
import type { Address, WalletClient, PublicClient, Hex } from 'viem'

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

    return this.walletClient.signTypedData({
      account: walletAddress,
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
    const decodedValues = decodeAbiParameters(types, hex)

    // Ethersjs decodes numbers as BigNumber instances
    // However, 1inch utils do not deal with BigNumber instances,
    // so we need this mess to convert them to hex strings, which 1inch understands
    // TODO: Any way to make this typing mess any cleaner?
    if (decodedValues && typeof decodedValues === 'object') {
      const copy: Record<string, unknown> = {}

      Object.entries(decodedValues).forEach(([key, value]) => {
        if (typeof value === 'bigint') {
          copy[key] = `0x${value.toString(16)}`
        } else {
          copy[key] = value
        }
      })

      return copy as T
    }

    return decodedValues
  }
}
