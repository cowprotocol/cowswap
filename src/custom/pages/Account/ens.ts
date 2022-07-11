import { SupportedChainId } from 'constants/chains'
import { ClientError, gql, GraphQLClient } from 'graphql-request'
import { EnsNamesQuery } from 'state/data/generated'

const CHAIN_SUBGRAPH_URL: Record<number, string> = {
  [SupportedChainId.MAINNET]: 'https://api.thegraph.com/subgraphs/name/ensdomains/ens',
  [SupportedChainId.RINKEBY]: 'https://api.thegraph.com/subgraphs/name/ensdomains/ensrinkeby',
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
  | string[]
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

    const data = await new GraphQLClient(subgraphUrl).request<EnsNamesQuery>(DOMAINS_BY_ADDRESS_QUERY, {
      resolvedAddress: address.toLocaleLowerCase(),
    })

    return data.domains
      .map((domain) => domain.name)
      .filter((domainName): domainName is string => domainName !== null && domainName !== undefined)
  } catch (error) {
    if (error instanceof ClientError) {
      const { name, message, stack } = error
      return { error: { name, message, stack } }
    }
    throw error
  }
}
