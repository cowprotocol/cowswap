import styled from 'styled-components/macro'

import { AlertTriangle, X } from 'react-feather'
import { useURLWarningToggle, useURLWarningVisible } from 'state/user/hooks'
import { isMobile } from 'react-device-detect'

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

export default function URLWarning({ url, announcement }: { url: string; announcement?: React.ReactNode }) {
  const toggleURLWarning = useURLWarningToggle()
  const showURLWarning = useURLWarningVisible()
  const showAnnouncement = !!announcement

  if (showAnnouncement) {
    return <PhishAlert isActive={showAnnouncement}>{announcement}</PhishAlert>
  }

  return isMobile ? (
    <PhishAlert isActive={showURLWarning}>
      <div style={{ display: 'flex' }}>
        <AlertTriangle style={{ marginRight: 6 }} size={12} /> Make sure the URL is
        <code style={{ padding: '0 4px', display: 'inline', fontWeight: 'bold' }}>
          {/* app.uniswap.org */}
          {url}
        </code>
      </div>
      <StyledClose size={12} onClick={toggleURLWarning} />
    </PhishAlert>
  ) : window.location.hostname === url ? (
    <PhishAlert isActive={showURLWarning}>
      <div style={{ display: 'flex' }}>
        <AlertTriangle style={{ marginRight: 6 }} size={12} /> Always make sure the URL is
        <code style={{ padding: '0 4px', display: 'inline', fontWeight: 'bold' }}>
          {/* app.uniswap.org */}
          {url}
        </code>{' '}
        - bookmark it to be safe.
      </div>
      <StyledClose size={12} onClick={toggleURLWarning} />
    </PhishAlert>
  ) : null
}
// TODO: file delete from original
// TODO: decide whether to keep it as is or not
