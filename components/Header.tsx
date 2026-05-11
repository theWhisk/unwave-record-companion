import React from 'react';
import Link from 'next/link';
import { staatliches } from '@/styles/fonts';

const MONO = 'ui-monospace, "SF Mono", Menlo, Consolas, monospace';

const navLinkStyle: React.CSSProperties = {
  fontFamily: MONO, fontSize: 11, letterSpacing: '0.18em',
  textTransform: 'uppercase', color: 'var(--dark)', textDecoration: 'none',
};

export default function Header() {
  return (
    <header style={{ background: '#fff' }}>
      <div style={{
        maxWidth: 1120, margin: '0 auto', padding: '18px 32px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 24,
      }}>
        <Link href="/" style={{
          display: 'inline-flex', alignItems: 'center', gap: 12,
          textDecoration: 'none', color: 'var(--ink)',
        }}>
          <span style={{
            fontFamily: staatliches.style.fontFamily,
            fontSize: 26, lineHeight: 1, letterSpacing: '0.04em',
          }}>
            Unwave
          </span>
          <span style={{
            fontFamily: MONO, fontSize: 10, letterSpacing: '0.22em',
            textTransform: 'uppercase', color: 'var(--muted)',
            paddingLeft: 12, marginLeft: 4, borderLeft: '1px solid var(--hairline)',
          }}>
            Network
          </span>
        </Link>

        <nav aria-label="Site navigation" style={{ display: 'flex', alignItems: 'center', gap: 28 }}>
          <a href="#" style={navLinkStyle}>Tools</a>
          <a href="#" style={navLinkStyle}>About</a>
        </nav>
      </div>
      <div style={{ background: 'var(--hairline)', height: 1 }} />
    </header>
  );
}
