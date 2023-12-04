import { AppDataHooks, PostHooks, PreHooks } from '../types'

export function buildAppDataHooks({
  preInteractionHooks,
  postInteractionHooks,
}: {
  preInteractionHooks?: PreHooks
  postInteractionHooks?: PostHooks
}): AppDataHooks | undefined {
  if (!preInteractionHooks && !postInteractionHooks) {
    return undefined
  }

  return {
    ...(preInteractionHooks ? { pre: preInteractionHooks } : undefined),
    ...(postInteractionHooks ? { post: postInteractionHooks } : undefined),
  }
}
