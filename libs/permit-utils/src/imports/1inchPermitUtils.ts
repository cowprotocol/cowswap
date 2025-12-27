/**
 * @1inch/permit-signed-approvals-utils has a lot of extra deps and increases bundle size, we should import in dynamically.
 *
 * It uses esm, but dymaic import breaks tree shaking, so we re-export here only used variables.
 *
 * You also can use `import type ... from '@1inch/permit-signed-approvals-utils'`
 */

// eslint-disable-next-line @typescript-eslint/no-restricted-imports
export { Eip2612PermitUtils } from '@1inch/permit-signed-approvals-utils'
