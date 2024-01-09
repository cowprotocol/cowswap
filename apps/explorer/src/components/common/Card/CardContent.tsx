import React from 'react'
import styled from 'styled-components'

import ShimmerBar from 'apps/explorer/components/common/ShimmerBar'
import { media } from 'theme/styles/media'

export type statusType = 'success' | 'danger'

export interface CardContentProps {
  variant: '2row' | '3row' | 'double'
  direction?: string
  icon1?: React.ReactElement
  label1: string
  value1: string | number | undefined | React.ReactElement
  valueSize?: number
  labelWidth?: number
  caption1?: string | number
  captionColor?: string
  hint1?: string
  hintColor?: string
  icon2?: React.ReactElement
  label2?: string
  value2?: string
  caption2?: string
  hint2?: string
  loading?: boolean
}

const CardBody = styled.div<{
  variant: string
  valueSize?: number
  labelWidth?: number
  direction?: string
  captionColor?: string
  hintColor?: string
}>`
  display: flex;
  flex-direction: ${({ direction }): string => (direction === 'row' ? 'column' : 'row')};
  align-items: center;
  justify-content: center;

  div {
    display: ${({ direction }): string => (direction ? 'flex' : 'initial')};
    flex-direction: ${({ direction }): string => direction || 'column'};
    > p {
      font-size: 14px;
      margin: 0;
      margin-right: ${({ variant, direction }): string =>
        variant === 'double' && direction === 'row' ? '0.5rem' : '0'};
      color: ${({ theme }): string => theme.grey};
      display: flex;
      align-items: center;
      justify-content: ${({ variant, direction }): string =>
        variant === 'double' && direction === 'row' ? 'flex-end' : 'center'};
      width: ${({ labelWidth }): string => (labelWidth ? `${labelWidth}px` : 'initial')};
      flex-direction: row-reverse;
      span {
        padding-left: 0.5rem;
      }
    }
    > div {
      display: flex;
      flex-direction: ${({ variant }): string => (variant === '2row' ? 'row' : 'column')};
      justify-content: center;
      align-items: center;
      margin-top: ${({ direction }): string => (direction === 'row' ? '0' : '8px')};

      > h3 {
        font-size: ${({ valueSize }): number => valueSize || 1.8}rem;
        margin: 0;
        ${media.mobile} {
          font-size: 1.45rem;
        }
      }
      > span {
        font-weight: bold;
        font-size: 11px;
        margin-left: ${({ variant }): string => (variant === '2row' ? '0.5rem' : '0')};
        margin-top: ${({ variant }): string => (variant === '2row' ? '0' : '6px')};
        color: ${({ theme, captionColor }): string => captionColor && theme[captionColor]};
        > span {
          margin-left: 0.25rem;
          color: ${({ theme, hintColor }): string => hintColor && theme[hintColor]};
        }
      }
    }
  }
`

/**
 * Card component.
 *
 * An extensible content container.
 */
export const CardContent: React.FC<CardContentProps> = ({
  variant,
  valueSize,
  labelWidth,
  direction,
  icon1,
  label1,
  value1,
  caption1,
  captionColor,
  hint1,
  hintColor,
  icon2,
  label2,
  value2,
  caption2,
  hint2,
  loading,
}): JSX.Element => {
  return (
    <CardBody
      variant={variant}
      valueSize={valueSize}
      labelWidth={labelWidth}
      direction={direction}
      captionColor={captionColor}
      hintColor={hintColor}
    >
      <div>
        <p>
          {icon1 && <React.Fragment>{icon1} &nbsp;</React.Fragment>}
          {label1}
        </p>
        <div>
          {loading ? <ShimmerBar /> : <h3>{value1}</h3>}
          {!loading && caption1 && (
            <span>
              {caption1}
              <span>{hint1}</span>
            </span>
          )}
        </div>
      </div>
      {!loading && label2 && (
        <div>
          <p>
            {label2}
            {icon2 && <React.Fragment>{icon2} &nbsp;</React.Fragment>}
          </p>
          <div>
            <h3>{value2}</h3>
            {caption2 && (
              <span>
                {caption2}
                <span>{hint2}</span>
              </span>
            )}
          </div>
        </div>
      )}
    </CardBody>
  )
}
