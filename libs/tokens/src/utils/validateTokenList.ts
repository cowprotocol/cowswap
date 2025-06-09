import { TokenInfo } from '@cowprotocol/types'
import type { TokenList } from '@uniswap/token-lists'

import type { Ajv, ValidateFunction } from 'ajv'

const SYMBOL_AND_NAME_VALIDATION = [
  {
    const: ''
  },
  {
    pattern: '^[^<>]+$'
  }
]

// TODO: Replace any with proper type definitions
// TODO: Add proper return type annotation
// eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/explicit-function-return-type
const patchValidationSchema = (schema: any) => ({
  ...schema,
  definitions: {
    ...schema.definitions,
    TokenInfo: {
      ...schema.definitions.TokenInfo,
      properties: {
        ...schema.definitions.TokenInfo.properties,
        symbol: {
          ...schema.definitions.TokenInfo.properties.symbol,
          maxLength: 80,
          anyOf: SYMBOL_AND_NAME_VALIDATION
        },
        name: {
          ...schema.definitions.TokenInfo.properties.name,
          maxLength: 100,
          anyOf: SYMBOL_AND_NAME_VALIDATION
        }
      }
    },
    ExtensionPrimitiveValue: {
      'anyOf': [{
        'type': 'string',
        'minLength': 1,
        'maxLength': 420,
        'examples': ['#00000']
      }, { 'type': 'boolean', 'examples': [true] }, { 'type': 'number', 'examples': [15] }, { 'type': 'null' }]
    }
  }
})

enum ValidationSchema {
  LIST = 'list',
  TOKENS = 'tokens',
}

const validator = new Promise<Ajv>((resolve) => {
  Promise.all([import('ajv'), import('@uniswap/token-lists/src/tokenlist.schema.json')]).then(([ajv, schema]) => {
    const validator = new ajv.default({ allErrors: true })
      .addSchema(patchValidationSchema(schema), ValidationSchema.LIST)
      // Adds a meta scheme of Pick<TokenList, 'tokens'>
      .addSchema(
        {
          ...patchValidationSchema(schema),
          $id: schema.$id + '#tokens',
          required: ['tokens']
        },
        ValidationSchema.TOKENS
      )
    resolve(validator)
  })
})

function getValidationErrors(validate: ValidateFunction | undefined): string {
  return (
    validate?.errors?.map((error) => [error.dataPath, error.message].filter(Boolean).join(' ')).join('; ') ??
    'unknown error'
  )
}

/**
 * Validates an array of tokens.
 * @param json the TokenInfo[] to validate
 */
export async function validateTokens(json: TokenInfo[]): Promise<TokenInfo[]> {
  const validate = (await validator).getSchema(ValidationSchema.TOKENS)
  if (validate?.({ tokens: json })) {
    return json
  }
  throw new Error(`Token list failed validation: ${getValidationErrors(validate)}`)
}

/**
 * Validates a token list.
 * @param json the TokenList to validate
 */
export async function validateTokenList(json: TokenList): Promise<TokenList> {
  const validate = (await validator).getSchema(ValidationSchema.LIST)
  if (validate?.(json)) {
    return json
  }
  throw new Error(`Token list failed validation: ${getValidationErrors(validate)}`)
}
