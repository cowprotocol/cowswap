import React, { RefObject } from 'react'
import Form, { AjvError, FieldProps, FormValidation } from '@rjsf/core'
import { LATEST_APP_DATA_VERSION } from '@cowprotocol/app-data'
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

// export const INVALID_IPFS_CREDENTIALS = [
//   'Type error',
//   "Failed to execute 'setRequestHeader' on 'XMLHttpRequest': String contains non ISO-8859-1 code point.",
// ]

export type FormProps = Record<string, unknown>

export const getSchema = async (): Promise<JSONSchema7> => {
  const latestSchema = (await metadataApiSDK.getAppDataSchema(LATEST_APP_DATA_VERSION)) as JSONSchema7

  return makeSchemaCopy(latestSchema)
}

const makeSchemaCopy = (schema: JSONSchema7): JSONSchema7 => structuredClone(schema)

export const transformErrors = (errors: AjvError[]): AjvError[] => {
  return errors.reduce<AjvError[]>((errorsList, error) => {
    if (error.name === 'required') {
      // Disable the non-required fields (it validates the required fields on un-required fields)
      // error.message = ERROR_MESSAGES.REQUIRED
      return errorsList
    } else {
      if (error.property === '.metadata.referrer.address') {
        error.message = ERROR_MESSAGES.INVALID_ADDRESS
      }

      if (error.property === '.metadata.quote.slippageBips') {
        error.message = ERROR_MESSAGES.ONLY_DIGITS
      }
      if (error.property === '.appData') {
        error.message = ERROR_MESSAGES.INVALID_APPDATA
      }
    }

    return [...errorsList, error]
  }, [])
}

export const handleErrors = (
  ref: RefObject<Form<FormProps>>,
  errors: FormValidation,
  handler: (value: boolean) => void
): FormValidation => {
  if (!ref.current) return errors
  const { errors: formErrors } = ref.current?.state as FormProps
  handler(Array.isArray(formErrors) && formErrors?.length > 0)
  return errors
}

// export const ipfsSchema: JSONSchema7 = {
//   type: 'object',
//   required: ['pinataApiKey', 'pinataApiSecret'],
//   properties: {
//     pinataApiKey: {
//       type: 'string',
//       title: 'Pinata API key',
//       description: 'Add your Pinata API key.',
//     },
//     pinataApiSecret: {
//       type: 'string',
//       title: 'Pinata API secret',
//       description: 'Add your Pinata API secret.',
//     },
//   },
// }

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
        tooltip: 'Set the slippage in BIPS (e.g. "0.3").',
      },
    },
  },
}

// export const ipfsUiSchema = {
//   pinataApiKey: {
//     'ui:field': 'cField',
//     tooltip: 'Add your Pinata API key.',
//   },
//   pinataApiSecret: {
//     'ui:field': 'cField',
//     tooltip: 'Add your Pinata API secret key.',
//   },
// }
