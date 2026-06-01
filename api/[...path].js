const BACKEND_API_BASE_URL = process.env.BACKEND_API_BASE_URL || ''
const BACKEND_API_KEY = process.env.BACKEND_API_KEY || ''

function send(res, statusCode, body) {
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

export default async function handler(req, res) {
  if (!BACKEND_API_BASE_URL) {
    send(res, 500, { detail: 'Missing BACKEND_API_BASE_URL' })
    return
  }

  const incomingUrl = new URL(req.url, `https://${req.headers.host || 'localhost'}`)
  const targetPath = incomingUrl.pathname.startsWith('/api')
    ? incomingUrl.pathname
    : `/api${incomingUrl.pathname}`
  const targetUrl = new URL(`${targetPath}${incomingUrl.search}`, BACKEND_API_BASE_URL)
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

  const hasBody = method !== 'GET' && method !== 'HEAD'
  const response = await fetch(targetUrl, {
    method,
    headers,
    body: hasBody ? await readBody(req) : undefined,
  })

  res.statusCode = response.status

  response.headers.forEach((value, key) => {
    if (!['content-encoding', 'content-length', 'transfer-encoding'].includes(key.toLowerCase())) {
      res.setHeader(key, value)
    }
  })

  const buffer = Buffer.from(await response.arrayBuffer())
  res.end(buffer)
}
