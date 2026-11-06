import type { ReactNode } from 'react'

const LOGO_WIDTH = 36
const LOGO_HEIGHT = 24

interface CowLogoProps {
  /** Pixels, 24 by default */
  height?: number
  className?: string
}

export function CowLogo({ height = LOGO_HEIGHT, className }: CowLogoProps): ReactNode {
  return (
    <svg
      className={className}
      width={(height * LOGO_WIDTH) / LOGO_HEIGHT}
      height={height}
      viewBox={`0 0 ${LOGO_WIDTH} ${LOGO_HEIGHT}`}
      fill="currentColor"
      aria-hidden="true"
    >
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M13.653 24C12.8021 24.0007 11.973 23.7308 11.2855 23.2292C10.5981 22.7277 10.088 22.0205 9.829 21.21L7.11 12.666H5.44C4.58874 12.667 3.75924 12.3971 3.07158 11.8953C2.38392 11.3936 1.87377 10.686 1.615 9.875L0 4.8H6.058L2.863 0H33.137L29.942 4.8H36L34.385 9.876C34.126 10.6868 33.6158 11.3942 32.9282 11.8957C32.2405 12.3973 31.4111 12.6671 30.56 12.666H28.89L26.17 21.21C25.9111 22.0206 25.401 22.7279 24.7136 23.2294C24.0261 23.731 23.197 24.0009 22.346 24H13.653ZM11.6 10.333C11.6 11.622 12.565 12.667 13.756 12.667C14.946 12.667 15.911 11.622 15.911 10.333C15.911 9.045 14.946 8 13.756 8C12.566 8 11.6 9.045 11.6 10.333ZM24.4 10.333C24.4 11.622 23.435 12.667 22.244 12.667C21.054 12.667 20.089 11.622 20.089 10.333C20.089 9.045 21.054 8 22.244 8C23.434 8 24.4 9.045 24.4 10.333Z"
      />
    </svg>
  )
}
