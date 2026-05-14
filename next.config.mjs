import fs from 'fs'
import { createRequire } from 'module'
import path from 'path'
import { fileURLToPath } from 'url'

const require = createRequire(import.meta.url)
const { loadEnvConfig } = require('@next/env')

const __dirname = path.dirname(fileURLToPath(import.meta.url))

/** Parse .env-style lines (KEY=value); supports quoted values. */
function parseDotEnv(content) {
  const env = {}
  for (const line of content.split(/\r?\n/)) {
    const t = line.trim()
    if (!t || t.startsWith('#')) continue
    const eq = t.indexOf('=')
    if (eq === -1) continue
    const key = t.slice(0, eq).trim()
    let val = t.slice(eq + 1).trim()
    if (
      (val.startsWith('"') && val.endsWith('"')) ||
      (val.startsWith("'") && val.endsWith("'"))
    ) {
      val = val.slice(1, -1).replace(/\\n/g, '\n')
    }
    env[key] = val
  }
  return env
}

/** Match lib/supabase/normalize-url.ts — base URL must not include /rest/v1/. */
function normalizeSupabaseUrl(url) {
  if (!url) return ''
  const base = String(url)
    .trim()
    .replace(/\/+$/, '')
    .replace(/\/rest\/v1\/?$/i, '')
  if (!base) return ''
  try {
    const parsed = new URL(base)
    if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') return ''
    return base
  } catch {
    return ''
  }
}

let fileEnv = {}
const envLocalPath = path.join(__dirname, '.env.local')
if (fs.existsSync(envLocalPath)) {
  try {
    fileEnv = parseDotEnv(fs.readFileSync(envLocalPath, 'utf8'))
  } catch {
    // ignore; fall back to process.env only
  }
}

// Second arg: true in development so .env.development.local etc. match `next dev`
loadEnvConfig(__dirname, process.env.NODE_ENV === 'development')

const supabaseUrl = normalizeSupabaseUrl(
  fileEnv.NEXT_PUBLIC_SUPABASE_URL ??
    process.env.NEXT_PUBLIC_SUPABASE_URL ??
    '',
)
const supabaseAnonKey =
  fileEnv.NEXT_PUBLIC_SUPABASE_ANON_KEY ??
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ??
  ''

/** @type {import('next').NextConfig} */
const nextConfig = {
  env: {
    NEXT_PUBLIC_SUPABASE_URL: supabaseUrl,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: supabaseAnonKey,
  },
  turbopack: {
    root: __dirname,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
}

export default nextConfig
