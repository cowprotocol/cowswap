import React, { useContext } from 'react'
import { BaseDecorators, Parameters } from '@storybook/addons'

const MockHookContext = React.createContext<Parameters>({})

/**
 * to mock useYourHook hook from src/hooks/useYourHook.ts
 * create a mock hook in src/mock/useYourHook.ts
 * export const useYourHook = createMockHook('useYourHook', defaultValue?)
 *
 * in *.stories.tsx
 * Story.parameter = {
 *  useYourHook: {whatever hook should return}
 * }
 *
 * or
 * Story.parameter = {
 *  useYourHook: (...whatHookExpectsAsInput) => ({whatever hook should return})
 * }
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const createMockHook = <T extends (...args: any) => any>(name: string, defaultValue?: ReturnType<T>): T => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return ((...args: any[]) => {
    const ctx = useContext(MockHookContext)
    const mockedHook = ctx[name]
    // if parameters = {useYourHook: Function}, then execute with args
    if (typeof mockedHook === 'function') {
      const res = mockedHook(...args)
      return res
    }
    // if not Function, return as is or defaultValue if Nullable
    return mockedHook ?? defaultValue
  }) as T
}

export const mockHookDecorator: BaseDecorators<JSX.Element>[0] = (Story, { parameters }) => {
  return <MockHookContext.Provider value={parameters}>{Story()}</MockHookContext.Provider>
}
