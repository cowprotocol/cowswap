import { useGetMatchingScreenSize } from 'hooks/useGetMatchingScreenSize'
import { Breakpoints } from 'utils/mediaQueries'

export function useMediaBreakpoint(breakpoints: Breakpoints[]): boolean {
  const resolution = useGetMatchingScreenSize()

  return breakpoints.includes(resolution)
}
