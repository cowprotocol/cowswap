export const TRADE_WIDGET_ANIMATION_CONFIG = { mass: 1, tension: 30, friction: 0.2, clamp: true }

export const CURRENT_WIDGET_CLOSING = {
  from: {
    x: 0,
    opacity: 1,
  },
  to: {
    x: -500,
    opacity: 0,
  },
}

export const CURRENT_WIDGET_OPENING = {
  to: {
    x: 0,
    opacity: 1,
  },
  from: {
    x: -300,
    opacity: 0,
  },
}

export const NEXT_WIDGET_OPENING = {
  from: { x: 300, opacity: 0 },
  to: { x: 0, opacity: 1 },
}

export const NEXT_WIDGET_CLOSING = {
  to: { x: 300, opacity: 0 },
  from: { x: 0, opacity: 1 },
}
