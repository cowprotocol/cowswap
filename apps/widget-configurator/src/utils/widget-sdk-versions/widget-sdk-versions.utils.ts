import {
  LOCAL_WIDGET_REACT_VERSION,
  NPM_WIDGET_REACT_FIRST_VERSION_WITH_ON_READY,
  NPM_WIDGET_REACT_LATEST_VERSION,
  PINNED_LEGACY_WIDGET_SDK_VERSIONS,
  VALID_WIDGET_SDK_VERSIONS,
  type WidgetSdkVersion,
} from './widget-sdk-versions.constants'

import { DEFAULT_CONFIGURATOR_FORM_VALUES } from '../../configurator.constants'
import { isWorkspaceWidgetSdkSelectable } from '../env/env.constants'

function isSemverAtLeast(version: string, minimum: string): boolean {
  const versionParts = version.split('.').map(Number)
  const minimumParts = minimum.split('.').map(Number)

  for (let index = 0; index < Math.max(versionParts.length, minimumParts.length); index++) {
    const diff = (versionParts[index] ?? 0) - (minimumParts[index] ?? 0)
    if (diff !== 0) return diff > 0
  }

  return true
}

/**
 * SDK segment colors — keep in sync with {@link getEnvColor} in base-url/baseUrl.ts:
 * local → brandColor, latest npm → green, first legacy → orangered, older pinned → darkred.
 */
export function getSdkEnvColor(brandColor: string, sdkVersion: WidgetSdkVersion): string {
  if (sdkVersion === 'local') return brandColor

  if (sdkVersion === NPM_WIDGET_REACT_LATEST_VERSION) return 'green'

  if (sdkVersion === PINNED_LEGACY_WIDGET_SDK_VERSIONS[0]) return 'orangered'

  return 'darkred'
}

/**
 * Whether a version delivers a READY event the configurator can read.
 *
 * widget-lib started posting READY in widget-react {@link NPM_WIDGET_REACT_FIRST_VERSION_WITH_ON_READY}.
 * Older pinned releases never deliver it, so their preview is revealed on iframe `load` instead.
 */
export function widgetSdkVersionSupportsReadyEvent(sdkVersion: WidgetSdkVersion): boolean {
  const widgetReactVersion = sdkVersion === 'local' ? LOCAL_WIDGET_REACT_VERSION : sdkVersion

  return isSemverAtLeast(widgetReactVersion, NPM_WIDGET_REACT_FIRST_VERSION_WITH_ON_READY)
}

export function getSdkEnvLabel(sdkVersion: WidgetSdkVersion): string {
  if (sdkVersion === 'local') return 'Local'

  if (sdkVersion === NPM_WIDGET_REACT_LATEST_VERSION) return 'Latest'

  return sdkVersion
}

export function normalizeWidgetSdkVersion(value: unknown): WidgetSdkVersion {
  const fallback = DEFAULT_CONFIGURATOR_FORM_VALUES.sdkVersion

  // Legacy persisted value from when the workspace build was labelled "latest".
  if (value === 'latest') {
    return fallback
  }

  if (typeof value === 'string' && VALID_WIDGET_SDK_VERSIONS.has(value as WidgetSdkVersion)) {
    const version = value as WidgetSdkVersion

    // `local` isn't selectable outside local dev / PR preview, so drop persisted values back to the default.
    if (version === 'local' && !isWorkspaceWidgetSdkSelectable) {
      return fallback
    }

    return version
  }

  return fallback
}
