export enum ButtonSize {
  SMALL,
  DEFAULT,
  BIG,
}

export enum Z_INDEX {
  deprecated_zero = 0,
  deprecated_content = 1,
  dropdown = 1000,
  sticky = 1020,
  fixed = 1030,
  modalBackdrop = 1040,
  offcanvas = 1050,
  modal = 1060,
  popover = 1070,
  tooltip = 1080,
}

// Cow theme
export { default } from './cowSwapTheme'
export * from './cowSwapTheme'

// GP theme
// export { default } from './baseTheme'
// export * from './baseTheme'
