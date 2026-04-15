import styled from 'styled-components/macro'

export const CurrencyLogoPairWrapper = styled.div<{ clickable?: boolean; tokenSize?: number }>`
  --token-size: ${({ tokenSize = 28 }) => tokenSize}px;
  --overlap: calc(var(--token-size) / 2);
  --border-width: 1.8px;

  display: flex;
  cursor: ${({ clickable }) => (clickable ? 'pointer' : 'initial')};

  > div:first-child {
    --cutout-center-x: calc(var(--token-size) - var(--overlap) + var(--token-size) / 2);
    --inner-radius: calc(var(--token-size) / 2);
    --outer-radius: calc(var(--inner-radius) + var(--border-width));
    --radial-gradient-mask: radial-gradient(
      circle at var(--cutout-center-x) 50%,
      white 0%,
      white var(--inner-radius),
      transparent var(--inner-radius),
      transparent var(--outer-radius),
      white var(--outer-radius),
      white 100%
    );

    mask-image: var(--radial-gradient-mask);
    -webkit-mask-image: var(--radial-gradient-mask);
  }

  > div:last-child,
  > svg:last-child {
    margin: 0 0 0 calc(var(--overlap) * -1);
  }
`
