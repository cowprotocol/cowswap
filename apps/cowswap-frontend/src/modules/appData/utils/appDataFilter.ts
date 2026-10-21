import { callDataContainsPermitPlaceholder } from 'modules/permit'

import { CowHook, OrderInteractionHooks } from '../types'

export type HooksFilter = (cowHook: CowHook) => boolean

/**
 * Filter to identify placeholder permit hooks
 *
 * Since we want to use it directly in an `Array.filter` fn, returns false when it DOES match
 */
export const filterPermitPlaceholder: HooksFilter = (cowHook: CowHook): boolean =>
  !callDataContainsPermitPlaceholder(cowHook.callData)

// TODO: Reduce function complexity by extracting logic
// eslint-disable-next-line complexity
export function filterHooks(
  hooks: OrderInteractionHooks | undefined,
  preHooksFilter: HooksFilter | undefined,
  postHooksFilter: HooksFilter | undefined,
): OrderInteractionHooks | undefined {
  if (!hooks) {
    return hooks
  }

  const { pre, post, ...rest } = hooks

  const filteredPre = preHooksFilter ? pre?.filter(preHooksFilter) : pre
  const filteredPost = postHooksFilter ? post?.filter(postHooksFilter) : post

  // Remove metadata completely if nothing is left after filter
  if (!filteredPre?.length && !filteredPost?.length) {
    return undefined
  }

  return {
    ...rest,
    // Filter out if there's nothing in one of them
    ...(filteredPre?.length ? { pre: filteredPre } : undefined),
    ...(filteredPost?.length ? { post: filteredPost } : undefined),
  }
}
