import FONT_PINYON_SCRIPT from '@cowprotocol/assets/fonts/PinyonScript-Regular.woff2'
import FONT_FEIXEN_MONO_MEDIUM from '@cowprotocol/assets/fonts/StudioFeixenMono-Medium.woff2'
import FONT_FEIXEN_MONO_SEMIBOLD from '@cowprotocol/assets/fonts/StudioFeixenMono-Semibold.woff2'
import FONT_FEIXEN_SERIF_MEDIUM from '@cowprotocol/assets/fonts/StudioFeixenSerif-Medium.woff2'
import { Font, Media } from '@cowprotocol/ui'

import styled, { createGlobalStyle, css } from 'styled-components/macro'

import { Link } from '@/components/Link'

const INK = '#23191a'
const PAPER = '#f0f1eb'
const FAQ_ROW = '#e6e7e1'
const PINK = '#ff4db6'
const ON_PINK = '#750543'
const PLUM = '#5e073a'
const BLUE = '#009dfa'

const FONT_SERIF = `'studiofeixenserif', serif`
const FONT_MONO = `'studiofeixenmono', monospace`
const FONT_SCRIPT = `'pinyonscript', cursive`

const DESIGN_WIDTH = 1600

// Scales with the viewport up to the Figma frame's width, where it reaches the designed size
const fluid = (min: number, max: number): string => `clamp(${min}px, ${(max / DESIGN_WIDTH) * 100}vw, ${max}px)`

const SIZE_SCRIPT = fluid(56, 120)
const SIZE_SCRIPT_SMALL = fluid(48, 80)
const SIZE_CAPS = fluid(40, 90)
const SIZE_CAPS_SMALL = fluid(28, 48)
const SIZE_STEP_TITLE = fluid(36, 70)
const SIZE_STAT = fluid(44, 60)
const SIZE_CARD_TITLE = fluid(28, 48)
const SIZE_CARD_TITLE_SMALL = fluid(26, 40)
const SIZE_FAQ_QUESTION = fluid(22, 40)
const SIZE_LEAD = fluid(18, 28)
const SIZE_BODY = fluid(16, 24)
const SIZE_BUTTON = fluid(18, 27)

const TONES = {
  plum: { bg: PLUM, fg: PINK, buttonBg: PINK, buttonFg: PLUM },
  pink: { bg: PINK, fg: PLUM, buttonBg: PLUM, buttonFg: PINK },
  blue: { bg: BLUE, fg: INK, buttonBg: PAPER, buttonFg: INK },
}

export type CardTone = keyof typeof TONES

const bodyText = css`
  margin: 0;
  font-family: ${FONT_MONO};
  font-size: ${SIZE_BODY};
  font-weight: ${Font.weight.medium};
  line-height: 1.2;
  text-wrap: pretty;
`

const serifTitle = css`
  margin: 0;
  font-family: ${FONT_SERIF};
  font-weight: ${Font.weight.medium};
  text-wrap: balance;
`

export const SolanaFonts = createGlobalStyle`
  @font-face {
    font-family: 'pinyonscript';
    src: url(${FONT_PINYON_SCRIPT}) format('woff2');
    font-weight: ${Font.weight.regular};
    font-style: normal;
    font-display: swap;
  }

  @font-face {
    font-family: 'studiofeixenmono';
    src: url(${FONT_FEIXEN_MONO_MEDIUM}) format('woff2');
    font-weight: ${Font.weight.medium};
    font-style: normal;
    font-display: swap;
  }

  @font-face {
    font-family: 'studiofeixenmono';
    src: url(${FONT_FEIXEN_MONO_SEMIBOLD}) format('woff2');
    font-weight: ${Font.weight.semibold};
    font-style: normal;
    font-display: swap;
  }

  @font-face {
    font-family: 'studiofeixenserif';
    src: url(${FONT_FEIXEN_SERIF_MEDIUM}) format('woff2');
    font-weight: ${Font.weight.medium};
    font-style: normal;
    font-display: swap;
  }

  /* Outranks the background the shared Layout sets on body, whatever order the sheets load in */
  html body {
    background: ${PAPER};
  }
`

export const SolanaPageWrapper = styled.div`
  width: 100%;
  color: ${INK};
  font-family: ${FONT_MONO};

  ${Media.upToLarge()} {
    padding: 0 24px;
  }

  ${Media.upToSmall()} {
    padding: 0 16px;
  }

  ::selection {
    background: ${PINK};
    color: ${ON_PINK};
  }

  a:focus-visible,
  summary:focus-visible {
    outline: 3px solid var(--ring, currentColor);
    outline-offset: 3px;
  }
`

export const HeadlineRoot = styled.h2<{ $gap: number; $align: 'left' | 'center' }>`
  display: flex;
  flex-direction: column;
  align-items: ${({ $align }) => ($align === 'left' ? 'flex-start' : 'center')};
  gap: ${({ $gap }) => $gap}px;
  margin: 0;
  color: inherit;
  text-align: ${({ $align }) => $align};
`

export const ScriptLine = styled.span<{ $small?: boolean }>`
  font-family: ${FONT_SCRIPT};
  font-size: ${({ $small }) => ($small ? SIZE_SCRIPT_SMALL : SIZE_SCRIPT)};
  font-weight: ${Font.weight.regular};
  line-height: 0.84;
  text-wrap: balance;
`

export const CapsLine = styled.span<{ $small?: boolean }>`
  font-family: ${FONT_SERIF};
  font-size: ${({ $small }) => ($small ? SIZE_CAPS_SMALL : SIZE_CAPS)};
  font-weight: ${Font.weight.bold};
  line-height: 1;
  text-transform: uppercase;
  text-wrap: balance;
`

export const Lead = styled.p<{ $caps?: boolean }>`
  margin: 0;
  font-size: ${SIZE_LEAD};
  font-weight: ${Font.weight.medium};
  line-height: 1.2;
  text-transform: ${({ $caps }) => ($caps ? 'uppercase' : 'none')};
  text-wrap: pretty;
`

export const ButtonRow = styled.div<{ $gap?: number; $center?: boolean }>`
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: ${({ $center }) => ($center ? 'center' : 'flex-start')};
  gap: ${({ $gap }) => $gap ?? 40}px;

  ${Media.upToSmall()} {
    gap: 8px;
  }
`

export const CtaLink = styled(Link)<{ $bg?: string; $fg: string; $ghost?: boolean }>`
  && {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    min-height: 64px;
    padding: 0 24px;
    border-radius: 66px;
    background: ${({ $bg }) => $bg ?? 'transparent'};
    color: ${({ $fg }) => $fg};
    font-family: ${FONT_MONO};
    font-size: ${SIZE_BUTTON};
    font-weight: ${Font.weight.semibold};
    line-height: 1.2;
    text-align: center;
    text-decoration: ${({ $ghost }) => ($ghost ? 'underline' : 'none')};
    text-decoration-skip-ink: none;
    text-underline-position: from-font;
    text-transform: uppercase;
    transition: opacity 0.2s ease-in-out;

    &:hover {
      opacity: 0.85;
    }

    ${Media.upToSmall()} {
      min-height: 56px;
      padding: 0 20px;
    }
  }
`

export const ctaColors = {
  solid: { $bg: PINK, $fg: ON_PINK },
  ghost: { $fg: INK, $ghost: true },
  ghostOnDark: { $fg: PAPER, $ghost: true },
}

export const CardLink = styled(Link)`
  && {
    align-self: flex-start;
    margin-top: auto;
    background: transparent;
    color: ${INK};
    font-family: ${FONT_MONO};
    font-size: ${SIZE_BODY};
    font-weight: ${Font.weight.semibold};
    text-decoration: underline;
    text-decoration-skip-ink: none;
    text-underline-position: from-font;
    text-transform: uppercase;
    transition: opacity 0.2s ease-in-out;

    &:hover {
      opacity: 0.85;
    }
  }
`

export const HeroGrid = styled.div`
  display: grid;
  grid-template-columns: minmax(0, 788fr) minmax(0, 600fr);
  gap: 92px;
  align-items: center;
  padding: 46px 0 94px;

  ${Media.upToLarge()} {
    gap: 48px;
  }

  ${Media.upToMedium()} {
    grid-template-columns: minmax(0, 1fr);
    padding: 24px 0 48px;
  }
`

export const HeroCopy = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 32px;

  ${Media.upToSmall()} {
    gap: 24px;
  }

  ${ButtonRow} {
    gap: 32px;

    ${Media.upToSmall()} {
      gap: 8px;
    }
  }
`

export const PhotoFrame = styled.div`
  width: 100%;

  img {
    display: block;
    width: 100%;
    height: auto;
  }
`

export const StatsPanel = styled.div`
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  padding: 40px 52px 80px;
  border-radius: 40px 40px 0 0;
  background: ${BLUE};
  color: ${INK};

  ${Media.upToMedium()} {
    grid-template-columns: minmax(0, 1fr);
    padding: 32px 24px 64px;
    border-radius: 28px 28px 0 0;
  }
`

export const StatItem = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
  padding: 0 28px;
  text-align: center;

  & + & {
    border-left: 1px solid currentColor;
  }

  strong {
    font-family: ${FONT_SERIF};
    font-size: ${SIZE_STAT};
    font-weight: ${Font.weight.bold};
    line-height: 1;
  }

  p {
    ${bodyText}
    max-width: 400px;
    text-transform: uppercase;
    text-wrap: balance;
  }

  ${Media.upToMedium()} {
    padding: 24px 0;

    & + & {
      border-left: 0;
      border-top: 1px solid currentColor;
    }
  }
`

export const StatsBackdrop = styled.div`
  background: linear-gradient(${BLUE} 60px, transparent 60px);
`

export const DarkPanel = styled.section<{ $marginTop?: number; $marginBottom?: number; $paddingBottom?: number }>`
  margin: ${({ $marginTop }) => $marginTop ?? 0}px 0 ${({ $marginBottom }) => $marginBottom ?? 0}px;
  padding: 90px 60px ${({ $paddingBottom }) => $paddingBottom ?? 80}px;
  border-radius: 40px 40px 60px 60px;
  background: ${INK};
  color: ${PAPER};

  ${Media.upToMedium()} {
    margin: ${({ $marginTop }) => ($marginTop ? 32 : 0)}px 0 ${({ $marginBottom }) => ($marginBottom ? 32 : 0)}px;
    padding: 56px 24px 48px;
    border-radius: 28px 28px 36px 36px;
  }

  ${Media.upToSmall()} {
    padding: 48px 12px 40px;
  }
`

export const SectionHeader = styled.div<{ $padding?: string; $marginBottom?: number }>`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 48px;
  margin-bottom: ${({ $marginBottom }) => $marginBottom ?? 0}px;
  padding: ${({ $padding }) => $padding ?? '0'};
  text-align: center;

  ${Lead} {
    max-width: 1050px;
  }

  ${Media.upToMedium()} {
    gap: 24px;
    margin-bottom: ${({ $marginBottom }) => ($marginBottom ? 40 : 0)}px;
    padding: ${({ $padding }) => ($padding ? '56px 0 32px' : '0')};
  }
`

export const CowMark = styled.span`
  display: block;
  width: 96px;
  height: 64px;

  img {
    display: block;
    width: 100%;
    height: 100%;
  }

  ${Media.upToMedium()} {
    width: 72px;
    height: 48px;
  }
`

export const CardGrid = styled.div<{ $columns?: number; $marginTop?: number }>`
  display: grid;
  grid-template-columns: repeat(${({ $columns }) => $columns ?? 2}, minmax(0, 1fr));
  gap: 40px;
  margin-top: ${({ $marginTop }) => $marginTop ?? 0}px;

  ${Media.upToMedium()} {
    grid-template-columns: minmax(0, 1fr);
    gap: 16px;
    margin-top: ${({ $marginTop }) => ($marginTop ? 16 : 0)}px;
  }
`

export const ReasonCard = styled.div`
  display: flex;
  flex-direction: column;
  gap: 40px;
  padding: 40px;
  border-radius: 40px;
  background: ${PAPER};
  color: ${INK};

  ${PhotoFrame} {
    margin-top: auto;
  }

  h3 {
    ${serifTitle}
    margin-bottom: 20px;
    font-size: ${SIZE_CARD_TITLE};
    line-height: 1;
  }

  p {
    ${bodyText}
  }

  ${Media.upToMedium()} {
    gap: 24px;
    padding: 24px;
    border-radius: 28px;
  }
`

export const StepRow = styled.div<{ $imageFirst?: boolean }>`
  display: grid;
  grid-template-columns: ${({ $imageFirst }) =>
    $imageFirst ? 'minmax(0, 593fr) minmax(0, 720fr)' : 'minmax(0, 720fr) minmax(0, 593fr)'};
  gap: 155px;
  align-items: center;
  padding: 96px 0;

  ${PhotoFrame} {
    order: ${({ $imageFirst }) => ($imageFirst ? -1 : 0)};
  }

  ${Media.upToLarge()} {
    gap: 64px;
  }

  ${Media.upToMedium()} {
    grid-template-columns: minmax(0, 1fr);
    gap: 24px;
    padding: 32px 0;

    ${PhotoFrame} {
      order: 0;
    }
  }
`

export const StepCopy = styled.div`
  display: flex;
  flex-direction: column;
  gap: 48px;

  h3 {
    ${serifTitle}
    font-size: ${SIZE_STEP_TITLE};
    line-height: 1;
  }

  ${Media.upToMedium()} {
    gap: 16px;
  }
`

export const CenteredBlock = styled.div<{ $padding?: string; $gap?: number }>`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: ${({ $gap }) => $gap ?? 48}px;
  padding: ${({ $padding }) => $padding ?? '60px 0'};
  text-align: center;

  ${Lead} {
    max-width: 1050px;
  }

  ${Media.upToMedium()} {
    gap: 24px;
    padding: 40px 0;
  }
`

export const LeadCard = styled.div`
  display: grid;
  grid-template-columns: minmax(0, 696fr) minmax(0, 592fr);
  padding: 32px;
  border-radius: 32px;
  background: ${PAPER};
  color: ${INK};

  ${Media.upToMedium()} {
    grid-template-columns: minmax(0, 1fr);
    gap: 32px;
    padding: 24px;
    border-radius: 28px;
  }
`

export const LeadAside = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  gap: 32px;
  padding-right: 32px;

  ${Media.upToMedium()} {
    padding-right: 0;
  }
`

export const KaminoLogo = styled.span`
  display: block;
  width: min(323px, 70%);

  svg {
    display: block;
    width: 100%;
    height: auto;
  }
`

export const LeadStat = styled.div`
  strong {
    display: block;
    font-family: ${FONT_SERIF};
    font-size: ${SIZE_CAPS};
    font-weight: ${Font.weight.bold};
    line-height: 1.24;
  }

  p {
    ${bodyText}
    max-width: 505px;
    text-transform: uppercase;
  }
`

export const PartnerCopy = styled.div`
  display: flex;
  flex-direction: column;
  gap: 24px;

  h3 {
    ${serifTitle}
    font-size: ${SIZE_CARD_TITLE};
    line-height: 1.24;
  }

  p {
    ${bodyText}
  }
`

export const PartnerCard = styled.div`
  display: flex;
  flex-direction: column;
  gap: 24px;
  padding: 32px;
  border-radius: 32px;
  background: ${PAPER};
  color: ${INK};

  ${PartnerCopy} h3 {
    font-size: ${SIZE_CARD_TITLE_SMALL};
  }

  img {
    display: block;
    width: 80px;
    height: 80px;
    border-radius: 21px;
  }

  ${Media.upToMedium()} {
    padding: 24px;
    border-radius: 28px;
  }
`

export const StatusTitle = styled.h3`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  margin: 0;
`

export const StatusLabel = styled.span`
  font-family: ${FONT_SERIF};
  font-size: ${SIZE_CAPS_SMALL};
  font-weight: ${Font.weight.medium};
  line-height: 1;
  text-transform: uppercase;
`

export const ToneCard = styled.div<{ $tone: CardTone; $padding?: number }>`
  --ring: ${({ $tone }) => TONES[$tone].fg};
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  gap: 40px;
  padding: ${({ $padding }) => $padding ?? 32}px;
  border-radius: 32px;
  background: ${({ $tone }) => TONES[$tone].bg};
  color: ${({ $tone }) => TONES[$tone].fg};

  ${Media.upToMedium()} {
    gap: 24px;
    padding: 24px;
    border-radius: 28px;
  }
`

export const toneButton = (tone: CardTone): { $bg: string; $fg: string } => ({
  $bg: TONES[tone].buttonBg,
  $fg: TONES[tone].buttonFg,
})

export const ToneCopy = styled.div<{ $large?: boolean }>`
  display: flex;
  flex-direction: column;
  gap: 24px;

  h3 {
    ${serifTitle}
    font-size: ${({ $large }) => ($large ? SIZE_CARD_TITLE : SIZE_CARD_TITLE_SMALL)};
    line-height: ${({ $large }) => ($large ? 1.24 : 1)};
  }

  p {
    ${bodyText}
    max-width: ${({ $large }) => ($large ? 'none' : '380px')};
  }

  p + p {
    margin-top: 4px;
  }

  ${Media.upToMedium()} {
    p {
      max-width: none;
    }
  }
`

export const InlineLink = styled(Link)`
  && {
    background: transparent;
    color: inherit;
    font-family: inherit;
    font-size: inherit;
    font-weight: ${Font.weight.semibold};
    text-decoration: underline;
    text-decoration-skip-ink: none;
    text-underline-position: from-font;
  }
`

export const AudienceCard = styled.div`
  display: flex;
  flex-direction: column;
  gap: 24px;
  padding: 32px;
  border-radius: 32px;
  background: ${PAPER};
  color: ${INK};

  h3 {
    ${serifTitle}
    font-size: ${SIZE_CARD_TITLE_SMALL};
    line-height: 1;
  }

  p {
    ${bodyText}
  }

  ${Media.upToMedium()} {
    padding: 24px;
    border-radius: 28px;
  }
`

export const PartnersClosing = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 80px;
  margin-top: 80px;
  text-align: center;

  ${Media.upToMedium()} {
    gap: 32px;
    margin-top: 40px;
  }
`

export const PartnersCopy = styled.div`
  display: flex;
  flex-direction: column;
  gap: 29px;
  max-width: 1050px;

  p:last-child {
    ${bodyText}
  }
`

export const FaqList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding-bottom: 80px;

  ${Media.upToMedium()} {
    padding-bottom: 40px;
  }
`

export const FaqItem = styled.details`
  border-radius: 32px;
  background: ${FAQ_ROW};

  summary {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 48px;
    padding: 16px 16px 16px 32px;
    border-radius: 32px;
    font-family: ${FONT_SERIF};
    font-size: ${SIZE_FAQ_QUESTION};
    font-weight: ${Font.weight.medium};
    line-height: 1.1;
    cursor: pointer;
    list-style: none;

    &::marker,
    &::-webkit-details-marker {
      display: none;
    }

    ${Media.upToMedium()} {
      gap: 16px;
      padding: 12px 12px 12px 24px;
    }
  }

  &:not([open]) summary:hover span::before {
    background: ${PAPER};
  }

  p {
    ${bodyText}
    max-width: 1084px;
    padding: 8px 32px 32px;

    ${Media.upToMedium()} {
      padding: 4px 24px 24px;
    }
  }
`

export const FaqIcon = styled.span`
  flex-shrink: 0;

  &::before {
    content: '+';
    display: flex;
    align-items: center;
    justify-content: center;
    width: 60px;
    height: 60px;
    border-radius: 20px;
    font-family: ${FONT_MONO};
    font-size: 40px;
    font-weight: ${Font.weight.semibold};
    line-height: 1;
    transition: background 0.2s ease-in-out;

    ${Media.upToMedium()} {
      width: 44px;
      height: 44px;
      border-radius: 16px;
      font-size: 28px;
    }
  }

  details[open] &::before {
    content: '–';
  }
`

export const Disclaimer = styled.p`
  max-width: 1050px;
  margin: 0 auto;
  padding: 0 0 64px;
  font-family: ${FONT_MONO};
  font-size: 16px;
  font-weight: ${Font.weight.medium};
  line-height: 1.4;
  text-align: center;
  text-wrap: pretty;

  b {
    font-weight: ${Font.weight.semibold};
  }

  ${Media.upToMedium()} {
    padding-bottom: 40px;
    font-size: 14px;
  }
`
