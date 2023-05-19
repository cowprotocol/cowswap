/**
 * Copying over types from file that used to be generated
 * Due to issues with graphql build, it was disabled on
 * https://github.com/cowprotocol/cowswap/pull/987
 * Thus, hard coding the generated types as we don't expect them to change often
 */
export type EnsNamesQuery = { __typename?: 'Query' } & {
  domains: Array<{ __typename?: 'Domain' } & Pick<Domain, 'name'>>
}

export type Domain = {
  __typename?: 'Domain'
  id: Scalars['ID']
  name?: Maybe<Scalars['String']>
  labelName?: Maybe<Scalars['String']>
  labelhash?: Maybe<Scalars['Bytes']>
  parent?: Maybe<Domain>
  subdomains: Array<Domain>
  subdomainCount: Scalars['Int']
  resolvedAddress?: Maybe<Account>
  owner: Account
  resolver?: Maybe<Resolver>
  ttl?: Maybe<Scalars['BigInt']>
  isMigrated: Scalars['Boolean']
  createdAt: Scalars['BigInt']
  events: Array<DomainEvent>
}

export type Account = {
  __typename?: 'Account'
  id: Scalars['ID']
  domains: Array<Domain>
  registrations?: Maybe<Array<Registration>>
}

export type DomainEvent = {
  id: Scalars['ID']
  domain: Domain
  blockNumber: Scalars['Int']
  transactionID: Scalars['Bytes']
}

export type Maybe<T> = T | null

export type Registration = {
  __typename?: 'Registration'
  id: Scalars['ID']
  domain?: Maybe<Domain>
  registrationDate: Scalars['BigInt']
  expiryDate: Scalars['BigInt']
  cost?: Maybe<Scalars['BigInt']>
  registrant: Account
  labelName?: Maybe<Scalars['String']>
  events: Array<RegistrationEvent>
}

export type RegistrationEvent = {
  id: Scalars['ID']
  registration: Registration
  blockNumber: Scalars['Int']
  transactionID: Scalars['Bytes']
}

export type Resolver = {
  __typename?: 'Resolver'
  id: Scalars['ID']
  domain?: Maybe<Domain>
  address: Scalars['Bytes']
  addr?: Maybe<Account>
  contentHash?: Maybe<Scalars['Bytes']>
  texts?: Maybe<Array<Scalars['String']>>
  coinTypes?: Maybe<Array<Scalars['BigInt']>>
  events: Array<ResolverEvent>
}

export type ResolverEvent = {
  id: Scalars['ID']
  resolver: Resolver
  blockNumber: Scalars['Int']
  transactionID: Scalars['Bytes']
}

export type Scalars = {
  ID: string
  String: string
  Boolean: boolean
  Int: number
  Float: number
  BigDecimal: any
  BigInt: any
  Bytes: any
}
