import styled from 'styled-components'
import { Color } from 'styles/variables'

export const ChartContainer = styled.div`
  display: flex;
  flex-direction: column;
  height: 350px;
  margin-bottom: 24px;
  align-items: flex-start;
  width: 100%;
  overflow: hidden;
  padding-right: 100px;
`
const LoadingChartContainer = styled.div`
  display: flex;
  flex-direction: row;
  align-items: flex-end;
  height: 100%;
  /* margin-bottom: 44px; */
  padding-bottom: 66px;
  overflow: hidden;
  max-width: 100%;
`

const ChartAnimation = styled.div`
  animation: wave 8s cubic-bezier(0.36, 0.45, 0.63, 0.53) infinite;
  display: flex;
  overflow: hidden;
  margin-top: 90px;

  @keyframes wave {
    0% {
      margin-left: 0;
    }
    100% {
      margin-left: -800px;
    }
  }
`
const Space = styled.div<{ heightSize: number }>`
  height: ${({ heightSize }) => `${heightSize}px`};
`

function Wave() {
  return (
    <svg width="416" height="160" xmlns="http://www.w3.org/2000/svg">
      <path d="M 0 80 Q 104 10, 208 80 T 416 80" stroke={Color.grey2} fill="transparent" strokeWidth="2" />
    </svg>
  )
}

export function LoadingChart() {
  return (
    <ChartContainer>
      <Space heightSize={6} />
      <LoadingChartContainer>
        <div>
          <ChartAnimation>
            <Wave />
            <Wave />
            <Wave />
            <Wave />
            <Wave />
          </ChartAnimation>
        </div>
      </LoadingChartContainer>
    </ChartContainer>
  )
}
