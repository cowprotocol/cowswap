import styled from 'styled-components/macro'

export const StyledSVG = styled.svg<{ size: string; stroke?: string }>`
  animation: 2s rotate linear infinite;
  height: ${({ size }) => size};
  width: ${({ size }) => size};
  opacity: 0.7;
  fill: none !important;

  > path {
    fill: none !important;
    stroke: ${({ stroke }) => stroke ?? 'currentColor'}!important;
  }

  @keyframes rotate {
    from {
      transform: rotate(0deg);
    }
    to {
      transform: rotate(360deg);
    }
  }
`

/**
 * Takes in custom size and stroke for circle color, default to primary color as fill,
 * need ...rest for layered styles on top
 */
// TODO: Add proper return type annotation
// TODO: Replace any with proper type definitions
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type, @typescript-eslint/no-explicit-any
export function Loader({ size = '16px', stroke, ...rest }: { size?: string; stroke?: string; [k: string]: any }) {
  return (
    <StyledSVG viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" size={size} stroke={stroke} {...rest}>
      <path
        d="M12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22C17.5228 22 22 17.5228 22 12C22 9.27455 20.9097 6.80375 19.1414 5"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </StyledSVG>
  )
}
