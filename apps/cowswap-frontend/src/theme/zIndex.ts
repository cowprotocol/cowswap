// Migrating to a standard z-index system https://getbootstrap.com/docs/5.0/layout/z-index/
// Please avoid using deprecated numbers
export enum Z_INDEX {
  deprecated_zero = 0,
  deprecated_content = 1,
  dropdown = 1000,
  sticky = 1020,
  fixed = 1030,
  modal = 1060,
  popover = 1070,
  tooltip = 1080,
}

export const WIDGET_MAX_WIDTH = {
  swap: '470px',
  limit: '1350px',
  content: '680px',
  tokenSelect: '590px',
  tokenSelectSidebar: '700px',
}
