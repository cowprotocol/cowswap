import { StatusColorEnums } from '@cowprotocol/ui'

import styled from 'styled-components/macro'

export const AccordionWrapper = styled.div<{ colorEnums: StatusColorEnums; accordionPadding: string }>`
  border-radius: 14px;
  padding: ${({ accordionPadding }) => accordionPadding};
  background: var(${({ colorEnums }) => colorEnums.bg});

  .font-bold {
    font-weight: 600;
  }
`

export const AccordionHeader = styled.div<{ isOpened?: boolean; colorEnums: StatusColorEnums }>`
  color: var(${({ colorEnums }) => colorEnums.text});
  cursor: ${({ isOpened }) => (isOpened ? 'default' : 'pointer')};
  display: flex;
  gap: 6px;
  align-items: center;
  font-size: 13px;
`

export const ArrowWrapper = styled.div`
  cursor: pointer;
  margin-left: auto;
  font-size: 6px;
`
