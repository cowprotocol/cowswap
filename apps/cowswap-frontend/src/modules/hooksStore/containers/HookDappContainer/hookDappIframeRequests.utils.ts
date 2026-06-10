import { isAddress } from '@cowprotocol/common-utils'
import { CowHookCreation, CowHookToEdit } from '@cowprotocol/hook-dapp-lib'

import type { Hex } from 'viem'

export type PendingIframeHookMutation =
  | {
      type: 'add'
      payload: CowHookCreation
    }
  | {
      type: 'edit'
      payload: CowHookToEdit
    }

interface BaseHookShape {
  target: string
  callData: Hex
  gasLimit: string
}

export function getValidatedIframeAddHookRequest(
  payload: unknown,
  hookToEditId?: string,
): PendingIframeHookMutation | null {
  if (hookToEditId) {
    return null
  }

  const hookPayload = getValidatedAddHookPayload(payload)

  if (!hookPayload) {
    return null
  }

  return {
    type: 'add',
    payload: hookPayload,
  }
}

export function getValidatedIframeEditHookRequest(
  payload: unknown,
  hookToEditId?: string,
): PendingIframeHookMutation | null {
  if (!hookToEditId) {
    return null
  }

  const hookPayload = getValidatedEditHookPayload(payload)

  if (!hookPayload || hookPayload.uuid !== hookToEditId) {
    return null
  }

  return {
    type: 'edit',
    payload: hookPayload,
  }
}

export function getValidatedIframeTokenAddress(payload: unknown): string | null {
  if (!isRecord(payload) || typeof payload.address !== 'string') {
    return null
  }

  return isAddress(payload.address) || null
}

function getValidatedAddHookPayload(payload: unknown): CowHookCreation | null {
  if (!isRecord(payload)) {
    return null
  }

  const hook = getValidatedHookShape(payload.hook)

  if (!hook) {
    return null
  }

  const recipientOverride = getValidatedRecipientOverride(payload.recipientOverride)

  if (payload.recipientOverride !== undefined && !recipientOverride) {
    return null
  }

  return {
    hook,
    ...(recipientOverride ? { recipientOverride } : {}),
  }
}

function getValidatedEditHookPayload(payload: unknown): CowHookToEdit | null {
  if (!isRecord(payload)) {
    return null
  }

  const hook = getValidatedHookShape(payload.hook)

  if (!hook) {
    return null
  }

  const recipientOverride = getValidatedRecipientOverride(payload.recipientOverride)

  if (payload.recipientOverride !== undefined && !recipientOverride) {
    return null
  }

  if (typeof payload.uuid !== 'string' || !payload.uuid.trim()) {
    return null
  }

  return {
    uuid: payload.uuid,
    hook,
    ...(recipientOverride ? { recipientOverride } : {}),
  }
}

function getValidatedHookShape(value: unknown): BaseHookShape | null {
  if (!isRecord(value)) {
    return null
  }

  const target = typeof value.target === 'string' ? isAddress(value.target) : false
  const callData = typeof value.callData === 'string' && isHexData(value.callData) ? value.callData : null
  const gasLimit = typeof value.gasLimit === 'string' && isPositiveIntegerString(value.gasLimit) ? value.gasLimit : null

  if (!target || !callData || !gasLimit) {
    return null
  }

  return {
    target,
    callData,
    gasLimit,
  }
}

function getValidatedRecipientOverride(value: unknown): string | null | undefined {
  if (value === undefined) {
    return undefined
  }

  if (typeof value !== 'string') {
    return null
  }

  return isAddress(value) || null
}

function isPositiveIntegerString(value: string): boolean {
  if (!/^\d+$/.test(value)) {
    return false
  }

  try {
    return BigInt(value) > 0n
  } catch {
    return false
  }
}

function isHexData(value: string): value is Hex {
  return /^0x([0-9a-fA-F]{2})*$/.test(value)
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null
}
