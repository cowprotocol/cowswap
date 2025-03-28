import { UI } from '../enum'

export enum StatusColorVariant {
  Info = 'info',
  Success = 'success',
  Savings = 'savings',
  Warning = 'warning',
  Danger = 'danger',
  Alert = 'alert',
  Default = 'default',
}

export interface StatusColorEnums {
  icon?: string
  iconColor?: string
  iconText?: string
  color: UI
  bg: string
  text: string
}

// Base color schemes
const colorSchemes = {
  success: {
    color: UI.COLOR_SUCCESS_TEXT,
    bg: UI.COLOR_SUCCESS_BG,
    text: UI.COLOR_SUCCESS_TEXT,
  },
  info: {
    color: UI.COLOR_INFO_TEXT,
    bg: UI.COLOR_INFO_BG,
    text: UI.COLOR_INFO_TEXT,
  },
  warning: {
    color: UI.COLOR_WARNING_TEXT,
    bg: UI.COLOR_WARNING_BG,
    text: UI.COLOR_WARNING_TEXT,
  },
  danger: {
    color: UI.COLOR_DANGER_TEXT,
    bg: UI.COLOR_DANGER_BG,
    text: UI.COLOR_DANGER_TEXT,
  },
  alert: {
    color: UI.COLOR_ALERT_TEXT,
    bg: UI.COLOR_ALERT_BG,
    text: UI.COLOR_ALERT_TEXT,
  },
  default: {
    color: UI.COLOR_TEXT,
    bg: UI.COLOR_PAPER,
    text: UI.COLOR_TEXT,
  },
}

export const statusColorEnumsMap: Record<StatusColorVariant, StatusColorEnums> = {
  [StatusColorVariant.Info]: {
    icon: 'INFORMATION',
    ...colorSchemes.info,
  },
  [StatusColorVariant.Success]: {
    icon: 'SUCCESS',
    iconColor: UI.COLOR_SUCCESS,
    ...colorSchemes.success,
  },
  [StatusColorVariant.Savings]: {
    iconText: '💸',
    ...colorSchemes.success,
  },
  [StatusColorVariant.Warning]: {
    icon: 'ALERT',
    ...colorSchemes.warning,
  },
  [StatusColorVariant.Danger]: {
    icon: 'DANGER',
    ...colorSchemes.danger,
  },
  [StatusColorVariant.Alert]: {
    icon: 'ALERT',
    ...colorSchemes.alert,
  },
  [StatusColorVariant.Default]: {
    ...colorSchemes.default,
  },
}

export function getStatusColorEnums(variant: StatusColorVariant): StatusColorEnums {
  return statusColorEnumsMap[variant] || statusColorEnumsMap[StatusColorVariant.Default]
}
