// SecurityHub/crypto.js — AES-256-GCM encryption utility (Web Crypto API, zero deps)
// All operations are async and run in the browser's native crypto engine.

const ENC = 'UTF-8'
const ALG = { name: 'AES-GCM', length: 256 }
const PBKDF2_ITER = 100_000

const buf2b64 = buf => btoa(String.fromCharCode(...new Uint8Array(buf)))
const b642buf = b64 => Uint8Array.from(atob(b64), c => c.charCodeAt(0))
const str2buf = s => new TextEncoder().encode(s)
const buf2str = b => new TextDecoder().decode(b)

// Derive AES key from master password using PBKDF2
async function deriveKey(password, saltBuf) {
  const raw = await crypto.subtle.importKey('raw', str2buf(password), 'PBKDF2', false, ['deriveKey'])
  return crypto.subtle.deriveKey(
    { name: 'PBKDF2', salt: saltBuf, iterations: PBKDF2_ITER, hash: 'SHA-256' },
    raw, ALG, false, ['encrypt', 'decrypt']
  )
}

// Encrypt plaintext string → base64 ciphertext (salt:iv:cipher)
export async function encrypt(plaintext, password) {
  const salt = crypto.getRandomValues(new Uint8Array(16))
  const iv   = crypto.getRandomValues(new Uint8Array(12))
  const key  = await deriveKey(password, salt)
  const cipher = await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, key, str2buf(plaintext))
  return [buf2b64(salt), buf2b64(iv), buf2b64(cipher)].join(':')
}

// Decrypt base64 ciphertext → plaintext string; throws on wrong password
export async function decrypt(ciphertext, password) {
  const [s, i, c] = ciphertext.split(':')
  const salt  = b642buf(s)
  const iv    = b642buf(i)
  const cipher = b642buf(c)
  const key   = await deriveKey(password, salt)
  const plain = await crypto.subtle.decrypt({ name: 'AES-GCM', iv }, key, cipher)
  return buf2str(plain)
}

// Measure password strength 0-100
export function strengthScore(pw) {
  if (!pw) return 0
  let s = 0
  if (pw.length >= 8)  s += 20
  if (pw.length >= 14) s += 15
  if (pw.length >= 20) s += 10
  if (/[A-Z]/.test(pw)) s += 15
  if (/[a-z]/.test(pw)) s += 10
  if (/[0-9]/.test(pw)) s += 15
  if (/[^A-Za-z0-9]/.test(pw)) s += 15
  return Math.min(s, 100)
}

export function strengthLabel(score) {
  if (score >= 85) return { label: 'Strong',   color: '#34d399' }
  if (score >= 60) return { label: 'Good',     color: '#60a5fa' }
  if (score >= 35) return { label: 'Fair',     color: '#f59e0b' }
  return              { label: 'Weak',    color: '#f87171' }
}

// Generate a random password
export function generatePassword({ length = 18, upper = true, lower = true, digits = true, symbols = true } = {}) {
  const pools = [
    upper   ? 'ABCDEFGHIJKLMNOPQRSTUVWXYZ' : '',
    lower   ? 'abcdefghijklmnopqrstuvwxyz' : '',
    digits  ? '0123456789' : '',
    symbols ? '!@#$%^&*()_+-=[]{}|;:,.<>?' : '',
  ].join('')
  if (!pools) return ''
  const arr = crypto.getRandomValues(new Uint8Array(length))
  return Array.from(arr).map(b => pools[b % pools.length]).join('')
}
