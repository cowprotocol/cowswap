import type { ReactNode } from 'react'

import styles from './CowSaucerScene.module.css'

// Same scene as CoW Swap's 404 (`CowSaucerScene` in libs/ui), which is built on styled-components
const BEAM_PATH = 'm292.634 77.996-51.082 15.716L209 697.996h312z'
const SIDE_LEFT_PATH = 'm328.821 57.64-16.516-10.253a26.44 26.44 0 0 0-18.985-3.493l-32.616 6.332 3.861 19.888z'
const SIDE_RIGHT_PATH = 'm200.309 82.593 11.481-15.69a26.44 26.44 0 0 1 16.299-10.341l32.616-6.331 3.86 19.888z'
const DOME_PATH =
  'm200.308 82.595 16.516 10.254a26.44 26.44 0 0 0 18.985 3.493l32.615-6.331h.001l32.615-6.33a26.44 26.44 0 0 0 16.299-10.343L328.82 57.65l-64.256 12.473v-.001z'
const CAP_PATH =
  'M280.489 32.397c-3.936-10.972-15.287-17.431-26.729-15.21-11.443 2.221-19.553 12.458-19.097 24.105l.543 13.894 49.977-9.702z'
const STARS = [
  {
    path: 'M516.245 551.241l2.755-6.245 2.755 6.245 6.245 2.755-6.245 2.755-2.755 6.245-2.755-6.245-6.245-2.755z',
    className: styles.star,
  },
  {
    path: 'M425.184 68.1795 431 54.996l5.816 13.1837 13.184 5.8163-13.184 5.8164-5.816 13.1836-5.816-13.1836-13.184-5.8164z',
    className: `${styles.star} ${styles.star2}`,
  },
  {
    path: 'M7.63265 477.629 11 469.996l3.3673 7.633 7.6327 3.367-7.6327 3.367-3.3673 7.633-3.36735-7.633-7.63265-3.367z',
    className: `${styles.star} ${styles.star3}`,
  },
]

export function CowSaucerScene(): ReactNode {
  return (
    <div className={styles.scene} aria-hidden="true">
      <div className={styles.flight}>
        <div className={styles.cow}>
          <div className={styles.cowSprite} />
        </div>
        <div className={styles.saucer}>
          <svg className={styles.saucerSvg} viewBox="0 0 528 698" role="presentation">
            <path className={styles.beam} d={BEAM_PATH} />
            <path className={styles.side} d={SIDE_LEFT_PATH} />
            <path className={styles.side} d={SIDE_RIGHT_PATH} />
            <path className={styles.dome} d={DOME_PATH} />
            <path className={styles.cap} d={CAP_PATH} />
            {STARS.map(({ path, className }) => (
              <path key={path} className={className} d={path} />
            ))}
          </svg>
        </div>
      </div>
    </div>
  )
}
