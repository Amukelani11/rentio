import * as React from 'react'

export function BaseLayout({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta httpEquiv="x-ua-compatible" content="ie=edge" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title>{title}</title>
      </head>
      <body style={{ margin: 0, backgroundColor: '#f8fafc', color: '#0f172a', fontFamily: 'Inter, -apple-system, Segoe UI, Helvetica, Arial, sans-serif' }}>
        <table width="100%" cellPadding={0} cellSpacing={0} role="presentation" style={{ backgroundColor: '#f8fafc', padding: '24px 0' }}>
          <tbody>
            <tr>
              <td>
                <table width="100%" cellPadding={0} cellSpacing={0} role="presentation" style={{ maxWidth: 640, margin: '0 auto', backgroundColor: '#ffffff', borderRadius: 16, overflow: 'hidden', boxShadow: '0 4px 20px rgba(15,23,42,0.06)' }}>
                  <tbody>
                    <tr>
                      <td style={{ padding: 20, background: 'linear-gradient(90deg, rgba(255,90,95,0.08), rgba(255,90,95,0))' }}>
                        <img src="https://rentio-public.s3.amazonaws.com/rentiologo.png" alt="Rentio" height={24} style={{ display: 'block' }} />
                      </td>
                    </tr>
                    <tr>
                      <td style={{ padding: 24 }}>
                        {children}
                      </td>
                    </tr>
                    <tr>
                      <td style={{ padding: 20, backgroundColor: '#f1f5f9', color: '#475569', fontSize: 12 }}>
                        <div>You're receiving this email because you have a Rentio account.</div>
                        <div style={{ marginTop: 6 }}>© {new Date().getFullYear()} Rentio. All rights reserved.</div>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </td>
            </tr>
          </tbody>
        </table>
      </body>
    </html>
  )
}
