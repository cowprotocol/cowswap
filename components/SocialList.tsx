import styled from 'styled-components';
import { transparentize } from 'polished'
import { Color, Font, Media } from 'const/styles/variables'

const Wrapper = styled.ol<Pick<SocialListProps, "iconSize" | "gap" | "innerPadding" | "alignItems">>`
  display: flex;
  justify-content: ${({ alignItems }) => (alignItems === 'left') ? 'flex-start' : (alignItems === 'right') ? 'flex-end' : 'center'};
  align-items: center;
  max-width: 110rem;
  width: 100%;
  margin: 0;
  padding: 0;
  gap: ${({ gap }) => gap ? `${gap}rem` : '7rem'};
  list-style-type: none;
  color: ${Color.grey};
  font-weight: ${Font.weightNormal};

  ${Media.mobile} {
    justify-content: center;
    flex-flow: row wrap;
    gap: ${({ gap }) => gap ? `${gap}rem` : '2rem'};
  }

  > li > a {
    display: flex;
    flex-flow: column wrap;
    justify-content: center;
    align-items: center;
    font-size: ${Font.sizeDefault};
    line-height: 1;
    text-decoration: none;
    color: inherit;
    font-weight: inherit;
    padding: ${({ gap }) => gap ? `${gap}rem` : '2rem'};
    border-radius: ${({ gap }) => gap ? `${gap}rem` : '2rem'};
    border: 0.1rem solid transparent;
    transition: color 0.2s ease-in-out, background 0.2s ease-in-out, border-color 0.2s ease-in-out;

    ${Media.mobile} {
      padding: 1rem;
    }

    &:hover {
      background: ${transparentize(0.9, Color.orange)};
      border: 0.1rem solid ${Color.orange};
      color: ${Color.orange};
    }
  }

  > li > a > img {
    width: ${({ iconSize }) => iconSize ? `${iconSize}rem` : '5.6rem'};
    height: ${({ iconSize }) => iconSize ? `${iconSize}rem` : '5.6rem'};
    object-fit: contain;

    ${Media.mobile} {
      width: 4.6rem;
      height: 4.6rem;
    }
  }

  > li > a > b {
    font-weight: inherit;
    margin: 1rem 0 0;
  }
`

interface SocialListProps {
  social: any // in place to prevent TS error: Needs fix
  labels?: boolean // toggle text labels visibility
  iconSize?: number // 'rem' size
  gap?: number // 'rem' size
  innerPadding?: number // 'rem' size
  alignItems?: string // left | center (default) | right
}

export default function SocialList({ social, labels = true, iconSize, gap, innerPadding, alignItems }: SocialListProps) {

  return (
    <Wrapper iconSize={iconSize} gap={gap} innerPadding={innerPadding} alignItems={alignItems}>
      {Object.keys(social).map((item, i) =>
        <li key={i}>
          <a href={social[item].url} target="_blank" rel="noopener nofollow noreferrer">
            <img src={`images/icons/${social[item].label.toLowerCase()}.svg`} alt={social[item].label}></img>
            {labels && <b>{social[item].label}</b>}
          </a>
        </li>
      )}
    </Wrapper>
  )

}