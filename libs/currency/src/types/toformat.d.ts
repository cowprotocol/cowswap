// Ambient declaration for toformat (no @types package available)
declare module 'toformat' {
  function toFormat<T>(base: T): T
  export default toFormat
}
