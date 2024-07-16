import { AppDataHooks, PostHooks, PreHooks } from '../types'

export function buildAppDataHooks({
  preInteractionHooks,
  postInteractionHooks,
}: {
  preInteractionHooks?: PreHooks
  postInteractionHooks?: PostHooks
}): AppDataHooks | undefined {
  if (!preInteractionHooks?.length && !postInteractionHooks?.length) {
    return undefined
  }

  return {
    ...(preInteractionHooks?.length ? { pre: preInteractionHooks } : undefined),
    ...(postInteractionHooks?.length ? { post: postInteractionHooks } : undefined),
  }
}
