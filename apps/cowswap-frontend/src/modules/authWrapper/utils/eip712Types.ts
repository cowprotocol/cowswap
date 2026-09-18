import type { TypedDataField, TypedDataTypes } from '../authWrapper.types'

export class AuthWrapperConfigError extends Error {}

/** Trailing `[]` / `[3]` groups of an EIP-712 type reference. */
const ARRAY_SUFFIX_REGEX = /(\[\d*\])+$/

/** A valid Solidity/EIP-712 identifier, used for struct names and field names. */
const IDENTIFIER_REGEX = /^[A-Za-z_$][A-Za-z0-9_$]*$/

/** Strips array suffixes so `Foo[2][]` resolves to the struct `Foo`. */
export function baseTypeOf(type: string): string {
  return type.replace(ARRAY_SUFFIX_REGEX, '')
}

/**
 * Renders one struct definition exactly as EIP-712 `encodeType` does, e.g.
 * `WrapperParams(address target,uint128 amount,string label)`.
 */
export function encodeStructDefinition(name: string, fields: readonly TypedDataField[]): string {
  return `${name}(${fields.map((field) => `${field.type} ${field.name}`).join(',')})`
}

export function isValidIdentifier(value: string): boolean {
  return IDENTIFIER_REGEX.test(value)
}

/**
 * Every elementary EIP-712 type. Anything outside this set is a struct reference and
 * must be defined in `types` — resolving "unknown" to "primitive" instead would let a
 * typo'd struct name (or a bare `uint` alias, which EIP-712 does not permit) slip into
 * the type string, producing a digest the wrapper cannot reproduce on-chain.
 */
const PRIMITIVE_TYPES: ReadonlySet<string> = new Set([
  'address',
  'bool',
  'string',
  'bytes',
  ...Array.from({ length: 32 }, (_, index) => `bytes${index + 1}`),
  ...Array.from({ length: 32 }, (_, index) => (index + 1) * 8).flatMap((bits) => [`uint${bits}`, `int${bits}`]),
])

/**
 * Collects the struct names reachable from `rootType`, excluding the root itself.
 *
 * @throws AuthWrapperConfigError if a referenced struct is not defined.
 */
export function collectReferencedTypes(rootType: string, types: TypedDataTypes): string[] {
  const visited = new Set<string>()
  const queue = [rootType]

  while (queue.length > 0) {
    // Guarded by `queue.length`, so the shift always yields a value.
    const current = queue.shift() as string
    const fields = types[current]

    if (!fields) {
      throw new AuthWrapperConfigError(
        `Type "${current}" is not a supported EIP-712 type and is not defined in "types".`,
      )
    }

    for (const field of fields) {
      const base = baseTypeOf(field.type)

      if (isPrimitiveType(field.type) || visited.has(base) || base === rootType) continue

      visited.add(base)
      queue.push(base)
    }
  }

  return [...visited]
}

export function isPrimitiveType(type: string): boolean {
  return PRIMITIVE_TYPES.has(baseTypeOf(type))
}
