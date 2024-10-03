import { useHooks } from './useHooks'

export function useHookById(uuid: string | undefined, isPreHook: boolean) {
  const hooks = useHooks()

  if (!uuid) return undefined

  return (isPreHook ? hooks.preHooks : hooks.postHooks).find((i) => i.uuid === uuid)
}
