import type { AppDataInfo, CowHook } from 'modules/appData'

/**
 * Prepends quote-only pre-hooks onto an app data document.
 */
export function withAdditionalPreHooks(
  doc: AppDataInfo['doc'] | undefined,
  preHooks: readonly CowHook[] | undefined,
): AppDataInfo['doc'] | undefined {
  if (!doc || !preHooks?.length) {
    return doc
  }

  const existingHooks = doc.metadata?.hooks

  return {
    ...doc,
    metadata: {
      ...doc.metadata,
      hooks: {
        ...existingHooks,
        pre: [...preHooks, ...(existingHooks?.pre ?? [])],
      },
    },
  }
}
