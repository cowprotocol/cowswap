import styled from 'styled-components';
import { transparentize } from 'polished'
import { Color, Font, Media } from 'const/styles/variables'


export const Section = styled.section<{ hero?: boolean, colorVariant?: string, flow?: string, fullWidth?: boolean, mobileSwitchOrder?: boolean }>`
  display: flex;
  width: 100%;
  max-width: ${({ fullWidth }) => fullWidth ? '100vw' : '148rem'};
  min-height: 100vh;
  flex-flow: ${({ flow }) => flow === 'column' ? 'column wrap' : 'row'};
  gap: 8rem;
  margin: 10rem auto;
  position: relative;
  z-index: 1;

  ${({ colorVariant }) => colorVariant === 'orange' && `
    background: ${Color.orange};
    color: ${Color.black};
  `}

  ${Media.mobile} {
    height: auto;
    padding: 0 3.2rem;
    max-width: 100%;
    min-height: initial;
    flex-flow: column wrap;
  }

  // Hero specific styling
  ${({ hero }) => hero && `
    margin: 0 auto;
    min-height: calc(100vh - 8.1rem);

    ${Media.mobile} {
      min-height: initial;
      padding: 5.6rem 3.2rem 0;
    }
  `}

  > div {
    display: flex;
    flex-flow: ${({ flow }) => flow === 'column' ? 'column wrap' : 'row wrap'};
    flex: ${({ flow }) => flow === 'column' ? '1 1 auto' : '1 1 50%'};
    justify-content: ${({ flow }) => flow === 'column' ? 'center' : 'flex-start'};
    align-items: center;
    align-content: center;
    gap: 5rem;
    z-index: 1;

    ${Media.mobile} {
      flex: 1 1 auto; 
    }
  }

  ${({ mobileSwitchOrder }) => mobileSwitchOrder && `
    > div:first-child {
      ${Media.mobile} {
        order: 2;
      }
    }
  `}

  ${({ mobileSwitchOrder }) => mobileSwitchOrder && `
    > div:last-child {
      ${Media.mobile} {
        order: 1;
      }
    }
  `}

  }

   h1, h2, h3 {
    font-size: ${({ hero }) => hero ? "6.8rem" : "5.4rem"};
    line-height: 1.2;
    /* font-weight: ${({ hero }) => hero ? Font.weightNormal : Font.weightBold}; */
    font-weight: ${Font.weightBold};
    margin: 0;
    z-index: 1;

    ${Media.mobile} {
      font-size: 4rem;
      text-align: center;
    }
  }
`

export const TopGradient = styled.div`
  background: url('images/gradient.svg') no-repeat center/cover;
  filter: blur(10rem);
  width: 100%;
  height: 100%;
  position: absolute;
  right: 0;
  left: 0;
  top: 0;
  z-index: 0;
  opacity: 0.5;

  /* &::after {
    content: "";
    background: url('images/noise.svg') repeat center/cover;
    filter: contrast(170%) brightness(1000%);
    mix-blend-mode: screen;
    display: block;
    width: 100%;
    height: 100%;
    position: absolute;
    top: 0;
    left: 0;
  } */
`

export const SubTitle = styled.p<{ maxWidth?: number, align?: string, lineHeight?: number }>`
  display: inline-block;
  font-size: 1.9rem;
  color: ${Color.grey};
  font-weight: ${Font.weightNormal};
  line-height: ${({ lineHeight }) => lineHeight ? lineHeight : 1.5};
  text-align: ${({ align }) => align ? align : "left"};
  max-width: ${({ maxWidth }) => maxWidth && `${maxWidth}rem`};
  z-index: 1;

  ${Media.mobile} {
    font-size: 1.6rem;
    text-align: ${({ align }) => align ? align : "center"};
  }
`

export const SectionImage = styled.div<{ margin?: string, height?: string, width?: string }>`
  width: ${({ width }) => width ? width : '100%'};
  height: ${({ height }) => height ? height : '100%'};
  margin: ${({ margin }) => margin ? margin : '0'};
  display: flex;
  justify-content: center;
  align-items: center;
  flex-flow: column wrap;
  position: relative;
  z-index: 0;

  ${Media.mobile} {
    height: initial;
  }

  > a > img,
  > img {
    object-fit: contain;
    width: 100%;
    height: inherit;
  }
`

export const ScrollDownButton = styled.button`
  display: flex;
  width: 14rem;
  margin: 0 auto;
  left: 0;
  right: 0;
  flex: 0;
  position: absolute;
  bottom: 3.2rem;
  justify-content: center;
  align-items: center;
  background: none;
  border: 0;
  color: ${Color.grey};
  gap: 1rem;
  font-size: ${Font.sizeDefault};
  /* animation: floating 2s linear 1s infinite alternate; */

  ${Media.mobile} {
    display: none;
  }

  &::before {
    content: "";
    display: block;
    width: 2rem;
    height: 2rem;
    background: url('images/icons/handDown.svg') no-repeat center/contain;
  }

  /* @keyframes floating {
    from {transform: translateY(0)}
    to {transform: translateY(-1rem)}
  } */
`

export const Metrics = styled.div`
  display: flex;
  flex-flow: row wrap;
  width: 100%;
  justify-content: center;
  gap: 12rem;

  ${Media.mobile} {
    gap: 4rem;
  }

  > div {
    flex: 0 1 auto;
    justify-content: center;
    align-items: flex-start;
    display: flex;
    flex-flow: column wrap;
    gap: 1.6rem;
  }

  > div > b {
    font-size: 7.4rem;
    font-weight: ${Font.weightNormal};

    ${Media.mobile} {
      font-size: 4rem;
    }
  }

  > div > i {
    font-style: normal;
    font-size: 1.5rem;
    color: ${transparentize(0.2, Color.grey)};

    ${Media.mobile} {
      font-size: 1.3rem;
    }
  }
`

export const IconList = styled.ol`
  display: grid;
  max-width: 110rem;
  grid-template-columns: 1fr 1fr; 
  width: 100%;
  margin: 5.6rem auto 0;
  padding: 0;
  gap: 7rem 10rem;

    ${Media.mobile} {
      grid-template-columns: 1fr; 
    }
`

export const IconListItem = styled.li<{ icon?: string }>`
  display: grid;
  grid-template-columns: 6.5rem 1fr; 
  flex-flow: row wrap;
  align-items: flex-start;
  justify-content: flex-start;
  justify-items: flex-start;
  align-content: flex-start;

  &::before {
    ${({ icon }) => icon && `
      content: "";
      height: 100%;
      width: 4.2rem;
      display: block;
      margin: -1rem 0 0;
      background: url(${icon}) no-repeat top/contain;
    `};
  }

  > span {
    display: flex;
    flex-flow: column wrap;
    flex: 1 1 auto;
    gap: 1.2rem;
  }

  > span > b {
    font-size: 2.4rem;
    line-height: 1.2;
  }
  
  > span > p {
    font-size: ${Font.sizeDefault};
    line-height: 1.6;
    color: ${Color.grey};
  }
`

export const CheckList = styled.ol`
  list-style-type: none;
  color: ${Color.grey};
  font-weight: ${Font.weightNormal};
  font-size: ${Font.sizeDefault};
  gap: 1.2rem;
  display: flex;
  flex-flow: column wrap;
  padding: 0;
  margin: 0;
  line-height: 1.2;

  > li {
    display: flex;
    font-size: inherit;
    align-items: center;
  }

  > li::before {
    content: "";
    display: inline-block;
    height: 2.4rem;
    width: 2.4rem;
    background: url('images/icons/check.svg') no-repeat center/contain;
    margin: 0 1rem 0 0;
  }
`

export const ApiTool = styled.div`
  display: flex;
  width: 100%;
  height: 100%;
  flex-flow: column wrap;
  background: black;
  border: 0.1rem solid ${Color.border};
  backdrop-filter: blur(6rem);
  border-radius: 7rem;
  max-height: 64rem;
  padding: 2.4rem 4.8rem;
  font-size: ${Font.sizeDefault};

  ${Media.mobile} {
    max-height: initial;
    border-radius: 2rem;
    padding: 0 2.4rem 2.4rem;
  }

  > h4 {
    font-weight: ${Font.weightNormal};
    font-size: 2.4rem;
    line-height: 1;
    color: ${Color.white}
  }
`

export const ApiParams = styled.div`
  display: flex;
  flex-flow: row wrap;
  gap: 4rem;
  margin: 1.6rem 0 4rem;

  > span {
    display: flex;
    flex-flow: column wrap;
  }

  > span > b {
    font-size: 2.8rem;
    line-height: 1;
    margin: 0 0 1rem;
  }

  > span > small {
    font-size: 1.8rem;
    line-height: 1;
    color: ${transparentize(0.3, Color.grey)};
  }
`

export const ApiUrl = styled.div`
  display: flex;
  align-items: center;
  justify-content: flex-start;
  width: 100%;
  border: 0.1rem solid ${Color.border};
  padding: 1.6rem;
  border-radius: 1.2rem;
  gap: 0;

  ${Media.mobile} {
    flex-flow: column wrap;
    align-items: flex-start;
    gap: 1rem;
  }

  > b {
    margin: 0 0.6rem 0 0;
    padding: 0;
    display: inline-block;
    color: ${Color.orange};
  }

  > p {
    display: inline-block;
    line-height: 1.2;
  }

  > p > span {
    color: ${Color.orange};
  }
`

export const ApiOutput = styled.div`
  display: flex;
  flex-flow: column wrap;
  align-items: flex-start;
  justify-content: flex-start;
  width: 100%;
  margin: 4rem 0 0;

  > b {
    margin: 0 0 1.6rem 0;
    font-weight: ${Font.weightNormal};
  }

  > div {
    border: 0.1rem solid ${Color.border};
    color: ${Color.grey};
    padding: 2.1rem;
    border-radius: 1.2rem;
    line-height: 1.4;
    overflow-y: auto;
    font-size: 1.4rem;
    height: 23rem;
    word-break: break-all;
  }

  > div > span {
    color: ${Color.orange};
  }
`