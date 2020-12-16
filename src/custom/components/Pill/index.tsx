import styled from 'styled-components'

const Pill = styled.strong<{ color?: string; bgColor?: string; minWidth?: string }>`
  padding: 0.2rem 0.4rem;
  border-radius: 1rem;
  color: ${(props): string => props.color || 'inherit'};
  background-color: ${(props): string => props.bgColor || 'transparent'};
  margin-right: 0.5rem;
  font-size: smaller;
  font-weight: 600;
  text-align: center;
  text-transform: uppercase;
  white-space: nowrap;
  min-width: ${(props): string => props.minWidth || 'unset'};
`
export default Pill
