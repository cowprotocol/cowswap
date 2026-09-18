import { encodeAbiParameters, type AbiParameter, type Hex } from 'viem'

import { baseTypeOf } from './eip712Types'

import type { ResolvedAuthWrapper, TypedDataTypes } from '../authWrapper.types'

/**
 * ABI-encodes the wrapper's params the way the contract decodes them, i.e.
 * `abi.encode(WrapperParams)` — a single tuple argument.
 *
 * This is the tail of the on-chain `wrapperData` blob
 * (`nestedAppData ‖ orderData ‖ signature ‖ params`), so it is what a solver
 * splices in after the authorization signature.
 */
export function encodeWrapperParams(wrapper: ResolvedAuthWrapper): Hex {
  const parameter = toAbiParameter(wrapper.config.paramsType, wrapper.config.paramsType, wrapper.paramsTypes)

  return encodeAbiParameters([parameter], [wrapper.config.params])
}

/**
 * Translates an EIP-712 type reference into its ABI equivalent. The two grammars
 * agree on every primitive; they differ only in that EIP-712 names a struct while
 * the ABI spells it as a `tuple` with components. Array suffixes carry over as-is.
 */
function toAbiParameter(name: string, type: string, types: TypedDataTypes): AbiParameter {
  const base = baseTypeOf(type)
  const structFields = types[base]

  if (!structFields) {
    return { name, type }
  }

  return {
    name,
    type: `tuple${type.slice(base.length)}`,
    components: structFields.map((field) => toAbiParameter(field.name, field.type, types)),
  }
}
