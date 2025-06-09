import { useHooks } from './useHooks'

// TODO: Add proper return type annotation
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export function useHookById(uuid: string | undefined, isPreHook: boolean) {
  const hooks = useHooks()

  if (!uuid) return undefined

  return (isPreHook ? hooks.preHooks : hooks.postHooks).find((i) => i.uuid === uuid)
}
