// Centralized assets registry for static files under `public/assets`.
// Usage examples:
//   import { Assets, asset } from '@/assets'
//   <Image src={Assets.logo} ... />
//   <img src={asset('placeholder')}/>

export const ASSET_BASE = '/assets'

export const Assets = {
  logo: `${ASSET_BASE}/logo.svg`,
  heroGrid: `${ASSET_BASE}/hero-grid.svg`,
  placeholder: `${ASSET_BASE}/placeholder-item.svg`,
} as const

export type AssetKey = keyof typeof Assets

export function asset(key: AssetKey): string {
  return Assets[key]
}

