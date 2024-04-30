import React from 'react'

import styled from 'styled-components/macro'

export type Props = {
  readonly percentage?: string
  readonly activeColor?: string
  readonly showLabel?: boolean
}

const Wrapper = styled.div<Props>`
  display: flex;
  align-items: center;

  > div {
    width: 16rem;
    height: 0.6rem;
    position: relative;
    border-radius: 16rem;
    background: ${({ theme }): string => theme.borderPrimary};
  }

  > div > span {
    width: ${({ percentage }): string => percentage || '0'}%;
    max-width: 100%;
    height: 100%;
    position: absolute;
    left: 0;
    top: 0;
    background-color: ${({ activeColor, theme }): string => (activeColor ? activeColor : theme.green)};
    border-radius: 16rem;
  }

  > b {
    color: ${({ activeColor, theme }): string => (activeColor ? activeColor : theme.green)};
    margin: 0 0 0 0.7rem;
  }
`

export function ProgressBar(props: Props): JSX.Element {
  const { percentage = '0', showLabel = true } = props

  return (
    <Wrapper {...props}>
      <div className="progress-line">
        <span></span>
      </div>
      {showLabel && <b>{percentage}%</b>}
    </Wrapper>
  )
}
