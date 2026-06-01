const BACKEND_API_BASE_URL = process.env.BACKEND_API_BASE_URL || ''
const BACKEND_API_KEY = process.env.BACKEND_API_KEY || ''

function sendJson(res, statusCode, body) {
  res.statusCode = statusCode
  res.setHeader('Content-Type', 'application/json')
  res.end(JSON.stringify(body))
}

async function readBody(req) {
  const chunks = []

  for await (const chunk of req) {
    chunks.push(chunk)
  }

  return Buffer.concat(chunks)
}

export async function proxy(req, res, path) {
  if (!BACKEND_API_BASE_URL) {
    sendJson(res, 500, { detail: 'Missing BACKEND_API_BASE_URL' })
    return
  }

  const incomingUrl = new URL(req.url, `https://${req.headers.host || 'localhost'}`)
  const backendUrl = new URL(BACKEND_API_BASE_URL)

  if (backendUrl.host === incomingUrl.host) {
    sendJson(res, 500, {
      detail: 'BACKEND_API_BASE_URL points to this Vercel app. Set it to the Koyeb backend URL instead.',
    })
    return
  }

  const targetUrl = new URL(`${path}${incomingUrl.search}`, BACKEND_API_BASE_URL)
  const method = req.method || 'GET'
  const headers = {
    Accept: req.headers.accept || 'application/json',
  }

  if (req.headers['content-type']) {
    headers['Content-Type'] = req.headers['content-type']
  }

  if (BACKEND_API_KEY) {
    headers['X-API-Key'] = BACKEND_API_KEY
  }

  const response = await fetch(targetUrl, {
    method,
    headers,
    body: method !== 'GET' && method !== 'HEAD' ? await readBody(req) : undefined,
  })

  res.statusCode = response.status

  response.headers.forEach((value, key) => {
    const lowerKey = key.toLowerCase()
    if (!['content-encoding', 'content-length', 'transfer-encoding'].includes(lowerKey)) {
      res.setHeader(key, value)
    }
  })

  res.end(Buffer.from(await response.arrayBuffer()))
}
