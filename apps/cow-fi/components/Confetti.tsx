import ReactConfetti from 'react-confetti'

import { useWindowSize } from '../lib/hooks/useWindowSize'

// eslint-disable-next-line react/prop-types
export function Confetti({ start, variant }: { start: boolean; variant?: string }) {
  const { width, height } = useWindowSize()

  const _variant = variant ? variant : height && width && height > 1.5 * width ? 'bottom' : variant

  return start && width && height ? (
    <ReactConfetti
      style={{ zIndex: 1401, maxWidth: '100%' }}
      numberOfPieces={400}
      recycle={false}
      run={true}
      width={width}
      height={height}
      confettiSource={{
        h: height,
        w: width,
        x: 0,
        y: _variant === 'top' ? height * 0.25 : _variant === 'bottom' ? height * 0.75 : height * 0.5,
      }}
      initialVelocityX={15}
      initialVelocityY={30}
      gravity={0.45}
      tweenDuration={100}
      wind={0.05}
    />
  ) : null
}