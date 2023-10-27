import { Helmet } from 'react-helmet'
import styled from 'styled-components/macro'

const Wrapper = styled.div<Layer3BannerProps>`
  ${({ addMargin = false }) => addMargin && 'margin: 15px 0;'}
`

export interface Layer3BannerProps {
  addMargin?: boolean
}

export function Layer3Banner(props: Layer3BannerProps) {
  return (
    <Wrapper {...props}>
      <Helmet>
        <script src="https://layer3.xyz/embed.js" defer></script>
      </Helmet>
      <div className="layer3-quest layer3-card" data-quest-id="halloween-cowswap"></div>
    </Wrapper>
  )
}
