import { buildAppDataHooks } from './buildAppDataHooks'

import { AppDataHooks, CowHook, TypedAppDataHooks, TypedCowHook } from '../types'

export function cowHookToTypedCowHook(hook: CowHook, type: TypedCowHook['type']): TypedCowHook {
  return { ...hook, type }
}

export function typedAppDataHooksToAppDataHooks(hooks: TypedAppDataHooks | undefined): AppDataHooks | undefined {
  if (!hooks) {
    return hooks
  }

  const { pre, post, ...rest } = hooks

  return {
    ...rest,
    pre: pre ? pre?.map(typedCowHookToCowHook) : undefined,
    post: post ? post?.map(typedCowHookToCowHook) : undefined,
  }
}

function typedCowHookToCowHook({ type: _, ...rest }: TypedCowHook): CowHook {
  return rest
}

export function addPermitHookToHooks(hooks: TypedAppDataHooks | undefined, permit: CowHook): AppDataHooks | undefined {
  if (!hooks) {
    return buildAppDataHooks({ preInteractionHooks: [permit] })
  }

  const { pre, ...rest } = hooks

  // Replace permit if existing
  let replaced = false

  const updatedPreHooks =
    pre?.reduce<TypedCowHook[]>((acc, hook) => {
      if (hook.type === 'permit') {
        replaced = true
        acc.push({ ...hook, ...permit })
      } else {
        acc.push(hook)
      }
      return acc
    }, []) || []

  if (!replaced) {
    updatedPreHooks.push({ ...permit, type: 'permit' })
  }

  return typedAppDataHooksToAppDataHooks({ ...rest, pre: updatedPreHooks })
}

export function removePermitHookFromHooks(hooks: TypedAppDataHooks | undefined): AppDataHooks | undefined {
  if (!hooks) {
    return hooks
  }

  const { pre, ...rest } = hooks

  const filteredPre = pre?.filter((hook) => hook.type !== 'permit')

  return typedAppDataHooksToAppDataHooks({ ...rest, pre: filteredPre })
}
