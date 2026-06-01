const API_BASE = import.meta.env.VITE_API_BASE_URL || ''

async function request(path, options = {}) {
  const res = await fetch(`${API_BASE}${path}`, {
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    },
    ...options,
  })

  const contentType = res.headers.get('content-type') || ''
  const data = contentType.includes('application/json') ? await res.json() : await res.text()

  if (!res.ok) {
    const message = typeof data === 'object' ? data.detail || JSON.stringify(data) : data
    throw new Error(message || `Request failed: ${res.status}`)
  }

  return data
}

async function download(path, filename) {
  const res = await fetch(`${API_BASE}${path}`)

  if (!res.ok) {
    const message = await res.text()
    throw new Error(message || `Download failed: ${res.status}`)
  }

  const blob = await res.blob()
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  link.remove()
  URL.revokeObjectURL(url)
}

export const api = {
  health: () => request('/api/health'),

  authStatus: () => request('/api/auth/status'),
  addCookie: (payload) => request('/api/auth/add-cookie', {
    method: 'POST',
    body: JSON.stringify(payload),
  }),
  verifyAuth: (payload) => request('/api/auth/verify', {
    method: 'POST',
    body: JSON.stringify(payload),
  }),
  deleteAccount: (username) => request(`/api/auth/accounts/${encodeURIComponent(username)}`, {
    method: 'DELETE',
  }),

  previewQuery: (payload) => request('/api/scrape/preview-query', {
    method: 'POST',
    body: JSON.stringify(payload),
  }),
  startScrape: (payload) => request('/api/scrape/start', {
    method: 'POST',
    body: JSON.stringify(payload),
  }),
  getJob: (jobId) => request(`/api/scrape/jobs/${jobId}`),
  downloadUrl: (jobId) => `${API_BASE}/api/scrape/jobs/${jobId}/download`,
  downloadJob: (jobId) => download(`/api/scrape/jobs/${jobId}/download`, `${jobId}.csv`),
}
