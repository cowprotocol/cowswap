import { css, keyframes } from 'styled-components/macro'

/*
a = presentation time for one image
b = duration for cross fading
n = number of images
Total animation-duration is t=(a+b)*n

animation-delay = t/n or a+b

Percentage for keyframes:

1. 0%
2. a/t*100%
3. (a+b)/t*100% = 1/n*100%
4. 100%-(b/t*100%)
5. 100%
*/

export const presentationTime = 1 // presentation time for one image in seconds
export const crossFade = 0.5 // duration for cross fading in seconds
export const animationDelay = presentationTime + crossFade

// TODO: Add proper return type annotation
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export const fadeInOut = (a: number, b: number, n: number, t = (a + b) * n) => keyframes`
  0% {
    opacity: 1;
  }
  ${`${(a / t) * 100}%`} {
    opacity: 1;
  }
  ${`${(1 / n) * 100}%`} {
    opacity: 0;
  }
  ${`${100 - (b / t) * 100}%`} {
    opacity: 0;
  } 
  100% {
    opacity: 1;
  }
`

// TODO: Add proper return type annotation
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export const imagesAnimationDelay = (n: number, animationDelay: number) =>
  Array.from(Array(n).keys()).map(
    (i) => css`
      img:nth-of-type(${i + 1}) {
        animation-delay: ${animationDelay * n - i * animationDelay}s;
      }
    `
  )
