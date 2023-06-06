import { useEffect, useState } from 'react'

import useIsWindowVisible from 'legacy/hooks/useIsWindowVisible'

import { useWalletInfo } from 'modules/wallet'

import { getProfileData } from 'api/gnosisProtocol'
import { ProfileData } from 'api/gnosisProtocol/api'

type FetchProfileState = {
  profileData: ProfileData | null
  error: string
  isLoading: boolean
}

const emptyState: FetchProfileState = {
  profileData: null,
  error: '',
  isLoading: false,
}

const FETCH_INTERVAL_IN_MINUTES = 5

export default function useFetchProfile(): FetchProfileState {
  const { account, chainId } = useWalletInfo()
  const [profile, setProfile] = useState<FetchProfileState>(emptyState)
  const isWindowVisible = useIsWindowVisible()

  useEffect(() => {
    if (!isWindowVisible) {
      console.debug('[useFetchProfile] No need to fetch profile info')
      return
    }

    async function fetchAndSetProfileData() {
      console.debug('[useFetchProfile] Fetching profile info')
      try {
        if (chainId && account) {
          setProfile((profile) => ({ ...profile, isLoading: true, error: '' }))
          const profileData = await getProfileData(chainId, account)
          setProfile((profile) => ({ ...profile, isLoading: false, profileData }))
        } else {
          setProfile(emptyState)
        }
      } catch (error: any) {
        console.error(error)
        setProfile((profile) => ({
          ...profile,
          isLoading: false,
          error: 'There was an error while fetching the profile data',
        }))
      }
    }

    console.debug('[useFetchProfile] No need to fetch profile info')
    const intervalId = setInterval(fetchAndSetProfileData, FETCH_INTERVAL_IN_MINUTES * 60_000)

    fetchAndSetProfileData()
    return () => clearInterval(intervalId)
  }, [account, chainId, isWindowVisible])

  return profile
}
