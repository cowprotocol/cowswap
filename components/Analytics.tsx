import React, { useState, useEffect } from 'react';
import Router from 'next/router'
import ReactGA from 'react-ga';
import { isMobile } from 'react-device-detect'

const trackingId = process.env.NEXT_PUBLIC_GOOGLE_ANALYTICS;


function handleRouteChange(url: string) {
  console.log('[Analytics] Page view', url)
  ReactGA.pageview(url);
}

function initializeAnalytics() {
  console.log('[Analytics] Tracking ID', trackingId)
  ReactGA.initialize(trackingId, {
    gaOptions: {
      storage: 'none',
      storeGac: false,
    },
  })
  ReactGA.set({
    anonymizeIp: true,
    customBrowserType: !isMobile
      ? 'desktop'
      : 'web3' in window || 'ethereum' in window
        ? 'mobileWeb3'
        : 'mobileRegular',
  })


  // Handle all route changes
  handleRouteChange(Router.pathname)
  Router.events.on('routeChangeComplete', handleRouteChange)
}

export function Analytics() {

  // Internal state
  const [analytics, setAnalytics] = useState({
    isInitialized: false
  })

  // Use effect is used so the code is only executed client side (not server side)
  useEffect(() => {
    const { isInitialized } = analytics

    // Initialize Analytics
    if (trackingId && !isInitialized) {
      initializeAnalytics()
      setAnalytics(prev => ({
        ...prev,
        isInitialized: true
      }))
    }

    return () => {
      // clean up
      if (isInitialized) {
        Router.events.off('routeChangeComplete', handleRouteChange);
      }
    }
  }, [analytics])

  return null
}
