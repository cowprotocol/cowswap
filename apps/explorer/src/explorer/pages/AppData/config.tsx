import React, { RefObject } from 'react'

import { LATEST_APP_DATA_VERSION } from '@cowprotocol/cow-sdk'

import Form, { AjvError, FieldProps, FormValidation } from '@rjsf/core'
import { JSONSchema7 } from 'json-schema'

import { HelpTooltip } from '../../../components/Tooltip'
import { metadataApiSDK } from '../../../cowSdk'

const ERROR_MESSAGES = {
  REQUIRED: 'Required field.',
  INVALID_ADDRESS: 'This is not an address.',
  ONLY_DIGITS: 'Only digits are allowed.',
  INVALID_APPDATA: 'This is not a valid AppData hash.',
}

export const INITIAL_FORM_VALUES = {
  version: LATEST_APP_DATA_VERSION,
  metadata: {},
}

// TODO: Replace any with proper type definitions
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type FormProps = Record<string, any>

export const getSchema = async (): Promise<JSONSchema7> => {
  const latestSchema = (await metadataApiSDK
    .getAppDataSchema(LATEST_APP_DATA_VERSION)
    // TODO: Replace any with proper type definitions
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    .then((m) => (m as any).default)) as JSONSchema7

  const schemaCopy = makeSchemaCopy(latestSchema)
  return normalizePartnerFeeRefs(schemaCopy)
}

const makeSchemaCopy = (schema: JSONSchema7): JSONSchema7 => structuredClone(schema)

const PARTNER_FEE_REF_PREFIX = '#/properties/metadata/properties/partnerFee/definitions/'

const normalizePartnerFeeRefs = (schema: JSONSchema7): JSONSchema7 => {
  const metadata = schema.properties?.metadata
  if (!metadata || typeof metadata !== 'object') {
    return schema
  }

  const partnerFee = (metadata as JSONSchema7).properties?.partnerFee
  if (!partnerFee || typeof partnerFee !== 'object') {
    return schema
  }

  const partnerFeeDefinitions = (partnerFee as JSONSchema7).definitions as Record<string, JSONSchema7> | undefined
  const hoistedDefinitionKeys = new Set<string>()

  if (partnerFeeDefinitions && typeof partnerFeeDefinitions === 'object') {
    const rootDefinitions = (schema.definitions ?? {}) as Record<string, JSONSchema7>

    Object.entries(partnerFeeDefinitions).forEach(([key, value]) => {
      if (!(key in rootDefinitions)) {
        rootDefinitions[key] = value
        hoistedDefinitionKeys.add(key)
      }
    })

    schema.definitions = rootDefinitions
  }

  const rewriteRefs = (node: unknown): void => {
    if (!node || typeof node !== 'object') return

    if (Array.isArray(node)) {
      node.forEach(rewriteRefs)
      return
    }

    const record = node as Record<string, unknown>
    if (typeof record.$ref === 'string' && record.$ref.startsWith(PARTNER_FEE_REF_PREFIX)) {
      const definitionKey = record.$ref.slice(PARTNER_FEE_REF_PREFIX.length)
      if (hoistedDefinitionKeys.has(definitionKey)) {
        record.$ref = `#/definitions/${definitionKey}`
      }
    }

    Object.values(record).forEach(rewriteRefs)
  }

  rewriteRefs(schema)
  return schema
}

export const transformErrors = (errors: AjvError[]): AjvError[] => {
  return errors.reduce<AjvError[]>((errorsList, error) => {
    if (error.name === 'required') {
      // Disable the non-required fields (it validates the required fields on un-required fields)
      // error.message = ERROR_MESSAGES.REQUIRED
      return errorsList
    }

    // Filter out confusing oneOf errors from partnerFee
    if (error.property.includes('.metadata.partnerFee')) {
      // Only show oneOf errors if there's actually data in the field
      if (error.name === 'oneOf') {
        return errorsList
      }
      // Filter out "additionalProperties" errors from nested oneOf schemas
      if (error.name === 'additionalProperties') {
        return errorsList
      }

      // Filter out type errors from nested oneOf schemas
      if (error.name === 'type') {
        return errorsList
      }
    }

    if (error.property === '.metadata.referrer.address') {
      error.message = ERROR_MESSAGES.INVALID_ADDRESS
    }

    if (error.property === '.metadata.quote.slippageBips') {
      error.message = ERROR_MESSAGES.ONLY_DIGITS
    }

    if (error.property === '.appData') {
      error.message = ERROR_MESSAGES.INVALID_APPDATA
    }

    if (errorsList.some((e) => e.property === error.property)) {
      return errorsList
    }

    return [...errorsList, error]
  }, [])
}

export const handleErrors = (
  ref: RefObject<Form<FormProps> | null>,
  errors: FormValidation,
  handler: (value: boolean) => void,
): FormValidation => {
  if (!ref.current) return errors
  const { errors: formErrors } = ref.current?.state as FormProps
  handler(Array.isArray(formErrors) && formErrors?.length > 0)
  return errors
}

export const decodeAppDataSchema: JSONSchema7 = {
  type: 'object',
  title: 'AppData Decode',
  description: 'Decode a text file document from AppData hash.',
  required: ['appData'],
  properties: {
    appData: {
      type: 'string',
      title: 'AppData Hex',
      pattern: '^0x[a-fA-F0-9]{64}',
    },
  },
}

export const CustomField = (props: FieldProps): React.ReactElement => {
  const { schema, onChange, readonly, required, formData, idSchema, uiSchema } = props
  return (
    <div className="form-group field field-string">
      <div className="title-container">
        <label className="control-label" htmlFor={idSchema.$id}>
          {schema.title}
          {required && '*'}&nbsp;
        </label>
        {uiSchema.tooltip && <HelpTooltip tooltip={uiSchema.tooltip} />}
      </div>
      <p id={`${idSchema.$id}__description`} className="field-description">
        {schema.description}
      </p>
      <input
        required={required}
        readOnly={readonly}
        defaultValue={formData}
        onChange={(event): void => onChange(event.target.value || undefined)}
        className="form-control"
        id={idSchema.$id}
        type="text"
      />
    </div>
  )
}

export const uiSchema = {
  environment: {
    'ui:field': 'cField',
    tooltip: 'Select the environment to use. E.g: development, staging, production.',
  },
  version: {
    'ui:field': 'cField',
    tooltip: 'The schema will be versioned using Semantic Versioning.',
  },
  appCode: {
    'ui:field': 'cField',
    tooltip: 'The code identifying the CLI, UI, service generating the order.',
  },
  metadata: {
    referrer: {
      address: {
        'ui:field': 'cField',
        tooltip: 'Add a valid address to enable referrer.',
      },
    },
    quote: {
      slippageBips: {
        'ui:field': 'cField',
        tooltip: 'Set the slippage in BPS (e.g. 50).',
      },
    },
  },
}
