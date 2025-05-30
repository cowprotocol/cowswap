// UTM Attribution Loading System for CowSwap
// Ensures analytics tools have time to capture UTM parameters before navigation

;(function () {
  'use strict'

  // Check if we have UTM parameters that need attribution tracking
  const urlParams = new URLSearchParams(window.location.search)
  const utmParams = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term', 'utm_code']
  const hasUtmParams = utmParams.some((param) => urlParams.has(param))

  // Only show loading screen if we have UTM parameters to track
  if (!hasUtmParams) {
    console.log('[UTM Attribution] No UTM parameters detected, proceeding normally')
    return
  }

  console.log('[UTM Attribution] UTM parameters detected, starting attribution loading process')

  // Create loading overlay
  const loadingOverlay = document.createElement('div')
  loadingOverlay.id = 'utm-loading-overlay'
  loadingOverlay.innerHTML = `
    <style>
      #utm-loading-overlay {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%);
        color: white;
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        z-index: 999999;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      }
      .utm-spinner {
        width: 40px;
        height: 40px;
        border: 4px solid rgba(255, 255, 255, 0.3);
        border-radius: 50%;
        border-top-color: white;
        animation: utm-spin 1s ease-in-out infinite;
        margin-bottom: 20px;
      }
      @keyframes utm-spin {
        to { transform: rotate(360deg); }
      }
      .utm-message {
        font-size: 18px;
        text-align: center;
        margin-bottom: 10px;
      }
      .utm-details {
        font-size: 14px;
        opacity: 0.8;
        text-align: center;
      }
    </style>
    <div class="utm-spinner"></div>
    <div class="utm-message">Preparing your experience...</div>
    <div class="utm-details">Initializing analytics tracking</div>
  `

  // Add loading overlay immediately
  document.documentElement.appendChild(loadingOverlay)

  // PREVENT REACT FROM INITIALIZING until attribution is complete
  // Set a global flag that the app should check before starting
  window._utmAttributionInProgress = true
  console.log('[UTM Attribution] Set flag to block React initialization until attribution complete')

  // Analytics initialization tracking
  let gtmLoaded = false
  let safaryLoaded = false
  let timeoutReached = false

  function checkAnalyticsReady() {
    // Check if GTM is loaded - look for dataLayer and google_tag_manager
    if (
      window.dataLayer ||
      window.gtag ||
      (window.google_tag_manager && Object.keys(window.google_tag_manager).length > 0)
    ) {
      gtmLoaded = true
    }

    // Check if Safary SDK is loaded - look for the specific script and window.safary
    const safaryScript =
      document.querySelector('script[data-name="safary-sdk"]') || document.querySelector('script[src*="safary"]')
    if (window.safary || safaryScript) {
      safaryLoaded = true
    }

    const analyticsReady = gtmLoaded && safaryLoaded // Both should be loaded for best attribution

    console.log('[UTM Attribution] Analytics status:', {
      gtmLoaded,
      safaryLoaded,
      analyticsReady,
      timeoutReached,
      dataLayer: !!window.dataLayer,
      safaryGlobal: !!window.safary,
      safaryScript: !!safaryScript,
    })

    return analyticsReady
  }

  function completeAttributionAndRedirect() {
    console.log('[UTM Attribution] Attribution complete, proceeding to app')

    // Store UTM parameters for the app to use
    const utmData = {}
    utmParams.forEach((param) => {
      const value = urlParams.get(param)
      if (value) utmData[param] = value
    })

    // Store in sessionStorage for the app to pick up
    sessionStorage.setItem('cowswap_utm_attribution', JSON.stringify(utmData))
    console.log('[UTM Attribution] Stored UTM data in sessionStorage:', utmData)

    // Remove loading overlay
    loadingOverlay.remove()

    // Continue to app without UTM parameters in URL
    const cleanPath = window.location.pathname === '/' ? '/#/' : window.location.pathname
    window.history.replaceState(null, '', cleanPath)
    console.log('[UTM Attribution] Redirected to clean path:', cleanPath)

    // Allow normal app initialization
    window._utmAttributionComplete = true
    window._utmAttributionInProgress = false
    console.log('[UTM Attribution] Cleared flag - React can now initialize')
  }

  // Wait for analytics scripts with timeout
  let attempts = 0
  const maxAttempts = 50 // 5 seconds max wait
  const checkInterval = 100 // Check every 100ms

  const attributionInterval = setInterval(() => {
    attempts++

    const analyticsReady = checkAnalyticsReady()

    // If both are ready, give them a bit more time and proceed
    if (analyticsReady) {
      clearInterval(attributionInterval)
      console.log('[UTM Attribution] Both GTM and Safary detected, giving extra time for attribution...')
      // Give analytics scripts extra time to actually track
      setTimeout(completeAttributionAndRedirect, 1000)
    }
    // If only GTM is ready and we've waited a reasonable time, proceed
    else if (gtmLoaded && attempts >= 30) {
      // 3 seconds for Safary to load after GTM
      clearInterval(attributionInterval)
      console.log('[UTM Attribution] GTM ready, proceeding (Safary may still be loading)')
      setTimeout(completeAttributionAndRedirect, 500)
    }
    // Hard timeout
    else if (attempts >= maxAttempts) {
      timeoutReached = true
      clearInterval(attributionInterval)
      console.log('[UTM Attribution] Timeout reached, proceeding anyway')
      completeAttributionAndRedirect()
    }
  }, checkInterval)

  // Backup timeout - ensure we never block the user indefinitely
  setTimeout(() => {
    if (!window._utmAttributionComplete) {
      clearInterval(attributionInterval)
      console.log('[UTM Attribution] Hard timeout reached, force proceeding')
      completeAttributionAndRedirect()
    }
  }, 10000) // 10 second hard timeout
})()
