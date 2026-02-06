import { useSpringValue } from '@react-spring/web'
import { useGesture } from '@use-gesture/react'

const SWIPE_CLOSE_THRESHOLD_PX = 300
const VELOCITY_THRESHOLD = 3

export interface UseDrawerGestureOptions {
  onClose: () => void
  config?: { mass: number; tension: number; friction: number }
}

export interface UseDrawerGestureReturn {
  bind: ReturnType<typeof useGesture>[0]
  style: { transform: ReturnType<ReturnType<typeof useSpringValue<number>>['to']> }
  y: ReturnType<typeof useSpringValue<number>>
}

export function useDrawerGesture(options: UseDrawerGestureOptions): UseDrawerGestureReturn {
  const { onClose, config = { mass: 1, tension: 210, friction: 20 } } = options
  const y = useSpringValue(0, { config })

  const bind = useGesture({
    onDrag: (state) => {
      y.set(state.down ? state.movement[1] : 0)
    },
    onDragEnd: (state) => {
      if (
        state.movement[1] > SWIPE_CLOSE_THRESHOLD_PX ||
        (state.velocity[1] > VELOCITY_THRESHOLD && state.direction[1] > 0)
      ) {
        onClose()
        y.set(0)
      }
    },
  })

  return {
    bind,
    style: { transform: y.to((val) => `translateY(${val > 0 ? val : 0}px)`) },
    y,
  }
}
