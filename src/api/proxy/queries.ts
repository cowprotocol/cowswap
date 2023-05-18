import { gql } from 'graphql-request'

export const SEARCH_TOKENS = gql`
  query SearchTokens($searchQuery: String!) {
    searchTokens(searchQuery: $searchQuery) {
      id
      decimals
      name
      chain
      standard
      address
      symbol
      project {
        id
        logoUrl
        safetyLevel
        __typename
      }
      __typename
    }
  }
`
