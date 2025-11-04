// src/api.js
// Robust API helper with service mapping, timeout, and consistent error shapes.

const DEFAULT_TIMEOUT = Number(import.meta.env.VITE_API_TIMEOUT_MS) || 60000

const BASES = {
  notes: import.meta.env.VITE_API_NOTES_URL ?? import.meta.env.VITE_API_BASE ?? '',
  reports: import.meta.env.VITE_API_REPORTS_URL ?? import.meta.env.VITE_API_BASE ?? '',
  tasks: import.meta.env.VITE_API_TASKS_URL ?? import.meta.env.VITE_API_BASE ?? ''
}

/**
 * Normalize base parameter:
 * - if base is one of the service keys ('notes'|'reports'|'tasks') -> use mapping
 * - if base is falsy -> use mapping for 'notes' (default)
 * - if base is a full URL (starts with http) -> use as-is
 * - if base is empty string -> treat as relative (use path directly, good for dev proxy)
 */
function resolveBase(base) {
  if (!base) return BASES.notes ?? ''
  if (typeof base === 'string') {
    const normalized = base.trim()
    if (normalized === '') return ''
    if (BASES[normalized]) return BASES[normalized]
    // if base looks like "http..." or "//"
    if (/^https?:\/\//i.test(normalized) || /^\/\//.test(normalized)) return normalized
    // otherwise assume it's a relative base (fallback)
    return normalized
  }
  return ''
}

function buildUrl(base, path) {
  // if path is absolute URL, return it
  if (/^https?:\/\//i.test(path) || /^\/\//.test(path)) return path
  // ensure base and path join correctly
  if (!base) return path
  // ensure single slash between base and path
  return `${base.replace(/\/+$/, '')}/${path.replace(/^\/+/, '')}`
}

async function parseResponseBody(res) {
  const ct = res.headers.get('content-type') || ''
  if (ct.includes('application/json')) {
    try { return await res.json() } catch { return null }
  }
  // try text
  try { return await res.text() } catch { return null }
}

/**
 * apiFetch
 * - path: string path or absolute URL
 * - options:
 *    base: service name ('notes'|'reports'|'tasks') or absolute base URL or '' for relative
 *    method, body, token, headers
 *    timeout: ms (optional)
 */
export async function apiFetch(path, { base = BASES.notes, method = 'GET', body = null, token = null, headers = {}, timeout = DEFAULT_TIMEOUT } = {}) {
  const resolvedBase = resolveBase(base)
  const url = buildUrl(resolvedBase, path)

  const controller = new AbortController()
  const id = setTimeout(() => controller.abort(), timeout)

  const reqHeaders = {
    ...headers
  }
  if (body != null && !(body instanceof FormData)) {
    reqHeaders['Content-Type'] = reqHeaders['Content-Type'] ?? 'application/json'
  }
  if (token) reqHeaders['Authorization'] = `Bearer ${token}`

  const opts = {
    method,
    headers: reqHeaders,
    signal: controller.signal
  }

  if (body != null) {
    // allow FormData to pass through
    opts.body = body instanceof FormData ? body : JSON.stringify(body)
  }

  let res
  try {
    res = await fetch(url, opts)
  } catch (err) {
    clearTimeout(id)
    // normalize fetch errors (timeout or network)
    const e = new Error(err.name === 'AbortError' ? 'Request timeout' : 'Network request failed')
    e.name = err.name
    e.status = 0
    e.body = null
    e.url = url
    throw e
  } finally {
    clearTimeout(id)
  }

  // 204 No Content
  if (res.status === 204) return null

  const parsed = await parseResponseBody(res)

  if (res.status === 401) {
    const e = new Error('Unauthorized')
    e.status = 401
    e.body = parsed
    e.url = url
    throw e
  }

  if (res.status === 403) {
    const e = new Error('Forbidden')
    e.status = 403
    e.body = parsed
    e.url = url
    throw e
  }

  if (!res.ok) {
    const e = new Error(`API Error (${res.status})`)
    e.status = res.status
    e.body = parsed
    e.url = url
    throw e
  }

  return parsed
}

/**
 * serviceFetch(service, path, opts)
 * service: 'notes'|'reports'|'tasks' (or a base URL string)
 * path: endpoint path (e.g. '/notes' or 'notes')
 * opts: forwarded to apiFetch (method, body, token, headers, timeout)
 */
export function serviceFetch(service, path, opts = {}) {
  // if service is a known key, pass it as base name; otherwise treat as base URL
  const base = BASES[service] ? service : (service || BASES.notes)
  return apiFetch(path, { base, ...opts })
}

// export BASES for debugging or dynamic usage
export { BASES }
