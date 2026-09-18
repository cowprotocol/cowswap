import { normalizeError } from '@cowprotocol/common-utils'
import { resolveFlexibleConfigValues, type CowAuthWrapperConfig, type FlexibleConfig } from '@cowprotocol/widget-lib'

import { resolveAuthWrapper } from 'modules/authWrapper'

/**
 * Validates every `CowAuthWrapper` config the integrator supplied, across all
 * networks and trade types.
 *
 * Reporting these as widget parameter errors (which block the widget) rather than
 * ignoring them is deliberate: silently dropping a bad wrapper config would place an
 * ordinary, unwrapped order — settling a trade the integrator never asked for.
 */
export function validateAuthWrapper(input: FlexibleConfig<CowAuthWrapperConfig> | undefined): string[] | undefined {
  if (!input) return undefined

  const errors = resolveFlexibleConfigValues(input).flatMap((config) => {
    if (!config) return ['Auth wrapper config must not be empty!']

    try {
      resolveAuthWrapper(config)

      return []
    } catch (err: unknown) {
      // `resolveAuthWrapper` raises `AuthWrapperConfigError` for everything it checks,
      // but anything unexpected must still block the widget rather than be swallowed.
      return [normalizeError(err).message]
    }
  })

  return errors.length > 0 ? errors : undefined
}
