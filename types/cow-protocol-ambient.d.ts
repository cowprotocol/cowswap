/** Shared ambient modules for TS resolution across packages (assets, static imports). */
declare module '@cowprotocol/assets/*' {
  const src: string
  export default src
}

/** Font imports use a nested path; `@cowprotocol/assets/*` is a single path segment in TS module patterns. */
declare module '@cowprotocol/assets/fonts/*' {
  const src: string
  export default src
}

declare module '*.svg' {
  const src: string
  export default src
}

declare module '*.png' {
  const src: string
  export default src
}
