/* eslint-disable @typescript-eslint/no-explicit-any */
declare module '*.svg' {
  const content: any
  export const ReactComponent: any
  export default content
}

declare module '*.webm' {
  const src: string
  export default src
}

declare module '*.mp4' {
  const src: string
  export default src
}

declare module '*.woff'
declare module '*.woff2'
