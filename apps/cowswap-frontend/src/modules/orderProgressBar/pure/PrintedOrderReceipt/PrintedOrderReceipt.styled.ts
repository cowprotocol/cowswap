import { ExternalLink, Font, Media, UI } from '@cowprotocol/ui'

import styled, { css, keyframes } from 'styled-components/macro'

const feedReceipt = keyframes`
  0% {
    max-height: 0;
  }
  4%, 16% {
    max-height: 26px;
  }
  40%, 58% {
    max-height: var(--receipt-compact-height);
  }
  100% {
    max-height: 1200px;
  }
`

const cutterKick = keyframes`
  0%, 93% {
    transform: translateY(0);
  }
  95% {
    transform: translateY(2px);
  }
  97% {
    transform: translateY(-1px);
  }
  100% {
    transform: translateY(0);
  }
`

export const ReceiptStage = styled.section`
  width: 100%;
  max-width: 520px;
  margin: 0 auto;
  padding: 0 12px 16px;
  background: ${({ theme }) => (theme.darkMode ? `var(${UI.COLOR_PAPER})` : `var(${UI.COLOR_PAPER_DARKER})`)};
  border-radius: 24px;
`

export const PrinterDevice = styled.div`
  position: relative;
  z-index: 3;
  width: 100%;
  min-height: 94px;
  padding: 13px 20px 6px;
  color: var(${UI.COLOR_NEUTRAL_100});
  background: var(${UI.COLOR_PAPER_DARKER});
  border: 1px solid var(${UI.COLOR_PAPER_DARKEST});
  border-radius: 22px 22px 18px 18px;
  box-shadow: 0 13px 28px var(${UI.COLOR_BLACK_OPACITY_30});

  ${Media.upToExtraSmall()} {
    min-height: 84px;
    padding: 10px 12px 5px;
    border-radius: 18px 18px 15px 15px;
  }
`

export const SpeakerGrille = styled.div`
  position: absolute;
  top: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(${UI.COLOR_NEUTRAL_40});
  opacity: 0.48;
  transform: translateY(-50%);

  &:first-child {
    left: 20px;
  }

  &:last-child {
    right: 20px;
  }

  > svg {
    width: 36px;
    height: 36px;
  }

  ${Media.upToExtraSmall()} {
    opacity: 0.38;

    &:first-child {
      left: 12px;
    }

    &:last-child {
      right: 12px;
    }

    > svg {
      width: 28px;
      height: 28px;
    }
  }
`

export const PrinterCore = styled.div`
  position: absolute;
  inset: 0;
  pointer-events: none;
`

export const DeviceMark = styled.div`
  position: absolute;
  top: 50%;
  left: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  width: max-content;
  height: 14px;
  color: var(${UI.COLOR_NEUTRAL_40});
  transform: translate(-50%, -50%);

  > svg {
    flex: 0 0 auto;
    width: 21px;
    height: 14px;
    opacity: 0.58;
  }

  ${Media.upToExtraSmall()} {
    height: 12px;

    > svg {
      width: 18px;
      height: 12px;
    }
  }
`

export const DeviceIdentity = styled.span`
  display: block;
  color: inherit;
  font-family: ${Font.familyMono};
  line-height: 1;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  white-space: nowrap;
  opacity: 0.72;

  > strong {
    font-size: 8px;
    font-weight: 600;
  }

  ${Media.upToExtraSmall()} {
    > strong {
      font-size: 7px;
    }
  }
`

export const PrinterMouth = styled.div`
  position: absolute;
  z-index: 5;
  left: 50%;
  bottom: 2px;
  width: calc(100% - 80px);
  height: 12px;
  background: var(${UI.COLOR_NEUTRAL_0});
  border: 1px solid color-mix(in srgb, var(${UI.COLOR_NEUTRAL_40}) 72%, transparent);
  border-radius: 3px 3px 6px 6px;
  box-shadow:
    inset 0 1px 0 color-mix(in srgb, var(${UI.COLOR_NEUTRAL_100}) 22%, var(${UI.COLOR_NEUTRAL_40})),
    inset 0 -1px 2px var(${UI.COLOR_BLACK_OPACITY_30}),
    0 4px 8px var(${UI.COLOR_BLACK_OPACITY_30});
  transform: translateX(-50%);

  ${Media.upToExtraSmall()} {
    width: 100%;
    height: 10px;
  }
`

export const ReceiptReveal = styled.div`
  --receipt-compact-height: 292px;

  position: relative;
  z-index: 4;
  width: calc(100% - 104px);
  max-height: 0;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  margin: -7px auto 0;
  overflow: hidden;
  transform-origin: top center;
  will-change: max-height, transform;
  -webkit-mask:
    linear-gradient(#000 0 0) top / 100% calc(100% - 13px) no-repeat,
    conic-gradient(from -45deg at 50% 100%, #000 0 90deg, transparent 90deg 360deg) bottom / 16px 13px repeat-x;
  mask:
    linear-gradient(#000 0 0) top / 100% calc(100% - 13px) no-repeat,
    conic-gradient(from -45deg at 50% 100%, #000 0 90deg, transparent 90deg 360deg) bottom / 16px 13px repeat-x;
  animation:
    ${feedReceipt} 3.4s steps(30, end) forwards,
    ${cutterKick} 3.4s linear forwards;

  @media (prefers-reduced-motion: reduce) {
    max-height: none;
    transform: none;
    opacity: 1;
    animation: none;
  }

  ${Media.upToExtraSmall()} {
    --receipt-compact-height: 262px;

    width: calc(100% - 16px);
    margin-top: -6px;
  }
`

export const ReceiptPaper = styled.div`
  width: 100%;
  flex: 0 0 auto;
  display: flex;
  flex-direction: column;
  padding: 26px 26px 42px;
  color: color-mix(in srgb, var(${UI.COLOR_NEUTRAL_0}) 96%, var(${UI.COLOR_NEUTRAL_40}));
  background-color: var(${UI.COLOR_NEUTRAL_100});
  background-color: color-mix(in srgb, var(${UI.COLOR_NEUTRAL_100}) 97%, #d8c8aa);
  background-image:
    radial-gradient(
      circle,
      color-mix(in srgb, var(${UI.COLOR_NEUTRAL_0}) 2.5%, transparent) 0 0.45px,
      transparent 0.75px
    ),
    radial-gradient(circle, color-mix(in srgb, #8a7358 2%, transparent) 0 0.4px, transparent 0.7px);
  background-position:
    0 0,
    7px 11px;
  background-size:
    13px 17px,
    19px 23px;
  box-shadow: 0 18px 30px var(${UI.COLOR_BLACK_OPACITY_30});
  font-family: ${Font.familyMono};
  font-size: 13px;
  line-height: 1.35;

  ${Media.upToExtraSmall()} {
    padding: 22px 18px 38px;
    font-size: 12px;
  }
`

export const Brand = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 0;
  min-height: 24px;
  color: var(${UI.COLOR_NEUTRAL_40});
  font-size: 11px;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  white-space: nowrap;
`

export const PrintedWordmark = styled.img`
  width: 204px;
  height: auto;
  opacity: 0.94;
  mix-blend-mode: multiply;
  image-rendering: crisp-edges;
  image-rendering: pixelated;

  ${Media.upToExtraSmall()} {
    width: 186px;
  }
`

export const HeroArtwork = styled.div`
  position: relative;
  width: 180px;
  height: 80px;
  display: flex;
  align-items: center;
  justify-content: center;

  ${Media.upToExtraSmall()} {
    width: 164px;
    height: 72px;
  }
`

export const HeroSparkle = styled.span<{ $side: 'left' | 'right' }>`
  position: absolute;
  top: 7px;
  ${({ $side }) => $side}: 9px;
  display: flex;
  color: var(${UI.COLOR_NEUTRAL_0});

  > svg {
    width: 15px;
    height: 15px;
  }

  ${Media.upToExtraSmall()} {
    top: 6px;
    ${({ $side }) => $side}: 7px;

    > svg {
      width: 13px;
      height: 13px;
    }
  }
`

export const SuccessStamp = styled.img`
  position: absolute;
  right: 17px;
  bottom: 1px;
  display: block;
  width: 24px;
  height: 24px;
  opacity: 0.94;
  mix-blend-mode: multiply;
  image-rendering: crisp-edges;
  image-rendering: pixelated;

  ${Media.upToExtraSmall()} {
    right: 15px;
  }
`

export const PrintedHero = styled.img`
  display: block;
  width: 120px;
  height: 80px;
  object-fit: contain;
  opacity: 0.94;
  mix-blend-mode: multiply;
  image-rendering: crisp-edges;
  image-rendering: pixelated;

  ${Media.upToExtraSmall()} {
    width: 108px;
    height: 72px;
  }
`

export const CompletionHeading = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 14px;
  margin: 18px auto 14px;
  text-align: center;

  > strong {
    font-family: ${Font.familyMono};
    font-size: 26px;
    font-weight: 700;
    line-height: 1.15;
    letter-spacing: 0.045em;
    text-transform: uppercase;
    text-shadow: 0.75px 0 0 currentColor;
    white-space: nowrap;
  }

  ${Media.upToExtraSmall()} {
    gap: 12px;
    margin-top: 16px;

    > strong {
      font-size: 21px;
      letter-spacing: 0.035em;
    }
  }
`

export const OrderLink = styled(ExternalLink)`
  margin: 0 auto;
  color: inherit;
  font-size: 15px;
  text-decoration: underline;
  text-underline-offset: 3px;

  &:hover {
    text-decoration-thickness: 2px;
  }
`

export const Divider = styled.hr`
  width: 100%;
  height: 0;
  margin: 22px 0;
  border: 0;
  border-top: 2px dotted var(${UI.COLOR_NEUTRAL_40});
`

export const TearOffDivider = styled.div`
  position: relative;
  width: calc(100% + 52px);
  height: 22px;
  margin: 12px -26px 10px;

  > hr {
    position: absolute;
    top: 50%;
    right: 11px;
    left: 11px;
    height: 1px;
    margin: 0;
    border: 0;
    background: repeating-linear-gradient(to right, var(${UI.COLOR_NEUTRAL_50}) 0 8px, transparent 8px 16px);
    transform: translateY(-50%);
  }

  &::before,
  &::after {
    content: '';
    position: absolute;
    z-index: 1;
    top: 50%;
    width: 22px;
    height: 22px;
    background: var(${UI.COLOR_PAPER_DARKER});
    border-radius: 50%;
    transform: translateY(-50%);
  }

  &::before {
    left: -11px;
  }

  &::after {
    right: -11px;
  }

  ${Media.upToExtraSmall()} {
    width: calc(100% + 36px);
    margin-right: -18px;
    margin-left: -18px;

    > hr {
      right: 10px;
      left: 10px;
    }

    &::before,
    &::after {
      width: 20px;
      height: 20px;
    }

    &::before {
      left: -10px;
    }

    &::after {
      right: -10px;
    }
  }
`

export const AmountBlock = styled.div`
  min-width: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 5px;
  text-align: center;

  > span {
    color: var(${UI.COLOR_NEUTRAL_40});
    font-size: 11px;
    text-transform: uppercase;
    letter-spacing: 0.08em;
  }

  > strong {
    max-width: 100%;
    font-family: ${Font.family};
    font-size: clamp(16px, 5vw, 22px);
    line-height: 1.2;
    overflow-wrap: anywhere;
  }
`

export const AmountsContent = styled.div`
  display: grid;
  grid-template-columns: minmax(0, 1fr) 24px minmax(0, 1fr);
  align-items: center;
  gap: 10px;
  padding-top: 12px;

  ${Media.upToExtraSmall()} {
    grid-template-columns: minmax(0, 1fr) 22px minmax(0, 1fr);
    gap: 6px;
  }
`

export const SwapArrow = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  margin: 0;
  border: 1px solid var(${UI.COLOR_NEUTRAL_80});
  border-radius: 50%;

  > svg {
    width: 13px;
    height: 13px;
  }

  ${Media.upToExtraSmall()} {
    width: 22px;
    height: 22px;

    > svg {
      width: 11px;
      height: 11px;
    }
  }
`

export const ReceiptRow = styled.div<{ $emphasize: boolean }>`
  display: grid;
  grid-template-columns: minmax(0, 0.9fr) minmax(0, 1.4fr);
  align-items: start;
  gap: 14px;
  margin: 0 0 10px;

  > span {
    color: var(${UI.COLOR_NEUTRAL_40});
  }

  > strong {
    min-width: 0;
    color: inherit;
    font-weight: ${({ $emphasize }) => ($emphasize ? 700 : 400)};
    text-align: right;
    overflow-wrap: anywhere;

    a {
      color: inherit;
      text-decoration: underline;
      text-underline-offset: 2px;
    }
  }

  ${({ $emphasize }) =>
    $emphasize &&
    css`
      margin-bottom: 16px;
    `}
`

export const SurplusValue = styled.span`
  color: var(${UI.COLOR_COWAMM_DARK_GREEN});
`

export const ReceiptFooter = styled.footer`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  margin: 0;
  text-align: center;

  > img {
    color: var(${UI.COLOR_NEUTRAL_0});
  }
`

export const ReceiptSignoff = styled.span`
  color: var(${UI.COLOR_NEUTRAL_40});
  font-family: ${Font.familyMono};
  font-size: 11px;
  line-height: 1;
  letter-spacing: 0.1em;
  text-transform: uppercase;
`
