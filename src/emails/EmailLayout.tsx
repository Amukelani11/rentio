import * as React from 'react'
import { JSX } from 'react'

// Brand colors matching Rentio's design system
export const BRAND_COLORS = {
  primary: {
    50: '#FFF5F5',
    100: '#FFE8E8',
    200: '#FFBDBD',
    300: '#FF8989',
    400: '#FF5A5F',
    500: '#FF383D',
    600: '#E53237',
    700: '#CC282D',
    800: '#B31F24',
    900: '#99151A',
  },
  charcoal: {
    50: '#F8F8F9',
    100: '#F0F0F2',
    200: '#D8D9DD',
    300: '#B1B3B9',
    400: '#7B7E87',
    500: '#1F1F23',
    600: '#1B1B1F',
    700: '#161619',
    800: '#121214',
    900: '#0E0E0F',
  },
  status: {
    success: '#22c55e',
    warning: '#f59e0b',
    error: '#ef4444',
    info: '#3b82f6',
  }
}

export const SITE_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://rentio.co.za'

interface EmailLayoutProps {
  title: string
  preview?: string
  children: React.ReactNode
  footer?: React.ReactNode
}

export function EmailLayout({ title, preview, children, footer }: EmailLayoutProps) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta httpEquiv="x-ua-compatible" content="ie=edge" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="x-apple-disable-message-reformatting" />
        <title>{title}</title>
        {preview && <meta name="email-preview" content={preview} />}
      </head>
      <body style={{
        margin: 0,
        backgroundColor: BRAND_COLORS.charcoal[50],
        color: BRAND_COLORS.charcoal[500],
        fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, Segoe UI, Roboto, Oxygen, Ubuntu, Cantarell, sans-serif',
        WebkitTextSizeAdjust: '100%',
        lineHeight: 1.6,
      }}>
        {/* Email wrapper */}
        <table
          width="100%"
          cellPadding={0}
          cellSpacing={0}
          role="presentation"
          style={{
            backgroundColor: BRAND_COLORS.charcoal[50],
            padding: '32px 0',
            borderCollapse: 'collapse',
          }}
        >
          <tbody>
            <tr>
              <td>
                {/* Main content container */}
                <table
                  cellPadding={0}
                  cellSpacing={0}
                  role="presentation"
                  style={{
                    width: '100%',
                    maxWidth: '600px',
                    margin: '0 auto',
                    backgroundColor: '#ffffff',
                    borderRadius: '16px',
                    overflow: 'hidden',
                    boxShadow: '0 4px 20px rgba(31, 31, 35, 0.08)',
                    borderCollapse: 'collapse',
                  }}
                >
                  <tbody>
                    {/* Header */}
                    <tr>
                      <td style={{
                        padding: '24px',
                        background: 'linear-gradient(135deg, rgba(255, 90, 95, 0.12), rgba(255, 90, 95, 0.04))',
                        borderBottom: '1px solid rgba(255, 90, 95, 0.1)',
                      }}>
                        <table width="100%" cellPadding={0} cellSpacing={0} role="presentation">
                          <tbody>
                            <tr>
                              <td align="center">
                                <img
                                  src="https://rentio-public.s3.amazonaws.com/rentiologo.png"
                                  alt="Rentio"
                                  width={120}
                                  height={32}
                                  style={{
                                    display: 'block',
                                    maxWidth: '120px',
                                    height: 'auto',
                                  }}
                                />
                              </td>
                            </tr>
                          </tbody>
                        </table>
                      </td>
                    </tr>

                    {/* Main content */}
                    <tr>
                      <td style={{
                        padding: '32px 24px',
                      }}>
                        {children}
                      </td>
                    </tr>

                    {/* Footer */}
                    <tr>
                      <td style={{
                        padding: '24px',
                        backgroundColor: BRAND_COLORS.charcoal[50],
                        borderTop: '1px solid #e5e7eb',
                        fontSize: '14px',
                        color: BRAND_COLORS.charcoal[400],
                        textAlign: 'center',
                      }}>
                        {footer || (
                          <>
                            <p style={{ margin: '0 0 12px 0' }}>
                              You're receiving this email because you have a Rentio account.
                            </p>
                            <p style={{ margin: '0 0 12px 0' }}>
                              © {new Date().getFullYear()} Rentio. All rights reserved.
                            </p>
                            <p style={{ margin: 0 }}>
                              <a
                                href={`${SITE_URL}/privacy`}
                                style={{
                                  color: BRAND_COLORS.charcoal[500],
                                  textDecoration: 'underline',
                                  marginRight: '16px',
                                }}
                              >
                                Privacy Policy
                              </a>
                              <a
                                href={`${SITE_URL}/terms`}
                                style={{
                                  color: BRAND_COLORS.charcoal[500],
                                  textDecoration: 'underline',
                                  marginRight: '16px',
                                }}
                              >
                                Terms of Service
                              </a>
                              <a
                                href={`${SITE_URL}/contact`}
                                style={{
                                  color: BRAND_COLORS.charcoal[500],
                                  textDecoration: 'underline',
                                }}
                              >
                                Contact Us
                              </a>
                            </p>
                          </>
                        )}
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

interface EmailButtonProps {
  href: string
  children: React.ReactNode
  variant?: 'primary' | 'secondary' | 'success' | 'warning'
  size?: 'sm' | 'md' | 'lg'
  fullWidth?: boolean
}

export function EmailButton({ href, children, variant = 'primary', size = 'md', fullWidth = false }: EmailButtonProps) {
  const getButtonStyles = () => {
    const baseStyles = {
      display: 'inline-block',
      textAlign: 'center' as const,
      textDecoration: 'none',
      borderRadius: '8px',
      fontWeight: 600,
      transition: 'all 0.2s ease',
    }

    const variants = {
      primary: {
        backgroundColor: BRAND_COLORS.primary[500],
        color: '#ffffff',
        border: 'none',
      },
      secondary: {
        backgroundColor: BRAND_COLORS.charcoal[100],
        color: BRAND_COLORS.charcoal[700],
        border: `1px solid ${BRAND_COLORS.charcoal[200]}`,
      },
      success: {
        backgroundColor: BRAND_COLORS.status.success,
        color: '#ffffff',
        border: 'none',
      },
      warning: {
        backgroundColor: BRAND_COLORS.status.warning,
        color: '#ffffff',
        border: 'none',
      },
    }

    const sizes = {
      sm: {
        padding: '8px 16px',
        fontSize: '14px',
      },
      md: {
        padding: '12px 24px',
        fontSize: '16px',
      },
      lg: {
        padding: '16px 32px',
        fontSize: '18px',
      },
    }

    return {
      ...baseStyles,
      ...variants[variant],
      ...sizes[size],
      width: fullWidth ? '100%' : 'auto',
    }
  }

  return (
    <a href={href} style={getButtonStyles()}>
      {children}
    </a>
  )
}

interface EmailCardProps {
  children: React.ReactNode
  padding?: 'sm' | 'md' | 'lg'
  background?: 'white' | 'gray' | 'primary' | 'success' | 'warning' | 'error'
  border?: boolean
  borderColor?: string
}

export function EmailCard({ children, padding = 'md', background = 'white', border = true, borderColor }: EmailCardProps) {
  const paddingMap = {
    sm: '16px',
    md: '24px',
    lg: '32px',
  }

  const backgroundMap = {
    white: '#ffffff',
    gray: BRAND_COLORS.charcoal[50],
    primary: `${BRAND_COLORS.primary[50]}20`,
    success: `${BRAND_COLORS.status.success}10`,
    warning: `${BRAND_COLORS.status.warning}10`,
    error: `${BRAND_COLORS.status.error}10`,
  } satisfies Record<Required<EmailCardProps>['background'], string>

  return (
    <div style={{
      backgroundColor: backgroundMap[background],
      padding: paddingMap[padding],
      borderRadius: '12px',
      border: border ? `1px solid ${borderColor || BRAND_COLORS.charcoal[200]}` : 'none',
      margin: '16px 0',
    }}>
      {children}
    </div>
  )
}

interface EmailSectionProps {
  children: React.ReactNode
  spacing?: 'sm' | 'md' | 'lg'
}

export function EmailSection({ children, spacing = 'md' }: EmailSectionProps) {
  const spacingMap = {
    sm: '16px',
    md: '24px',
    lg: '32px',
  }

  return (
    <div style={{
      marginBottom: spacingMap[spacing],
    }}>
      {children}
    </div>
  )
}

interface EmailHeadingProps {
  level?: 1 | 2 | 3 | 4
  children: React.ReactNode
  align?: 'left' | 'center' | 'right'
}

export function EmailHeading({ level = 2, children, align = 'left' }: EmailHeadingProps) {
  const styles = {
    1: {
      fontSize: '24px',
      fontWeight: 700,
      color: BRAND_COLORS.charcoal[800],
      margin: '0 0 16px 0',
    },
    2: {
      fontSize: '20px',
      fontWeight: 600,
      color: BRAND_COLORS.charcoal[700],
      margin: '0 0 12px 0',
    },
    3: {
      fontSize: '18px',
      fontWeight: 600,
      color: BRAND_COLORS.charcoal[600],
      margin: '0 0 8px 0',
    },
    4: {
      fontSize: '16px',
      fontWeight: 600,
      color: BRAND_COLORS.charcoal[600],
      margin: '0 0 8px 0',
    },
  }

  const HeadingTag = `h${level}` as keyof JSX.IntrinsicElements

  return (
    <HeadingTag style={{
      ...styles[level],
      textAlign: align,
    }}>
      {children}
    </HeadingTag>
  )
}

interface EmailTextProps {
  children: React.ReactNode
  size?: 'sm' | 'md' | 'lg'
  color?: 'primary' | 'secondary' | 'muted' | 'success' | 'warning' | 'error'
  align?: 'left' | 'center' | 'right'
}

export function EmailText({ children, size = 'md', color = 'primary', align = 'left' }: EmailTextProps) {
  const sizeMap = {
    sm: '14px',
    md: '16px',
    lg: '18px',
  }

  const colorMap = {
    primary: BRAND_COLORS.charcoal[700],
    secondary: BRAND_COLORS.charcoal[600],
    muted: BRAND_COLORS.charcoal[400],
    success: BRAND_COLORS.status.success,
    warning: BRAND_COLORS.status.warning,
    error: BRAND_COLORS.status.error,
  }

  return (
    <p style={{
      fontSize: sizeMap[size],
      color: colorMap[color],
      textAlign: align,
      margin: '0 0 8px 0',
      lineHeight: 1.6,
    }}>
      {children}
    </p>
  )
}

interface EmailDividerProps {
  thickness?: 'thin' | 'thick'
  color?: string
}

export function EmailDivider({ thickness = 'thin', color = BRAND_COLORS.charcoal[200] }: EmailDividerProps) {
  return (
    <hr style={{
      border: 'none',
      borderTop: thickness === 'thick' ? `2px solid ${color}` : `1px solid ${color}`,
      margin: '24px 0',
    }}
    />
  )
}

interface EmailBadgeProps {
  children: React.ReactNode
  variant?: 'primary' | 'success' | 'warning' | 'error'
}

export function EmailBadge({ children, variant = 'primary' }: EmailBadgeProps) {
  const variantStyles = {
    primary: {
      backgroundColor: BRAND_COLORS.primary[100],
      color: BRAND_COLORS.primary[700],
      border: `1px solid ${BRAND_COLORS.primary[200]}`,
    },
    success: {
      backgroundColor: `${BRAND_COLORS.status.success}10`,
      color: BRAND_COLORS.status.success,
      border: `1px solid ${BRAND_COLORS.status.success}33`,
    },
    warning: {
      backgroundColor: `${BRAND_COLORS.status.warning}10`,
      color: BRAND_COLORS.status.warning,
      border: `1px solid ${BRAND_COLORS.status.warning}33`,
    },
    error: {
      backgroundColor: `${BRAND_COLORS.status.error}10`,
      color: BRAND_COLORS.status.error,
      border: `1px solid ${BRAND_COLORS.status.error}33`,
    },
  } satisfies Record<Required<EmailBadgeProps>['variant'], { backgroundColor: string; color: string; border: string }>

  return (
    <span style={{
      display: 'inline-block',
      padding: '4px 10px',
      borderRadius: '999px',
      fontSize: '12px',
      fontWeight: 600,
      textTransform: 'uppercase',
      letterSpacing: '0.05em',
      ...variantStyles[variant],
    }}>
      {children}
    </span>
  )
}