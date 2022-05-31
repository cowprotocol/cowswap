import styled from 'styled-components/macro'

import { X } from 'react-feather'

export const PhishAlert = styled.div<{ isActive: any }>`
  width: 100%;
  padding: 6px 6px;
  background-color: ${({ theme }) => theme.blue1};
  color: white;
  font-size: 11px;
  justify-content: space-between;
  align-items: center;
  display: ${({ isActive }) => (isActive ? 'flex' : 'none')};

  p {
    padding: 0;
    margin: 0;
  }
  a {
    color: white;
    font-weight: 800;
  }
`

export const StyledClose = styled(X)`
  :hover {
    cursor: pointer;
  }
`

export default function URLWarning({ announcement }: { announcement?: React.ReactNode }) {
  const showAnnouncement = !!announcement

  if (!showAnnouncement) {
    return null
  }

  return <PhishAlert isActive={showAnnouncement}>{announcement}</PhishAlert>
}
// TODO: file delete from original
// TODO: decide whether to keep it as is or not
