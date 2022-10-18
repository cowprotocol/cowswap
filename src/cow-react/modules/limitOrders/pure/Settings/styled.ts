import styled from 'styled-components/macro'

export const SettingsTitle = styled.h3`
  font-weight: 600;
  font-size: 14px;
  color: ${({ theme }) => theme.text1};
  margin: 0 0 12px 0;
`

export const SettingsContainer = styled.div`
  margin-top: 12px;
  background: ${({ theme }) => theme.bg5};
  padding: 1rem;
  border-radius: 12px;
  box-shadow: 0 0 0 rgb(0 0 0 / 1%), 0 4px 8px rgb(0 0 0 / 0%), 0 16px 24px rgb(0 0 0 / 60%),
    0 24px 32px rgb(0 0 0 / 20%);
`

export const SettingsBox = styled.div`
  display: flex;
  justify-content: space-between;
  margin-bottom: 10px;

  :last-child {
    margin-bottom: 0;
  }
`

export const SettingsBoxTitle = styled.div`
  display: flex;
  align-items: center;
  font-weight: 400;
  color: ${({ theme }) => theme.text1};
  font-size: 14px;
  opacity: 0.85;
  margin-right: 2rem;
`
