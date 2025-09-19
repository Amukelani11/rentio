// Removed Drizzle usage across the codebase. This shim intentionally throws at runtime to prevent accidental use.
// Use the Supabase JS client instead for server-side DB operations.

export function _drizzle_shim_error() {
  throw new Error("Drizzle has been removed from the project. Use Supabase JS (createClient) for DB operations. If you see this error, replace imports from '@/lib/db' with Supabase client calls.")
}

export const query = () => _drizzle_shim_error()
export const queryOne = () => _drizzle_shim_error()
export const insert = () => _drizzle_shim_error()
export const update = () => _drizzle_shim_error()
export const remove = () => _drizzle_shim_error()
export const find = () => _drizzle_shim_error()
export const findOne = () => _drizzle_shim_error()
export const count = () => _drizzle_shim_error()
export const transaction = () => _drizzle_shim_error()