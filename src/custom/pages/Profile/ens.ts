import { SupportedChainId } from 'constants/chains'
import { ClientError, gql, GraphQLClient } from 'graphql-request'

// List of supported subgraphs. Note that the app currently only support one active subgraph at a time
const CHAIN_SUBGRAPH_URL: Record<number, string> = {
  [SupportedChainId.MAINNET]: 'https://api.thegraph.com/subgraphs/name/ensdomains/ens',
}

const DOMAINS_BY_ADDRESS_QUERY = gql`
  query ensNames($resolvedAddress: String!) {
    domains(where: { resolvedAddress_contains: $resolvedAddress }, orderBy: name) {
      name
    }
  }
`

export async function ensNames(
  chainId: SupportedChainId,
  address: string
): Promise<
  | {
      error: { name: string; message: string; stack: string | undefined }
    }
  | { data: string[] }
> {
  try {
    const subgraphUrl = chainId ? CHAIN_SUBGRAPH_URL[chainId] : undefined

    if (!subgraphUrl) {
      return {
        error: {
          name: 'UnsupportedChainId',
          message: `Subgraph queries against ChainId ${chainId} are not supported.`,
          stack: '',
        },
      }
    }

    const data = await new GraphQLClient(subgraphUrl).request(DOMAINS_BY_ADDRESS_QUERY, { resolvedAddress: address })

    return {
      data: data.domains.map((domain: { name: string }) => domain.name),
    }
  } catch (error) {
    if (error instanceof ClientError) {
      const { name, message, stack } = error
      return { error: { name, message, stack } }
    }
    throw error
  }
}
