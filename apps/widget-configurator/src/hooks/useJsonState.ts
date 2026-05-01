import { useCallback, useState } from 'react'

export const EMPTY_JSON_STATE: InitialJsonState<object> = {
  jsonValue: {},
}

export interface InitialJsonState<T extends object> {
  jsonValue: T
}

export interface JsonState<T extends object> {
  rawJsonValue: string | null
  parsedJsonValue: T
  error: boolean
}

export type OnJsonStateChange = (value: string | null) => void

export function useJsonState<T extends object>(initialState: InitialJsonState<T>): [JsonState<T>, OnJsonStateChange] {
  const { jsonValue: initialJsonValue } = initialState

  const [jsonState, setJsonState] = useState<JsonState<T>>({
    rawJsonValue: JSON.stringify(initialJsonValue),
    parsedJsonValue: initialJsonValue,
    error: false,
  })

  const onChange = useCallback(
    (value: string | null) => {
      if (value === null) {
        setJsonState({
          rawJsonValue: JSON.stringify(initialJsonValue),
          parsedJsonValue: initialJsonValue,
          error: false,
        })

        return
      }

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

      setJsonState({
        rawJsonValue: value,
        parsedJsonValue: parsedValue,
        error: false,
      })
    },
    [initialJsonValue],
  )

  return [jsonState, onChange]
}

// TODO: Use hjson and/or js-yaml
function parseJsonValue<T extends object>(value: string): T {
  try {
    return JSON.parse(value.trim()) as T
  } catch (err) {
    throw err
  }
}
