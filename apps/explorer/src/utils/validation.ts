import { ValidationError, ObjectSchema } from 'joi'
import { validInputPattern } from 'utils'
import { ResolverResult } from 'react-hook-form'

export function preventInvalidChars(event: React.KeyboardEvent<HTMLInputElement>): void {
  if (
    event.key !== 'Backspace' &&
    event.key !== 'Delete' &&
    !validInputPattern.test(event.currentTarget.value + event.key) &&
    validInputPattern.test(event.currentTarget.value)
  ) {
    event.preventDefault()
  }
}

export function validatePositive(value: string, constraint = 0): true | string {
  return Number(value) > constraint || 'Invalid amount'
}

/**
 * @name stringOrNumberResolverFactory
 * @description Factory function for form resolver using JOI validation
 * @param validationSchema joi.ObjectSchema<unknown> - Joi schema to check data
 * @param type [OPTIONAL] 'number' | undefined - sets casting use or straight FormData use
 */

export const resolverFactory =
  <FormData>(validationSchema: ObjectSchema<unknown>) =>
  async (data: FormData): Promise<ResolverResult<FormData>> => {
    const castedData: Partial<FormData> = Object.keys(data).reduce((acc, key) => {
      acc[key] = data[key] || undefined
      return acc
    }, {} as FormData)

    const { error, value }: { value: typeof castedData | undefined; error?: ValidationError } =
      validationSchema.validate(castedData, {
        abortEarly: false,
      })

    return {
      values: error || !value ? {} : data,
      errors: error
        ? error.details.reduce((previous, currentError) => {
            const finalError = { ...currentError, message: currentError?.message?.replace(/(['"])/g, '') }
            return {
              ...previous,
              [currentError.path[0]]: finalError,
            }
          }, {})
        : {},
    }
  }

export const VALIDATOR_ERROR_KEYS = {
  REF: 'any.ref',
  BASE: 'number.base',
  UNSAFE: 'number.unsafe',
  REQUIRED: 'any.required',
  GREATER: 'number.greater',
  LESS: 'number.less',
  MIN: 'number.min',
  MAX: 'number.max',
  MULTIPLE: 'number.multiple',
  INTEGER: 'number.integer',
  DATE_MIN: 'date.min',
  DATE_MAX: 'date.max',
}
