import { isAddress } from '@cowprotocol/common-utils'
import type { CowHookCreation, CowHookToEdit } from '@cowprotocol/hook-dapp-lib'

import { z } from 'zod'

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

const addressSchema = z.string().transform((value, ctx) => {
  const address = isAddress(value)

  if (!address) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: 'Invalid address',
    })

    return z.NEVER
  }

  return address
})

const callDataSchema = z
  .string()
  .refine(isHexData)
  .transform((value) => value as Hex)

const hookSchema = z.object({
  target: addressSchema,
  callData: callDataSchema,
  gasLimit: z.string().refine(isPositiveIntegerString),
}) satisfies z.ZodType<BaseHookShape, z.ZodTypeDef, unknown>

const addHookPayloadSchema = z.object({
  hook: hookSchema,
  recipientOverride: addressSchema.optional(),
}) satisfies z.ZodType<CowHookCreation, z.ZodTypeDef, unknown>

const editHookPayloadSchema = addHookPayloadSchema.extend({
  uuid: z.string().refine((value) => !!value.trim()),
}) satisfies z.ZodType<CowHookToEdit, z.ZodTypeDef, unknown>

const tokenAddressPayloadSchema = z.object({
  address: addressSchema,
})

export function getValidatedIframeAddHookRequest(
  payload: unknown,
  hookToEditId?: string,
): PendingIframeHookMutation | null {
  if (hookToEditId) {
    return null
  }

  const hookPayload = parseSchema(addHookPayloadSchema, payload)

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

  const hookPayload = parseSchema(editHookPayloadSchema, payload)

  if (!hookPayload || hookPayload.uuid !== hookToEditId) {
    return null
  }

  return {
    type: 'edit',
    payload: hookPayload,
  }
}

export function getValidatedIframeTokenAddress(payload: unknown): string | null {
  const parsedPayload = parseSchema(tokenAddressPayloadSchema, payload)

  return parsedPayload?.address || null
}

function parseSchema<T>(schema: z.ZodType<T, z.ZodTypeDef, unknown>, payload: unknown): T | null {
  const parsed = schema.safeParse(payload)

  return parsed.success ? parsed.data : null
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
