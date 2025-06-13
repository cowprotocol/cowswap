import qs from 'qs'

// TODO: Replace any with proper type definitions
// TODO: Add proper return type annotation
// eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/explicit-function-return-type
export const querySerializer = (params: any) => {
  return qs.stringify(params, { encodeValuesOnly: true, arrayFormat: 'brackets' })
}
