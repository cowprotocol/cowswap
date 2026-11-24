import { SolanaProviderEvent, SolanaProviderMethod } from './solanaProviderTypes'

import { IframeTransport } from '../IframeTransport'

export interface IframeSolanaEventsPayloadMap {
  [IframeSolanaProviderEvents.SOLANA_PROVIDER_REQUEST]: SolanaProviderRequestPayload
  [IframeSolanaProviderEvents.SOLANA_PROVIDER_RESPONSE]: SolanaProviderResponsePayload
  [IframeSolanaProviderEvents.SOLANA_PROVIDER_ON_EVENT]: SolanaProviderOnEventPayload
}

export interface SolanaProviderOnEventPayload {
  accounts: string[]
  event: SolanaProviderEvent
}

export interface SolanaProviderRequest {
  id: number
  method: SolanaProviderMethod
  params: string[]
}

export interface SolanaProviderRequestPayload {
  solanaRequest: SolanaProviderRequest
}

export interface SolanaProviderResponse {
  id: number
  error?: string
  result?: string[]
}

export interface SolanaProviderResponsePayload {
  solanaResponse: SolanaProviderResponse
}

export enum IframeSolanaProviderEvents {
  SOLANA_PROVIDER_ON_EVENT = 'SOLANA_PROVIDER_ON_EVENT',
  SOLANA_PROVIDER_REQUEST = 'SOLANA_PROVIDER_REQUEST',
  SOLANA_PROVIDER_RESPONSE = 'SOLANA_PROVIDER_RESPONSE',
}

export const iframeSolanaProviderTransport = new IframeTransport<IframeSolanaEventsPayloadMap>(
  'cowSwapIframeSolanaProviderTransport',
)
