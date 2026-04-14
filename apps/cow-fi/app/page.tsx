import type { ReactNode } from 'react'

const styles = {
  body: {
    margin: 0,
    minHeight: '100vh',
    display: 'grid',
    placeItems: 'center',
    fontFamily: 'Arial, sans-serif',
    background: '#111',
    color: '#fff',
  },
  notice: {
    maxWidth: 720,
    padding: 32,
    margin: 24,
    border: '1px solid #333',
    borderRadius: 12,
    background: '#1a1a1a',
    textAlign: 'center' as const,
    boxShadow: '0 8px 30px rgba(0, 0, 0, 0.35)',
  },
  h1: {
    margin: '0 0 16px',
    fontSize: '2rem',
    lineHeight: 1.2,
  },
  p: {
    margin: 0,
    fontSize: '1.125rem',
    lineHeight: 1.6,
  },
} as const

export default function MaintenancePage(): ReactNode {
  return (
    <main style={{ ...styles.body }}>
      <div style={styles.notice}>
        <h1 style={styles.h1}>Maintenance</h1>
        <p style={styles.p}>The cow.fi domain is currently under maintenance. We&apos;ll be back shortly.</p>
      </div>
    </main>
  )
}
