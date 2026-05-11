import React from 'react';
import Link from 'next/link';
import { staatliches } from '@/styles/fonts';

const MONO = 'ui-monospace, "SF Mono", Menlo, Consolas, monospace';

function MonoLabel({ children }: { children: React.ReactNode }) {
  return (
    <span style={{
      fontFamily: MONO, fontSize: 10, letterSpacing: '0.18em',
      textTransform: 'uppercase', color: 'var(--muted)',
    }}>
      {children}
    </span>
  );
}

function FooterCol({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <MonoLabel>{title}</MonoLabel>
      <div style={{ marginTop: 12, display: 'flex', flexDirection: 'column', gap: 8 }}>
        {children}
      </div>
    </div>
  );
}

const linkStyle: React.CSSProperties = {
  textDecoration: 'none', color: 'var(--dark)', fontSize: 14,
};

export default function Footer() {
  return (
    <footer style={{ background: '#fff', marginTop: 60 }}>
      <div style={{ background: 'var(--hairline)', height: 1 }} />
      <div style={{
        maxWidth: 1120, margin: '0 auto', padding: '32px 32px 40px',
        display: 'grid', gridTemplateColumns: '1.4fr 1fr 1fr', gap: 32,
      }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 12 }}>
            <span style={{
              fontFamily: staatliches.style.fontFamily,
              fontSize: 24, letterSpacing: '0.04em',
            }}>
              Unwave
            </span>
            <MonoLabel>Network</MonoLabel>
          </div>
          <p style={{
            margin: '10px 0 0', maxWidth: 360, fontSize: 13,
            lineHeight: 1.55, color: 'var(--muted)',
          }}>
            Small, useful tools for the physical world. Crate Mole is the first — more coming.
          </p>
          <p style={{ margin: '18px 0 0' }}>
            <MonoLabel>© {new Date().getFullYear()} Unwave Network</MonoLabel>
          </p>
        </div>

        <FooterCol title="Tools">
          <Link href="/" style={linkStyle}>Crate Mole</Link>
          <span style={{ color: 'var(--muted)', fontSize: 14 }}>Coming soon</span>
        </FooterCol>

        <FooterCol title="Legal">
          <Link href="/tos" style={linkStyle}>Terms of service</Link>
          <Link href="/privacy-policy" style={linkStyle}>Privacy policy</Link>
          <a href="#" style={linkStyle}>Contact</a>
        </FooterCol>
      </div>
    </footer>
  );
}
