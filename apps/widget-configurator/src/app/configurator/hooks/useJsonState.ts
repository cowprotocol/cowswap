import { useCallback, useState } from 'react'

export const EMPTY_JSON_STATE: InitialJsonState<object> = {
  fields: {},
  jsonValue: {},
}

export interface InitialJsonState<T extends object> {
  fields: T
  jsonValue: T
}

export interface JsonState<T extends object> {
  fields: T
  rawJsonValue: string
  parsedJsonValue: T
  mergedValue: T
  error: boolean
}

export type OnJsonStateChange<T extends object> = (name: keyof T | null, value: string) => void

export function useJsonState<T extends object>(
  initialState: InitialJsonState<T>,
): [JsonState<T>, OnJsonStateChange<T>] {
  const { fields: initialFields, jsonValue: initialJsonValue } = initialState

  const [jsonState, setJsonState] = useState<JsonState<T>>({
    fields: initialFields,
    rawJsonValue: JSON.stringify(initialJsonValue),
    parsedJsonValue: initialJsonValue,
    mergedValue: mergeJsonValues(initialFields, initialJsonValue),
    error: false,
  })

  const onChange = useCallback(
    (name: keyof T | null, value: string) => {
      if (name === null) {
        let parsedValue: T = initialJsonValue

        try {
          parsedValue = parseJsonValue<T>(value.trim())
        } catch {
          setJsonState((prevState) => ({
            ...prevState,
            rawJsonValue: value,
            error: true,
          }))

          return
        }

        setJsonState(({ fields }) => ({
          fields,
          rawJsonValue: value,
          parsedJsonValue: parsedValue,
          mergedValue: mergeJsonValues(fields, parsedValue),
          error: false,
        }))
      } else {
        setJsonState(({ fields, rawJsonValue, parsedJsonValue }) => {
          const nextFields = { ...fields, [name]: value }

          return {
            fields: nextFields,
            rawJsonValue,
            parsedJsonValue,
            mergedValue: mergeJsonValues(nextFields, parsedJsonValue),
            error: false,
          }
        })
      }
    },
    [initialJsonValue],
  )

  return [jsonState, onChange]
}

function mergeJsonValues<T extends object>(fields: T, jsonValue: T): T {
  return {
    ...fields,
    ...jsonValue,
  }
}

// TODO: Use hjson and/or js-yaml
function parseJsonValue<T extends object>(value: string): T {
  try {
    return JSON.parse(value.trim()) as T
  } catch (err) {
    throw err
  }
}
