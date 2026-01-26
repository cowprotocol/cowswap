import { JSONSchema7 } from 'json-schema'

import { metadataApiSDK } from '../../cowSdk'
import { getSchema } from '../../explorer/pages/AppData/config'

jest.mock('../../cowSdk', () => ({
  metadataApiSDK: {
    getAppDataSchema: jest.fn(),
  },
}))

const mockedMetadataApiSDK = metadataApiSDK as jest.Mocked<typeof metadataApiSDK>

describe('normalizePartnerFeeRefs', () => {
  beforeAll(() => {
    if (typeof globalThis.structuredClone !== 'function') {
      globalThis.structuredClone = (value: unknown) => JSON.parse(JSON.stringify(value))
    }
  })

  beforeEach(() => {
    mockedMetadataApiSDK.getAppDataSchema.mockReset()
  })

  it('adds missing partnerFee definitions to the root', async () => {
    const schema: JSONSchema7 = {
      type: 'object',
      properties: {
        metadata: {
          type: 'object',
          properties: {
            partnerFee: {
              type: 'object',
              definitions: {
                recipient: {
                  type: 'string',
                  pattern: '^partner$',
                },
              },
              properties: {
                recipient: {
                  $ref: '#/properties/metadata/properties/partnerFee/definitions/recipient',
                },
              },
            },
          },
        },
      },
    }

    mockedMetadataApiSDK.getAppDataSchema.mockResolvedValue({ default: schema } as unknown as Awaited<
      ReturnType<typeof metadataApiSDK.getAppDataSchema>
    >)

    const normalized = await getSchema()
    const normalizedRecipient = normalized.definitions?.recipient as JSONSchema7

    const metadata = normalized.properties?.metadata as JSONSchema7 | undefined
    const partnerFee = metadata?.properties?.partnerFee as JSONSchema7 | undefined

    expect(normalizedRecipient.pattern).toBe('^partner$')
    const recipientSchema = partnerFee?.properties?.recipient as JSONSchema7 | undefined
    expect(recipientSchema?.$ref).toBe('#/definitions/recipient')
  })

  it('does not override existing root definitions', async () => {
    const schema: JSONSchema7 = {
      type: 'object',
      properties: {
        metadata: {
          type: 'object',
          properties: {
            partnerFee: {
              type: 'object',
              definitions: {
                recipient: {
                  type: 'string',
                  pattern: '^partner$',
                },
              },
              properties: {
                recipient: {
                  $ref: '#/properties/metadata/properties/partnerFee/definitions/recipient',
                },
              },
            },
          },
        },
      },
      definitions: {
        recipient: {
          type: 'string',
          pattern: '^root$',
        },
      },
    }

    mockedMetadataApiSDK.getAppDataSchema.mockResolvedValue({ default: schema } as unknown as Awaited<
      ReturnType<typeof metadataApiSDK.getAppDataSchema>
    >)

    const normalized = await getSchema()
    const normalizedRecipient = normalized.definitions?.recipient as JSONSchema7

    expect(normalizedRecipient.pattern).toBe('^root$')
  })
})
