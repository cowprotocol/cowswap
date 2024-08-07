/* Autogenerated file. Do not edit manually. */
/* tslint:disable */
/* eslint-disable */

import { Contract, Signer, utils } from 'ethers'
import type { Provider } from '@ethersproject/providers'
import type { SBCDepositContract, SBCDepositContractInterface } from '../SBCDepositContract'

const _abi = [
  {
    inputs: [
      {
        internalType: 'address',
        name: '_address',
        type: 'address',
      },
    ],
    name: 'claimWithdrawal',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: '',
        type: 'address',
      },
    ],
    name: 'withdrawableAmount',
    outputs: [
      {
        internalType: 'uint256',
        name: '',
        type: 'uint256',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
] as const

export class SBCDepositContract__factory {
  static readonly abi = _abi
  static createInterface(): SBCDepositContractInterface {
    return new utils.Interface(_abi) as SBCDepositContractInterface
  }
  static connect(address: string, signerOrProvider: Signer | Provider): SBCDepositContract {
    return new Contract(address, _abi, signerOrProvider) as SBCDepositContract
  }
}
