import { AppDataHooks, CowHook } from '../types'

export function buildAppDataHooks<T extends CowHook[], V extends AppDataHooks>({
  preInteractionHooks,
  postInteractionHooks,
}: {
  preInteractionHooks?: T
  postInteractionHooks?: T
}): V | undefined {
  if (!preInteractionHooks?.length && !postInteractionHooks?.length) {
    return undefined
  }

  return {
    ...(preInteractionHooks?.length ? { pre: preInteractionHooks } : undefined),
    ...(postInteractionHooks?.length ? { post: postInteractionHooks } : undefined),
  } as V
}
