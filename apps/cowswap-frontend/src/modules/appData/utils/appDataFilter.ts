import { PERMIT_SIGNER } from '@cowprotocol/permit-utils'
import { CowHook } from '@cowprotocol/types'

import { OrderInteractionHooks } from '../types'

export type HooksFilter = (cowHook: CowHook) => boolean

// Address used when bug with multiple permits per order was introduced
// Should not be the case once we rotate the key, but kept for sanity check
const FORMER_PERMIT_HOOK_ADDRESS = '4ed18E9489d82784F98118d5A6aB3AD4340802fb'

/**
 * Filter to identify any hook containing the permit signer address
 *
 * Since we want to use it directly in an `Array.filter` fn, returns false when it DOES match
 * @param cowHook
 */
export const filterPermitSignerPermit: HooksFilter = (cowHook: CowHook): boolean => {
  const hasFormerAddress = cowHook.target.includes(FORMER_PERMIT_HOOK_ADDRESS)
  const hasCurrentAddress = cowHook.target.includes(PERMIT_SIGNER.address.slice(2))

  console.log(`bug:filterPermitSignerPermit`, cowHook, hasFormerAddress, hasCurrentAddress)

  return !hasFormerAddress && !hasCurrentAddress
}

export function filterHooks(
  hooks: OrderInteractionHooks | undefined,
  preHooksFilter: HooksFilter | undefined,
  postHooksFilter: HooksFilter | undefined
): OrderInteractionHooks | undefined {
  if (!hooks) {
    console.log(`bug:filterHooks no hooks`)
    return hooks
  }

  const { pre, post, ...rest } = hooks

  const filteredPre = preHooksFilter ? pre?.filter(preHooksFilter) : pre
  const filteredPost = postHooksFilter ? post?.filter(postHooksFilter) : post

  // Remove metadata completely if nothing is left after filter
  if (!filteredPre?.length && !filteredPost?.length) {
    console.log(`bug:filterHooks filtered out everything`, hooks)
    return undefined
  }

  console.log(`bug:filterHooks something left after filtering`, hooks, filteredPre, filteredPost)

  return {
    ...rest,
    // Filter out if there's nothing in one of them
    ...(filteredPre?.length ? { pre: filteredPre } : undefined),
    ...(filteredPost?.length ? { post: filteredPost } : undefined),
  }
}
