import { getAddress, keccak256, toHex, type Address, type Hex } from 'viem'

import { normalizeError } from '@cowprotocol/common-utils'

import { computeOrderAppData } from './computeOrderAppData'
import {
  AuthWrapperConfigError,
  collectReferencedTypes,
  encodeStructDefinition,
  isValidIdentifier,
} from './eip712Types'
import { encodeWrapperParams } from './encodeWrapperParams'

import {
  NESTED_APP_DATA_FIELD,
  RESERVED_TYPE_NAMES,
  WRAPPER_AND_APP_DATA_TYPE,
  WRAPPER_ORDER_TYPE,
  WRAPPER_ORDER_TYPE_FIELDS,
} from '../authWrapper.constants'

import type { CowAuthWrapperConfig, ResolvedAuthWrapper, TypedDataTypes } from '../authWrapper.types'

export {
  AuthWrapperConfigError,
  baseTypeOf,
  collectReferencedTypes,
  encodeStructDefinition,
  isPrimitiveType,
} from './eip712Types'

/** Placeholder nested app-data hash, used only to prove the params encode. */
const ZERO_HASH: Hex = `0x${'00'.repeat(32)}`

/**
 * Builds `WRAPPER_AND_APP_DATA_TYPE_HASH` the way `CowAuthWrapper`'s constructor does:
 * `keccak256(wrapperStructDef ‖ referencedTypeDefs)`, with the referenced defs in
 * canonical (alphabetical) order.
 *
 * This hash is canonical for any struct naming, because EIP-712 `encodeType` always
 * emits the primary type first and `WrapperAndAppData` is the primary type here. The
 * naming constraint applies only to the *order* type hash — see
 * `assertCanonicalOrderTypeOrdering`.
 */
export function buildWrapperAndAppDataType(config: CowAuthWrapperConfig): {
  wrapperAndAppDataTypeHash: Hex
  referencedTypes: string[]
} {
  const { types, paramsType, paramsField } = config

  const referencedTypes = [paramsType, ...collectReferencedTypes(paramsType, types)].sort()

  const wrapperStructDef = encodeStructDefinition(WRAPPER_AND_APP_DATA_TYPE, [
    { name: NESTED_APP_DATA_FIELD, type: 'bytes32' },
    { name: paramsField, type: paramsType },
  ])

  const referencedTypeDefs = referencedTypes.map((name) => encodeStructDefinition(name, types[name])).join('')

  return {
    wrapperAndAppDataTypeHash: keccak256(toHex(`${wrapperStructDef}${referencedTypeDefs}`)),
    referencedTypes,
  }
}

/**
 * Validates an integrator-supplied wrapper config and derives everything the signing
 * and posting steps need.
 *
 * @throws AuthWrapperConfigError with a message safe to surface to the integrator.
 */
export function resolveAuthWrapper(config: CowAuthWrapperConfig): ResolvedAuthWrapper {
  assertValidNames(config)
  assertValidTypeDefinitions(config.types)

  const { wrapperAndAppDataTypeHash, referencedTypes } = buildWrapperAndAppDataType(config)

  assertCanonicalOrderTypeOrdering(referencedTypes)

  const paramsTypes: TypedDataTypes = Object.fromEntries(
    [config.paramsType, ...collectReferencedTypes(config.paramsType, config.types)].map((name) => [
      name,
      config.types[name],
    ]),
  )

  const orderTypes: TypedDataTypes = {
    ...paramsTypes,
    [WRAPPER_ORDER_TYPE]: [...WRAPPER_ORDER_TYPE_FIELDS],
    [WRAPPER_AND_APP_DATA_TYPE]: [
      { name: NESTED_APP_DATA_FIELD, type: 'bytes32' },
      { name: config.paramsField, type: config.paramsType },
    ],
  }

  const wrapper: ResolvedAuthWrapper = {
    config,
    address: toWrapperAddress(config.address),
    wrapperAndAppDataTypeHash,
    orderTypes,
    paramsTypes,
  }

  assertParamsEncodable(wrapper)

  return wrapper
}

/**
 * Rejects params structs whose names would make the contract's *order* type hash
 * non-canonical.
 *
 * `CowAuthWrapper`'s constructor builds it as
 * `ORDER_TYPE_STRING ‖ referencedTypeDefs ‖ wrapperStructDef`, i.e. it assumes every
 * struct the params reference sorts alphabetically before `"WrapperAndAppData"`.
 * EIP-712 `encodeType` — and therefore every wallet's `eth_signTypedData_v4` — sorts
 * the whole referenced set instead. The two agree only under that assumption.
 *
 * When they disagree the wallet signs a digest the wrapper will never recompute, so the
 * order simply cannot settle; and because `ECDSA.recoverCalldata` recovers over the raw
 * digest there is no safe fallback (signing an unprefixed hash needs the deprecated
 * `eth_sign`). Rejecting up front is the only correct behaviour.
 *
 * NOTE: the `BasicAuthWrapper` example in `bundles-template` names its struct
 * `WrapperParams`, which sorts AFTER `"WrapperAndAppData"` and so trips this check. The
 * base contract's own docs use `MetaOrder` / `SafeTx`, which do not.
 */
function assertCanonicalOrderTypeOrdering(referencedTypes: readonly string[]): void {
  const outOfOrder = referencedTypes.filter((name) => name >= WRAPPER_AND_APP_DATA_TYPE)

  if (outOfOrder.length === 0) return

  throw new AuthWrapperConfigError(
    `Struct name(s) ${outOfOrder.map((name) => `"${name}"`).join(', ')} must sort alphabetically before ` +
      `"${WRAPPER_AND_APP_DATA_TYPE}". Rename them so the wrapper's EIP-712 order type hash stays canonical ` +
      `and a wallet can sign it as structured data.`,
  )
}

/**
 * Proves the supplied `params` actually hash and ABI-encode against the declared types.
 *
 * Checking the type definitions alone is not enough: a missing or malformed value (an
 * address that is not an address, an absent field) only fails inside viem, which
 * otherwise happens at the moment the user clicks trade. Doing it here turns that into
 * an integrator-facing config error surfaced before the widget ever loads.
 */
function assertParamsEncodable(wrapper: ResolvedAuthWrapper): void {
  try {
    computeOrderAppData(wrapper, ZERO_HASH)
    encodeWrapperParams(wrapper)
  } catch (err: unknown) {
    const error = normalizeError(err)

    throw new AuthWrapperConfigError(`"params" do not match the declared "types": ${error.message}`)
  }
}

/** Checks the config's own identifiers, before any struct is looked at. */
function assertValidNames(config: CowAuthWrapperConfig): void {
  const { types, paramsType, paramsField } = config

  if (!isValidIdentifier(paramsType)) {
    throw new AuthWrapperConfigError(`"paramsType" must be a valid struct name, got "${paramsType}".`)
  }

  if (!isValidIdentifier(paramsField)) {
    throw new AuthWrapperConfigError(`"paramsField" must be a valid field name, got "${paramsField}".`)
  }

  if (paramsField === NESTED_APP_DATA_FIELD) {
    throw new AuthWrapperConfigError(`"paramsField" must not be "${NESTED_APP_DATA_FIELD}", which is reserved.`)
  }

  const reserved = RESERVED_TYPE_NAMES.find((name) => types[name])

  if (reserved) {
    throw new AuthWrapperConfigError(`"types" must not redefine the reserved struct "${reserved}".`)
  }

  if (!types[paramsType]) {
    throw new AuthWrapperConfigError(`"types" must define the params struct "${paramsType}".`)
  }
}

/** Checks every declared struct is well-formed, independent of which one is the root. */
function assertValidTypeDefinitions(types: CowAuthWrapperConfig['types']): void {
  for (const [name, fields] of Object.entries(types)) {
    if (!isValidIdentifier(name)) {
      throw new AuthWrapperConfigError(`"${name}" is not a valid struct name.`)
    }

    if (!Array.isArray(fields) || fields.length === 0) {
      throw new AuthWrapperConfigError(`Struct "${name}" must declare at least one field.`)
    }

    const invalidField = fields.find(
      (field) => !field || !isValidIdentifier(field.name) || typeof field.type !== 'string' || field.type.length === 0,
    )

    if (invalidField) {
      throw new AuthWrapperConfigError(`Struct "${name}" has an invalid field definition.`)
    }
  }
}

function toWrapperAddress(address: string): Address {
  try {
    return getAddress(address)
  } catch {
    throw new AuthWrapperConfigError(`"address" is not a valid address: "${address}".`)
  }
}
