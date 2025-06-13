import { callDataContainsPermitSigner } from 'modules/permit'

import { CowHook, OrderInteractionHooks } from '../types'

export type HooksFilter = (cowHook: CowHook) => boolean

// Address used when bug with multiple permits per order was introduced
// Should not be the case once we rotate the key, but kept for sanity check
const FORMER_PERMIT_HOOK_ADDRESS = '4ed18e9489d82784f98118d5a6ab3ad4340802fb'

/**
 * Filter to identify any hook containing the permit signer address
 *
 * Since we want to use it directly in an `Array.filter` fn, returns false when it DOES match
 * @param cowHook
 */
export const filterPermitSignerPermit: HooksFilter = (cowHook: CowHook): boolean => {
  const hasFormerAddress = cowHook.callData.toLowerCase().includes(FORMER_PERMIT_HOOK_ADDRESS)
  const hasCurrentAddress = callDataContainsPermitSigner(cowHook.callData)

  return !hasFormerAddress && !hasCurrentAddress
}

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
