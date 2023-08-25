import { AppDataHooks, PostHooks, PreHooks } from '../types'

export function buildAppDataHooks(pre: PreHooks, post: PostHooks): AppDataHooks {
  return {
    pre,
    post,
  }
}
