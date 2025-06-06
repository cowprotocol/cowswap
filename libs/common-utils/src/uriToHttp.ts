/**
 * Given a URI that may be ipfs, ipns, http, https, ar, or data protocol, return the fetch-able http(s) URLs for the same content
 * @param uri to convert to fetch-able http url
 */
// TODO: Reduce function complexity by extracting logic
// eslint-disable-next-line complexity
export function uriToHttp(uri: string): string[] {
  // For local development
  if (uri.startsWith('/@fs/')) {
    return [uri]
  }

  const protocol = uri.split(':')[0].toLowerCase()
  switch (protocol) {
    case 'data':
      return [uri]
    case 'https':
      return [uri]
    case 'http':
      return ['https' + uri.substr(4), uri]
    case 'ipfs':
      const hash = uri.match(/^ipfs:(\/\/)?(ipfs\/)?(.*)$/i)?.[3] // TODO: probably a bug on original code
      return [`https://ipfs.io/ipfs/${hash}/`]
    case 'ipns':
      const name = uri.match(/^ipns:(\/\/)?(.*)$/i)?.[2]
      return [`https://ipfs.io/ipns/${name}/`]
    case 'ar':
      const tx = uri.match(/^ar:(\/\/)?(.*)$/i)?.[2]
      return [`https://arweave.net/${tx}`]
    default:
      return []
  }
}
