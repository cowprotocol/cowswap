import styled from 'styled-components';
import { transparentize } from 'polished'
import { Color, Font, Media } from 'const/styles/variables'


export const Section = styled.section<{ hero?: boolean, breakMedium?: boolean, colorVariant?: string, flow?: string, fullWidth?: boolean, mediumSwitchOrder?: boolean, mobileSwitchOrder?: boolean }>`
  display: flex;
  width: 100%;
  min-height: 100%;
  flex-flow: ${({ flow }) => flow === 'column' ? 'column wrap' : 'row'};
  gap: 8rem;
  margin: 10rem auto;
  position: relative;
  z-index: 1;
  align-items: ${({ hero }) => hero ? 'center' : 'normal'};

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
  ${({ hero, breakMedium }) => (hero || breakMedium) && `
    margin: 0 auto;
    min-height: 100%;
    padding-top: 10rem;

    ${Media.mediumDown} {
      padding: 3.2rem 0;
      min-height: initial;
      flex-flow: column wrap;
    }

    ${Media.mobile} {
      min-height: initial;
      padding: 5.6rem 3.2rem 0;
    }

    ${Media.desktopOnly} {
      > div > h1 {
        font-size: 4rem;
      }
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

  ${({ mediumSwitchOrder }) => mediumSwitchOrder && `
    > div:first-child {
      ${Media.mediumDown} {
        order: 2;
      }
    }
  `}

  ${({ mediumSwitchOrder }) => mediumSwitchOrder && `
    > div:last-child {
      ${Media.mediumDown} {
        order: 1;
      }
    }
  `}

   h1, h2, h3 {
    font-size: 5rem;
    line-height: 1.2;
    font-weight: ${Font.weightBold};
    margin: 0;
    z-index: 1;

    ${Media.mediumDown} {
      font-size: 4rem;
      text-align: center;
    }
  }

  h3 {
    ${Media.desktopDown} {
      font-size: 3.8rem;
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

  ${Media.mediumDown} {
    font-size: 1.6rem;
    text-align: ${({ align }) => align ? align : "center"};
  }
`

export const SectionImage = styled.div<{ centerMobile?: boolean, margin?: string, height?: string, width?: string }>`
  width: ${({ width }) => width ? width : '100%'};
  height: ${({ height }) => height ? height : '100%'};
  margin: ${({ margin }) => margin ? margin : '0'};
  display: flex;
  justify-content: center;
  align-items: center;
  flex-flow: column wrap;
  position: relative;
  z-index: 0;

  ${Media.mediumDown} {
    height: initial;

    ${({ centerMobile }) => centerMobile && `
      margin-left: auto;
      margin-right: auto;
    `}
  }

  > a > img,
  > img {
    object-fit: contain;
    width: 100%;
    height: inherit;
  }
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

    ${Media.mediumOnly} {
      font-size: 5rem;
    }

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
    min-width: 2.4rem;
    background: url('images/icons/check.svg') no-repeat center/contain;
    margin: 0 1rem 0 0;
  }
`

export const ApiWrapper = styled.div`
  overflow: hidden;
  max-width: 100%;
`

export const ApiTool = styled.div`
  display: flex;
  width: 100%;
  flex-flow: column wrap;
  background: black;
  border: 0.1rem solid ${Color.border};
  backdrop-filter: blur(6rem);
  border-radius: 7rem;
  padding: 2.4rem 4.8rem;
  font-size: ${Font.sizeDefault};

  ${Media.desktopOnly} {
    border-radius: 3rem;
    padding: 0 2.4rem 2.4rem;
  }

  ${Media.mobile} {
    border-radius: 2rem;
    padding: 0 2.4rem 2.4rem;
  }

  > h4 {
    font-weight: ${Font.weightNormal};
    font-size: 2.4rem;
    line-height: 1;
    color: ${Color.white}
  }

  > p {
    line-height: 1.4;
  }

  pre {
    max-width: 100%;
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

export const ApiCurlCommand = styled.div`
  display: flex;
  align-items: center;
  justify-content: flex-start;
  width: 100%;
  border: 0.1rem solid ${Color.border};
  padding: 0;
  border-radius: 1.2rem;
  gap: 0;
  margin: 0 0 2.4rem;

  ${Media.mobile} {
    flex-flow: column wrap;
    align-items: flex-start;
    border: none;
    padding: 0;
    gap: 1rem;

    pre {
      margin: 0 !important;
    }
  }

  > p {
    display: inline-block;
    line-height: 1.2;
  }

  > p > span {
    color: ${Color.orange};
  }
`