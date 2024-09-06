export interface ICoWShedOptions {
  factoryAddress: string
  proxyCreationCode?: string
  implementationAddress: string
}

export interface ICoWShedCall {
  target: string
  value: bigint
  callData: string
  allowFailure: boolean
  isDelegateCall: boolean
}

export interface ICoWShedOptions {
  factoryAddress: string
  proxyCreationCode?: string
  implementationAddress: string
}

export const DOMAIN_TYPE = {
  EIP712Domain: [
    { type: 'string', name: 'name' },
    { type: 'string', name: 'version' },
    { type: 'uint256', name: 'chainId' },
    { type: 'address', name: 'verifyingContract' },
  ],
}

export const COW_SHED_712_TYPES = {
  ExecuteHooks: [
    { type: 'Call[]', name: 'calls' },
    { type: 'bytes32', name: 'nonce' },
    { type: 'uint256', name: 'deadline' },
  ],
  Call: [
    { type: 'address', name: 'target' },
    { type: 'uint256', name: 'value' },
    { type: 'bytes', name: 'callData' },
    { type: 'bool', name: 'allowFailure' },
    { type: 'bool', name: 'isDelegateCall' },
  ],
}
