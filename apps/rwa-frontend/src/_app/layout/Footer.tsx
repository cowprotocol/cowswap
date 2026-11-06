'use client'

import { type ReactNode, useId, useState } from 'react'

import {
  COW_DAO_DESCRIPTION,
  COW_DAO_LINK,
  COW_FOOTER_NAV_GROUPS,
  COW_PRODUCT_LINKS,
  COW_SOCIAL_LINKS,
  type CowProductId,
} from '@cowprotocol/common-const/cowLinks'

import Link from 'next/link'

import styles from './Footer.module.css'
import { SocialIcon } from './SocialIcon'

import { CowLogo } from '@/shared/ui/cow-logo'

const PRODUCT_LOGO_HEIGHT = 16
const DAO_LOGO_HEIGHT = 32
const MOO = 'MOOOOOOOOOOOOOOOOOO'
const CURRENT_PRODUCT: CowProductId = 'cowRwa'

export function Footer(): ReactNode {
  const contentId = useId()
  const [isExpanded, setIsExpanded] = useState(false)

  return (
    <footer className={styles.footer}>
      {isExpanded && (
        <div id={contentId}>
          <div className={styles.content}>
            <div className={styles.about}>
              <a className={styles.daoLogo} href={COW_DAO_LINK.href} target="_blank" rel="noopener noreferrer">
                <CowLogo height={DAO_LOGO_HEIGHT} />
                {COW_DAO_LINK.label}
              </a>
              <p className={styles.description}>{COW_DAO_DESCRIPTION}</p>
              <div className={styles.socials}>
                {COW_SOCIAL_LINKS.map(({ id, label, href }) => (
                  <a
                    key={id}
                    className={styles.social}
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={label}
                  >
                    <SocialIcon id={id} />
                  </a>
                ))}
              </div>
            </div>
            <nav className={styles.groups} aria-label="CoW DAO">
              {COW_FOOTER_NAV_GROUPS.map(({ label, links }) => (
                <section key={label} className={styles.group} aria-label={label}>
                  <h4 className={styles.groupTitle}>{label}</h4>
                  <ul className={styles.links}>
                    {links.map((link) => (
                      <li key={link.href}>
                        <a className={styles.link} href={link.href} target="_blank" rel="noopener noreferrer">
                          {link.label}
                        </a>
                      </li>
                    ))}
                  </ul>
                </section>
              ))}
            </nav>
          </div>
          <div className={styles.moo} aria-hidden="true">
            <div className={styles.mooTrack}>
              <b>{MOO}</b>
              <b>{MOO}</b>
            </div>
          </div>
        </div>
      )}
      <div className={styles.bottom}>
        <p className={styles.copyright}>&copy; CoW DAO - {new Date().getFullYear()}</p>
        <div className={styles.products}>
          {COW_PRODUCT_LINKS.map(({ id, label, href }) =>
            id === CURRENT_PRODUCT ? (
              <Link key={id} className={styles.product} href="/">
                <CowLogo height={PRODUCT_LOGO_HEIGHT} />
                {label}
              </Link>
            ) : (
              <a key={id} className={styles.product} href={href} target="_blank" rel="noopener noreferrer">
                <CowLogo height={PRODUCT_LOGO_HEIGHT} />
                {label}
              </a>
            ),
          )}
        </div>
        <button
          className={styles.toggle}
          type="button"
          aria-label={isExpanded ? 'Collapse footer' : 'Expand footer'}
          aria-expanded={isExpanded}
          aria-controls={isExpanded ? contentId : undefined}
          onClick={() => setIsExpanded((expanded) => !expanded)}
        >
          <ToggleIcon />
        </button>
      </div>
    </footer>
  )
}

function ToggleIcon(): ReactNode {
  return (
    <svg width="22" height="22" viewBox="0 0 22 22" fill="none" aria-hidden="true">
      <circle cx="11" cy="11" r="9.9" stroke="currentColor" strokeWidth="2.2" />
      <path d="M9.1 6.8 13.3 11l-4.2 4.2" stroke="currentColor" strokeWidth="2.2" />
    </svg>
  )
}
