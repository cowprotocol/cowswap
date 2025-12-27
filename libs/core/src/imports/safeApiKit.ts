/**
 * @safe-global/api-kit has a lot of extra variables and increases bundle size, we should import in dynamically.
 *
 * It uses esm, but dymaic import breaks tree shaking, so we re-export here only used variables.
 *
 * You also can use `import type ... from '@safe-global/api-kit'`
 */

// eslint-disable-next-line @typescript-eslint/no-restricted-imports
export { default } from '@safe-global/api-kit'
