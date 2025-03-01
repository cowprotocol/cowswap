import { MoonPayBuyWidget, MoonPayProvider } from '@moonpay/moonpay-react';

export function BuyPage() {

  return (
    <>
    <MoonPayProvider
            apiKey='pk_test_s0SoPxtuR5AqLEPHNXbzZVdfGCopBO9'
        >
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', margin: 0 }}>
                    <MoonPayBuyWidget
                        variant="embedded"
                        baseCurrencyCode="usd"
                        baseCurrencyAmount="100"
                        defaultCurrencyCode="eth"
                        theme='dark'
                    />
                </div>
        </MoonPayProvider>
    
    </>
  )
}