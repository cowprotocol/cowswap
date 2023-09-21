import { AppDataHooks, PostHooks, PreHooks } from '../types'

export function buildAppDataHooks(
  preInteractionHooks?: PreHooks,
  postInteractionHooks?: PostHooks
): AppDataHooks | undefined {
  if (!preInteractionHooks && !postInteractionHooks) {
    return undefined
  }

  return {
    ...{ pre: preInteractionHooks || undefined },
    ...{ post: postInteractionHooks || undefined },
  }
}
