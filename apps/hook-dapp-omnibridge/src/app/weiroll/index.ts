import { defaultAbiCoder } from '@ethersproject/abi'
import { keccak256 } from '@ethersproject/keccak256'
import { pack } from '@ethersproject/solidity'
import { toUtf8Bytes } from '@ethersproject/strings'

const ABI_CODER = defaultAbiCoder
// TODO: Add proper return type annotation
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export const fnSelector = (sig: string) => keccak256(toUtf8Bytes(sig)).slice(0, 10)

// TODO: Add proper return type annotation
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export const fnCalldata = (sig: string, encodedData: string) =>
  pack(['bytes4', 'bytes'], [fnSelector(sig), encodedData])

// see weiroll: https://github.com/weiroll/weiroll/blob/main/README.md

export enum CallType {
  DelegateCall,
  Call,
  StaticCall,
  CallWithValue,
}

export const END_OF_ARGS = 0xff

// encode command args for weiroll
// TODO: Add proper return type annotation
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export const encodeCommand = (selector: string, flags: number, input: bigint, output: number, target: string) => {
  return pack(['bytes4', 'uint8', 'uint48', 'uint8', 'address'], [selector, flags, input, output, target])
}

// calltype to number encoding
// TODO: Add proper return type annotation
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export const callTypeToNumber = (callType: CallType) => {
  switch (callType) {
    case CallType.DelegateCall:
      return 0
    case CallType.Call:
      return 1
    case CallType.StaticCall:
      return 2
    case CallType.CallWithValue:
      return 3
  }
}

// encode flag part of the weiroll command
// TODO: Add proper return type annotation
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export const encodeFlag = (isTuple: boolean, isExtendedCommand: boolean, callType: CallType) => {
  return (isTuple ? 0x80 : 0x00) | (isExtendedCommand ? 0x40 : 0x00) | callTypeToNumber(callType)
}

// encode the input part of the weiroll command
export const encodeInput = (a1: number, a2: number, a3: number, a4: number, a5: number, a6: number): bigint => {
  return BigInt(pack(['uint8', 'uint8', 'uint8', 'uint8', 'uint8', 'uint8'], [a1, a2, a3, a4, a5, a6]))
}

// encode individual input arg of the weiroll command inputs
export const encodeInputArg = (isFixed: boolean, idx: number): number => {
  return (isFixed ? 0x00 : 0x80) | idx
}

// encode the execute call for TestableVM weiroll instance
// TODO: Add proper return type annotation
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export const encodeWeirollExecuteCall = (commands: string[], state: string[]) => {
  return fnCalldata('execute(bytes32[],bytes[])', ABI_CODER.encode(['bytes32[]', 'bytes[]'], [commands, state]))
}
